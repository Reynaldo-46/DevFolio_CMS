from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer
import requests
from django.conf import settings
from rest_framework import parsers


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change user password"""
    
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.data.get('old_password')):
                return Response(
                    {'old_password': ['Wrong password.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.data.get('new_password'))
            user.save()
            
            return Response({
                'message': 'Password updated successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def github_auth(request):
    """GitHub OAuth authentication"""
    
    code = request.data.get('code')
    
    if not code:
        return Response(
            {'error': 'Code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Exchange code for access token
    token_url = 'https://github.com/login/oauth/access_token'
    token_data = {
        'client_id': settings.GITHUB_CLIENT_ID,
        'client_secret': settings.GITHUB_CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.GITHUB_REDIRECT_URI,
    }
    
    token_headers = {'Accept': 'application/json'}
    token_response = requests.post(token_url, data=token_data, headers=token_headers)
    
    if token_response.status_code != 200:
        return Response(
            {'error': 'Failed to get access token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    access_token = token_response.json().get('access_token')
    
    # Get user info from GitHub
    user_url = 'https://api.github.com/user'
    user_headers = {
        'Authorization': f'token {access_token}',
        'Accept': 'application/json'
    }
    user_response = requests.get(user_url, headers=user_headers)
    
    if user_response.status_code != 200:
        return Response(
            {'error': 'Failed to get user info'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    github_user = user_response.json()
    
    # Create or update user
    user, created = User.objects.update_or_create(
        github_id=str(github_user['id']),
        defaults={
            'username': github_user['login'],
            'email': github_user.get('email') or f"{github_user['login']}@github.com",
            'github_username': github_user['login'],
            'github_access_token': access_token,
            'avatar': github_user.get('avatar_url', ''),
            'bio': github_user.get('bio', ''),
            'location': github_user.get('location', ''),
            'website': github_user.get('blog', ''),
        }
    )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        },
        'message': 'GitHub authentication successful'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user"""
    
    try:
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_email(request):
    name = request.data.get('name')
    email = request.data.get('email')
    subject = request.data.get('subject')
    message = request.data.get('message')
    recipient = request.data.get('recipient_username')
    
    # Get portfolio owner's email
    user = User.objects.get(username=recipient)
    
    send_mail(
        subject=f"Portfolio Contact: {subject}",
        message=f"From: {name} ({email})\n\n{message}",
        from_email='noreply@devfolio.com',
        recipient_list=[user.email],
    )
    
    return Response({'message': 'Email sent successfully'})