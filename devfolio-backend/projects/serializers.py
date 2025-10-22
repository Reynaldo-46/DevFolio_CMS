from rest_framework import serializers
from .models import Project, ProjectImage


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'caption', 'display_order']


class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'username', 'title', 'slug', 'description', 'short_description',
            'github_url', 'live_url', 'demo_url',
            'thumbnail', 'cover_image', 'images',
            'tech_stack', 'features', 'status',
            'github_repo_id', 'github_stars', 'github_forks',
            'is_featured', 'display_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'github_stars', 'github_forks', 'created_at', 'updated_at']


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'short_description',
            'github_url', 'live_url', 'demo_url',
            'thumbnail', 'cover_image',
            'tech_stack', 'features', 'status',
            'is_featured', 'display_order'
        ]