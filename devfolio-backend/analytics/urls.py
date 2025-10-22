from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('track/portfolio/', views.track_portfolio_view, name='track-portfolio'),
    path('track/project/', views.track_project_view, name='track-project'),
    path('', include(router.urls)),
]