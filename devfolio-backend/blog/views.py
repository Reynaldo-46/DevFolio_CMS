from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost, Category, Tag, Comment
from .serializers import (
    BlogPostSerializer, BlogPostCreateUpdateSerializer, BlogPostListSerializer,
    CategorySerializer, TagSerializer, CommentSerializer
)


class BlogPostViewSet(viewsets.ModelViewSet):
    """Blog Posts CRUD operations"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['published_at', 'created_at', 'views_count']
    lookup_field = 'slug'
    
    def get_queryset(self):
        if self.request.user.is_authenticated and self.action in ['update', 'partial_update', 'destroy']:
            return BlogPost.objects.filter(author=self.request.user)
        
        # Public view - only published posts
        queryset = BlogPost.objects.filter(status='published')
        
        # Filter by author
        username = self.request.query_params.get('author')
        if username:
            queryset = queryset.filter(author__username=username)
        
        # Filter by category
        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by tag
        tag_slug = self.request.query_params.get('tag_slug')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogPostCreateUpdateSerializer
        return BlogPostSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """Get current user's posts"""
        posts = BlogPost.objects.filter(author=request.user)
        
        status_filter = request.query_params.get('status')
        if status_filter:
            posts = posts.filter(status=status_filter)
        
        serializer = BlogPostListSerializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        """Publish a draft post"""
        post = self.get_object()
        
        if post.status == 'published':
            return Response(
                {'error': 'Post is already published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.status = 'published'
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, slug=None):
        """Unpublish a post"""
        post = self.get_object()
        post.status = 'draft'
        post.save()
        
        serializer = self.get_serializer(post)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """Categories CRUD"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class TagViewSet(viewsets.ModelViewSet):
    """Tags CRUD"""
    
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class CommentViewSet(viewsets.ModelViewSet):
    """Comments CRUD"""
    
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_slug = self.request.query_params.get('post')
        if post_slug:
            return Comment.objects.filter(
                post__slug=post_slug,
                is_approved=True
            )
        return Comment.objects.filter(is_approved=True)
    
    def perform_create(self, serializer):
        post_slug = self.request.data.get('post_slug')
        post = get_object_or_404(BlogPost, slug=post_slug)
        serializer.save(author=self.request.user, post=post)