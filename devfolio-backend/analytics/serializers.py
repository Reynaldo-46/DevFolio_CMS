from rest_framework import serializers
from .models import PortfolioView, ProjectView


class PortfolioViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioView
        fields = [
            'id', 'ip_address', 'referrer', 'country', 'city',
            'device_type', 'browser', 'os', 'page_url', 'viewed_at'
        ]
        read_only_fields = ['id', 'viewed_at']


class ProjectViewSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = ProjectView
        fields = ['id', 'project_title', 'ip_address', 'referrer', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']