# admin/config/urls.py - USE THIS FOR PRODUCTION (matches your local)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.views.generic import RedirectView
from admin.apps.accounts.admin_site import admin_site  # Import custom admin site
from admin.apps.accounts.views import custom_logout  # Import your custom logout

# Your local working version doesn't have custom_admin_dashboard
# So don't use it in production either

urlpatterns = [
    # Root redirect to admin
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    
    # Use custom admin site (this is what works locally)
    path('admin/', admin_site.urls),
    
    # Django's default admin (hidden backup - for emergencies)
    path('admin/django/', admin.site.urls),
    
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