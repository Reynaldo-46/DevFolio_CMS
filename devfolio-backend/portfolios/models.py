from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import URLValidator


class Portfolio(models.Model):
    """Main Portfolio Model"""
    
    TEMPLATE_CHOICES = [
        ('modern', 'Modern'),
        ('minimal', 'Minimal'),
        ('creative', 'Creative'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='portfolio'
    )
    
    # Basic Info
    title = models.CharField(max_length=200, default='My Portfolio')
    tagline = models.CharField(max_length=300, blank=True)
    bio = models.TextField(blank=True)
    
    # Template & Design
    template = models.CharField(max_length=50, choices=TEMPLATE_CHOICES, default='modern')
    primary_color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    secondary_color = models.CharField(max_length=7, default='#1E40AF')
    font_family = models.CharField(max_length=100, default='Inter')
    
    # Domain
    subdomain = models.CharField(max_length=100, unique=True)
    custom_domain = models.CharField(max_length=255, blank=True, validators=[URLValidator()])
    
    # Status
    is_published = models.BooleanField(default=False)
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'portfolios'
        verbose_name = 'Portfolio'
        verbose_name_plural = 'Portfolios'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s Portfolio"
    
    def save(self, *args, **kwargs):
        if not self.subdomain:
            self.subdomain = slugify(self.user.username)
        super().save(*args, **kwargs)


class SocialLink(models.Model):
    """Social Media Links"""
    
    PLATFORM_CHOICES = [
        ('github', 'GitHub'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('youtube', 'YouTube'),
        ('dribbble', 'Dribbble'),
        ('behance', 'Behance'),
        ('medium', 'Medium'),
        ('dev', 'Dev.to'),
        ('stackoverflow', 'Stack Overflow'),
        ('other', 'Other'),
    ]
    
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='social_links'
    )
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    url = models.URLField()
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'social_links'
        ordering = ['display_order']
        unique_together = ['portfolio', 'platform']
    
    def __str__(self):
        return f"{self.platform} - {self.portfolio.user.username}"


class Skill(models.Model):
    """Skills Section"""
    
    CATEGORY_CHOICES = [
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('mobile', 'Mobile'),
        ('database', 'Database'),
        ('devops', 'DevOps'),
        ('design', 'Design'),
        ('other', 'Other'),
    ]
    
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    proficiency = models.IntegerField(default=50)  # 0-100
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'skills'
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.name} - {self.portfolio.user.username}"


class Experience(models.Model):
    """Work Experience"""
    
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Null = Current
    is_current = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'experiences'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.position} at {self.company}"


class Education(models.Model):
    """Education Background"""
    
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='education'
    )
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'education'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.degree} at {self.institution}"