from django.contrib import admin
from .models import Project, ProjectImage


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'is_featured', 'github_stars', 'created_at']
    list_filter = ['status', 'is_featured', 'created_at']
    search_fields = ['title', 'description', 'user__username']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectImageInline]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'title', 'slug', 'description', 'short_description')
        }),
        ('Links', {
            'fields': ('github_url', 'live_url', 'demo_url')
        }),
        ('Media', {
            'fields': ('thumbnail', 'cover_image')
        }),
        ('Details', {
            'fields': ('tech_stack', 'features', 'status')
        }),
        ('GitHub', {
            'fields': ('github_repo_id', 'github_stars', 'github_forks')
        }),
        ('Display', {
            'fields': ('is_featured', 'display_order')
        }),
    )


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ['project', 'caption', 'display_order']
    list_filter = ['project__user']