from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import requests
from django.conf import settings
from .models import Project, ProjectImage
from .serializers import (
    ProjectSerializer, ProjectCreateUpdateSerializer,
    ProjectImageSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    """Projects CRUD operations"""
    
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        if self.request.user.is_authenticated and self.action != 'list':
            return Project.objects.filter(user=self.request.user)
        
        # Public view
        username = self.request.query_params.get('username')
        if username:
            return Project.objects.filter(user__username=username)
        return Project.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def import_from_github(self, request):
        """Import projects from GitHub"""
        user = request.user
        
        if not user.github_access_token:
            return Response(
                {'error': 'GitHub not connected. Please connect your GitHub account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Fetch repos from GitHub
        headers = {
            'Authorization': f'token {user.github_access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        response = requests.get('https://api.github.com/user/repos', headers=headers)
        
        if response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch repositories from GitHub'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        repos = response.json()
        imported_count = 0
        
        for repo in repos:
            # Skip forks if desired
            if repo.get('fork'):
                continue
            
            # Get or create project
            project, created = Project.objects.get_or_create(
                user=user,
                github_repo_id=str(repo['id']),
                defaults={
                    'title': repo['name'],
                    'description': repo.get('description', ''),
                    'github_url': repo['html_url'],
                    'github_stars': repo.get('stargazers_count', 0),
                    'github_forks': repo.get('forks_count', 0),
                    'tech_stack': [repo.get('language')] if repo.get('language') else [],
                }
            )
            
            if created:
                imported_count += 1
            else:
                # Update existing project
                project.github_stars = repo.get('stargazers_count', 0)
                project.github_forks = repo.get('forks_count', 0)
                project.save()
        
        return Response({
            'message': f'Successfully imported {imported_count} projects',
            'total_repos': len(repos),
            'imported': imported_count
        })
    
    @action(detail=True, methods=['post'])
    def sync_github(self, request, slug=None):
        """Sync single project with GitHub"""
        project = self.get_object()
        
        if not project.github_repo_id or not request.user.github_access_token:
            return Response(
                {'error': 'Project not linked to GitHub'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        headers = {
            'Authorization': f'token {request.user.github_access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        response = requests.get(
            f'https://api.github.com/repositories/{project.github_repo_id}',
            headers=headers
        )
        
        if response.status_code == 200:
            repo = response.json()
            project.github_stars = repo.get('stargazers_count', 0)
            project.github_forks = repo.get('forks_count', 0)
            project.save()
            
            return Response({
                'message': 'Project synced successfully',
                'stars': project.github_stars,
                'forks': project.github_forks
            })
        
        return Response(
            {'error': 'Failed to sync with GitHub'},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProjectImageViewSet(viewsets.ModelViewSet):
    """Project Images CRUD"""
    
    serializer_class = ProjectImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_slug = self.request.query_params.get('project')
        if project_slug:
            return ProjectImage.objects.filter(
                project__slug=project_slug,
                project__user=self.request.user
            )
        return ProjectImage.objects.filter(project__user=self.request.user)
    
    def perform_create(self, serializer):
        project_slug = self.request.data.get('project_slug')
        project = get_object_or_404(Project, slug=project_slug, user=self.request.user)
        serializer.save(project=project)