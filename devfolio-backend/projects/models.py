from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Project(models.Model):
    """Project Model"""
    
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('planned', 'Planned'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    
    # Basic Info
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    
    # Links
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    
    # Media
    thumbnail = models.ImageField(upload_to='projects/thumbnails/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='projects/covers/', null=True, blank=True)
    
    # Project Details
    tech_stack = models.JSONField(default=list)  # ['React', 'Django', 'PostgreSQL']
    features = models.JSONField(default=list)  # ['Feature 1', 'Feature 2']
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    
    # GitHub Integration
    github_repo_id = models.CharField(max_length=100, blank=True)
    github_stars = models.IntegerField(default=0)
    github_forks = models.IntegerField(default=0)
    last_synced = models.DateTimeField(null=True, blank=True)
    
    # Display
    is_featured = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-is_featured', 'display_order', '-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ProjectImage(models.Model):
    """Additional Project Images"""
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='projects/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'project_images'
        ordering = ['display_order']
    
    def __str__(self):
        return f"Image for {self.project.title}"