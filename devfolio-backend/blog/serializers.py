from rest_framework import serializers
from .models import BlogPost, Category, Tag, Comment


class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'posts_count']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


class TagSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'posts_count']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.ImageField(source='author.avatar', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'author_avatar', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.ImageField(source='author.avatar', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'author_name', 'author_avatar',
            'title', 'slug', 'excerpt', 'content',
            'cover_image', 'category', 'category_name', 'tags',
            'status', 'meta_description', 'meta_keywords',
            'views_count', 'reading_time', 'comments_count', 'comments',
            'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'reading_time', 'published_at', 'created_at', 'updated_at']
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'excerpt', 'content', 'cover_image',
            'category', 'tags', 'status',
            'meta_description', 'meta_keywords'
        ]
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        post = BlogPost.objects.create(**validated_data)
        
        # Handle tags
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name.strip())
            post.tags.add(tag)
        
        return post
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, created = Tag.objects.get_or_create(name=tag_name.strip())
                instance.tags.add(tag)
        
        return instance


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list view"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'author_name', 'title', 'slug', 'excerpt',
            'cover_image', 'category_name', 'tags',
            'views_count', 'reading_time', 'comments_count',
            'published_at', 'created_at'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()