from django.contrib import admin
from .models import PortfolioView, ProjectView


@admin.register(PortfolioView)
class PortfolioViewAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'ip_address', 'device_type', 'browser', 'country', 'viewed_at']
    list_filter = ['device_type', 'browser', 'os', 'country', 'viewed_at']
    search_fields = ['ip_address', 'portfolio__user__username']
    readonly_fields = ['viewed_at']
    
    fieldsets = (
        ('Portfolio', {
            'fields': ('portfolio',)
        }),
        ('Visitor Info', {
            'fields': ('ip_address', 'user_agent', 'referrer')
        }),
        ('Location', {
            'fields': ('country', 'city')
        }),
        ('Device', {
            'fields': ('device_type', 'browser', 'os')
        }),
        ('Page', {
            'fields': ('page_url', 'viewed_at')
        }),
    )


@admin.register(ProjectView)
class ProjectViewAdmin(admin.ModelAdmin):
    list_display = ['project', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['ip_address', 'project__title']
    readonly_fields = ['viewed_at']