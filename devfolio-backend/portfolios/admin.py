from django.contrib import admin
from .models import Portfolio, SocialLink, Skill, Experience, Education


class SocialLinkInline(admin.TabularInline):
    model = SocialLink
    extra = 1


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 1


class ExperienceInline(admin.StackedInline):
    model = Experience
    extra = 0


class EducationInline(admin.StackedInline):
    model = Education
    extra = 0


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'template', 'subdomain', 'is_published', 'created_at']
    list_filter = ['template', 'is_published', 'created_at']
    search_fields = ['user__username', 'title', 'subdomain']
    inlines = [SocialLinkInline, SkillInline, ExperienceInline, EducationInline]
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Basic Info', {
            'fields': ('title', 'tagline', 'bio')
        }),
        ('Design', {
            'fields': ('template', 'primary_color', 'secondary_color', 'font_family')
        }),
        ('Domain', {
            'fields': ('subdomain', 'custom_domain')
        }),
        ('Status', {
            'fields': ('is_published',)
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['subdomain']


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'platform', 'url', 'display_order']
    list_filter = ['platform']
    search_fields = ['portfolio__user__username']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'portfolio', 'category', 'proficiency', 'display_order']
    list_filter = ['category']
    search_fields = ['name', 'portfolio__user__username']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'portfolio', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'start_date']
    search_fields = ['position', 'company', 'portfolio__user__username']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['degree', 'institution', 'portfolio', 'start_date', 'end_date']
    list_filter = ['start_date']
    search_fields = ['degree', 'institution', 'portfolio__user__username']