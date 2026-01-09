# admin/apps/forms/urls.py - UPDATE YOUR EXISTING FILE
from django.urls import path
from . import views

urlpatterns = [
    # Public form submission
    path('submit/client-requirement/', views.submit_client_requirement, name='submit_client_requirement'),
    
    # Admin dashboard API endpoints (protected)
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/health/', views.admin_health, name='admin_health'),
    path('admin/sidebar-stats/', views.sidebar_stats, name='sidebar_stats'),
    path('admin/notifications/unread-count/', views.notifications_unread_count, name='notifications_unread_count'),
    
    # Client requirements list (for admin dashboard)
    path('client-requirements/', views.client_requirements_list, name='client_requirements_list'),
    path('client-requirements/<int:pk>/', views.client_requirement_detail, name='client_requirement_detail'),
]