"""
Analytics Models
analytics/models.py
"""

from django.db import models
from django.conf import settings


class PortfolioView(models.Model):
    """Track portfolio page views"""
    
    portfolio = models.ForeignKey(
        'portfolios.Portfolio',  # String reference instead of direct import
        on_delete=models.CASCADE,
        related_name='views'
    )
    
    # Visitor Info
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True, max_length=500)
    
    # Location (can be determined from IP)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Device Info
    device_type = models.CharField(max_length=50, blank=True)  # mobile, tablet, desktop
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    
    # Page Info
    page_url = models.URLField(max_length=500)
    
    # Timestamp
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'portfolio_views'
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['portfolio', '-viewed_at']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"View on {self.portfolio} at {self.viewed_at}"


class ProjectView(models.Model):
    """Track individual project views"""
    
    project = models.ForeignKey(
        'projects.Project',  # String reference instead of direct import
        on_delete=models.CASCADE,
        related_name='analytics_views'
    )
    
    ip_address = models.GenericIPAddressField()
    referrer = models.URLField(blank=True, max_length=500)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_views'
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"View on {self.project.title} at {self.viewed_at}"