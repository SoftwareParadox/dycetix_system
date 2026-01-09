# admin/apps/forms/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientRequirementViewSet

router = DefaultRouter()
router.register(r'client-requirements', ClientRequirementViewSet, basename='client-requirement')

urlpatterns = [
    path('', include(router.urls)),
]