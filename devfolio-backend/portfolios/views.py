from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Portfolio, SocialLink, Skill, Experience, Education
from .serializers import (
    PortfolioSerializer, PortfolioCreateUpdateSerializer,
    SocialLinkSerializer, SkillSerializer,
    ExperienceSerializer, EducationSerializer
)


class PortfolioViewSet(viewsets.ModelViewSet):
    """Portfolio CRUD operations"""
    
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if self.action == 'list':
            return Portfolio.objects.filter(is_published=True)
        return Portfolio.objects.all()
    
    queryset = Portfolio.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PortfolioCreateUpdateSerializer
        return PortfolioSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_portfolio(self, request):
        """Get current user's portfolio"""
        try:
            portfolio = Portfolio.objects.get(user=request.user)
            serializer = self.get_serializer(portfolio)
            return Response(serializer.data)
        except Portfolio.DoesNotExist:
            return Response(
                {'error': 'Portfolio not found. Please create a portfolio first.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='by-username/(?P<username>[^/.]+)')
    def by_username(self, request, username=None):
        """Get portfolio by username"""
        portfolio = get_object_or_404(Portfolio, user__username=username, is_published=True)
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)


class SocialLinkViewSet(viewsets.ModelViewSet):
    """Social Links CRUD"""
    
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        return SocialLink.objects.filter(portfolio=portfolio)
    
    def perform_create(self, serializer):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        serializer.save(portfolio=portfolio)


class SkillViewSet(viewsets.ModelViewSet):
    """Skills CRUD"""
    
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        return Skill.objects.filter(portfolio=portfolio).order_by('-proficiency', 'name')
    
    def perform_create(self, serializer):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        serializer.save(portfolio=portfolio)


class ExperienceViewSet(viewsets.ModelViewSet):
    """Experience CRUD"""
    
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        return Experience.objects.filter(portfolio=portfolio).order_by('-start_date')
    
    def perform_create(self, serializer):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        serializer.save(portfolio=portfolio)


class EducationViewSet(viewsets.ModelViewSet):
    """Education CRUD"""
    
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        return Education.objects.filter(portfolio=portfolio).order_by('-start_date')
    
    def perform_create(self, serializer):
        # Get portfolio or create one if doesn't exist
        portfolio, created = Portfolio.objects.get_or_create(
            user=self.request.user,
            defaults={
                'title': f"{self.request.user.username}'s Portfolio",
                'bio': 'Tell us about yourself...',
                'is_published': False
            }
        )
        serializer.save(portfolio=portfolio)