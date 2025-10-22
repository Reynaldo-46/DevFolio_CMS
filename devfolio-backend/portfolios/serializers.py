from rest_framework import serializers
from .models import Portfolio, SocialLink, Skill, Experience, Education


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'display_order']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'proficiency', 'display_order']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id', 'company', 'position', 'location', 'description',
            'start_date', 'end_date', 'is_current', 'display_order'
        ]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study',
            'start_date', 'end_date', 'grade', 'description', 'display_order'
        ]


class PortfolioSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'user', 'username', 'title', 'tagline', 'bio',
            'template', 'primary_color', 'secondary_color', 'font_family',
            'subdomain', 'custom_domain', 'is_published',
            'meta_description', 'meta_keywords',
            'social_links', 'skills', 'experiences', 'education',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'subdomain', 'created_at', 'updated_at']


class PortfolioCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = [
            'title', 'tagline', 'bio', 'template',
            'primary_color', 'secondary_color', 'font_family',
            'custom_domain', 'is_published',
            'meta_description', 'meta_keywords'
        ]