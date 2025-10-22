from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Register sub-resources BEFORE the main portfolio viewset
router.register(r'social-links', views.SocialLinkViewSet, basename='social-link')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'experiences', views.ExperienceViewSet, basename='experience')
router.register(r'education', views.EducationViewSet, basename='education')

# Register portfolio viewset LAST with empty prefix
router.register(r'', views.PortfolioViewSet, basename='portfolio')

urlpatterns = router.urls