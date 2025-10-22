from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from portfolios.models import Portfolio
from projects.models import Project
from .models import PortfolioView, ProjectView
from .serializers import PortfolioViewSerializer, ProjectViewSerializer


def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def parse_user_agent(user_agent_string):
    """Simple user agent parsing"""
    ua = user_agent_string.lower()
    
    # Device type
    if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
        device_type = 'mobile'
    elif 'tablet' in ua or 'ipad' in ua:
        device_type = 'tablet'
    else:
        device_type = 'desktop'
    
    # Browser
    if 'chrome' in ua:
        browser = 'Chrome'
    elif 'firefox' in ua:
        browser = 'Firefox'
    elif 'safari' in ua:
        browser = 'Safari'
    elif 'edge' in ua:
        browser = 'Edge'
    else:
        browser = 'Other'
    
    # OS
    if 'windows' in ua:
        os = 'Windows'
    elif 'mac' in ua:
        os = 'macOS'
    elif 'linux' in ua:
        os = 'Linux'
    elif 'android' in ua:
        os = 'Android'
    elif 'ios' in ua or 'iphone' in ua or 'ipad' in ua:
        os = 'iOS'
    else:
        os = 'Other'
    
    return device_type, browser, os


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_portfolio_view(request):
    """Track a portfolio page view"""
    
    username = request.data.get('username')
    page_url = request.data.get('page_url', '')
    referrer = request.data.get('referrer', '')
    
    try:
        portfolio = Portfolio.objects.get(user__username=username)
    except Portfolio.DoesNotExist:
        return Response(
            {'error': 'Portfolio not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get visitor info
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    device_type, browser, os = parse_user_agent(user_agent)
    
    # Create view record
    PortfolioView.objects.create(
        portfolio=portfolio,
        ip_address=ip_address,
        user_agent=user_agent,
        referrer=referrer,
        device_type=device_type,
        browser=browser,
        os=os,
        page_url=page_url
    )
    
    return Response({'message': 'View tracked successfully'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_project_view(request):
    """Track a project view"""
    
    project_slug = request.data.get('project_slug')
    referrer = request.data.get('referrer', '')
    
    try:
        project = Project.objects.get(slug=project_slug)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    ip_address = get_client_ip(request)
    
    ProjectView.objects.create(
        project=project,
        ip_address=ip_address,
        referrer=referrer
    )
    
    return Response({'message': 'View tracked successfully'}, status=status.HTTP_201_CREATED)


class AnalyticsViewSet(viewsets.ViewSet):
    """Analytics dashboard endpoints"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get analytics overview for user's portfolio"""
        
        try:
            portfolio = Portfolio.objects.get(user=request.user)
        except Portfolio.DoesNotExist:
            return Response(
                {'error': 'Portfolio not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Date range
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Total views
        total_views = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).count()
        
        # Unique visitors (by IP)
        unique_visitors = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).values('ip_address').distinct().count()
        
        # Views by day
        views_by_day = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).annotate(
            date=TruncDate('viewed_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Top referrers
        top_referrers = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).exclude(
            referrer=''
        ).values('referrer').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Device breakdown
        device_breakdown = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).values('device_type').annotate(
            count=Count('id')
        )
        
        # Browser breakdown
        browser_breakdown = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).values('browser').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Country breakdown
        country_breakdown = PortfolioView.objects.filter(
            portfolio=portfolio,
            viewed_at__gte=start_date
        ).exclude(
            country=''
        ).values('country').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'total_views': total_views,
            'unique_visitors': unique_visitors,
            'views_by_day': list(views_by_day),
            'top_referrers': list(top_referrers),
            'device_breakdown': list(device_breakdown),
            'browser_breakdown': list(browser_breakdown),
            'country_breakdown': list(country_breakdown),
        })
    
    @action(detail=False, methods=['get'])
    def projects(self, request):
        """Get analytics for user's projects"""
        
        projects = Project.objects.filter(user=request.user)
        
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        project_stats = []
        for project in projects:
            views_count = ProjectView.objects.filter(
                project=project,
                viewed_at__gte=start_date
            ).count()
            
            project_stats.append({
                'project_id': project.id,
                'project_title': project.title,
                'project_slug': project.slug,
                'views': views_count
            })
        
        # Sort by views
        project_stats.sort(key=lambda x: x['views'], reverse=True)
        
        return Response(project_stats)