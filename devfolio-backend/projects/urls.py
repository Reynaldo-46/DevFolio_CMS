from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ProjectViewSet, basename='project')
router.register(r'images', views.ProjectImageViewSet, basename='project-image')

urlpatterns = router.urls