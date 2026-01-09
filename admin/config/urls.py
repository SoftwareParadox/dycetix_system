# admin/config/urls.py - UPDATED VERSION
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render, redirect
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views  # Add this import

# Import custom views
from admin.apps.accounts.views import custom_logout  # We'll create this


def custom_admin_dashboard(request):
    """Render the custom admin dashboard"""
    if not request.user.is_authenticated:
        return redirect('/admin/login/')
    return render(request, 'admin/layouts/dashboard_base.html')


urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    # Django's default admin (hidden backup - for emergencies)
    path('admin/django/', admin.site.urls),
    
    # Your custom admin dashboard
    path('admin/', custom_admin_dashboard, name='admin_dashboard'),
    
    # Use Django's built-in auth views with your custom templates
    path('admin/login/', auth_views.LoginView.as_view(
        template_name='admin/login.html',
        redirect_authenticated_user=True,
        extra_context={'site_title': 'DyceTix Admin'}
    ), name='admin_login'),
    
    # Custom logout view (GET request allowed)
    path('admin/logout/', custom_logout, name='admin_logout'),
    
    # Form submission and admin API endpoints
    path('api/forms/', include('admin.apps.forms.urls')),
]

# Add media URL in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)