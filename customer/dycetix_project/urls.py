"""
URL configuration for dycetix_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='frontend/home/index.html'), name='home'),
    
    # 
    # path('', include('search.urls')),
    # Add these URL patterns for your navigation links
    path('about-us/', TemplateView.as_view(template_name='frontend/about_us/about-us.html'), name='about_us'),
    path('technologies/', TemplateView.as_view(template_name='frontend/technologies/technologies.html'), name='technologies'),
    path('industries/', TemplateView.as_view(template_name='frontend/industries/industries.html'), name='industries'),
    path('blog/', TemplateView.as_view(template_name='frontend/blog/blog.html'), name='blog'),
    path('get-in-touch/', TemplateView.as_view(template_name='frontend/get_in_touch/get-in-touch.html'), name='get_in_touch'),
    
    #404 page
    path('404/', TemplateView.as_view(template_name='frontend/404/404.html'), name='404'),
    
    # Add service pages
    path('custom-software-development/', TemplateView.as_view(template_name='frontend/custom_dev/custom-software-development.html'), name='custom_software'),
    path('web-development/', TemplateView.as_view(template_name='frontend/web_dev/web-development.html'), name='web_development'),
    path('mobile-application-development/', TemplateView.as_view(template_name='frontend/mobile_dev/mobile-application-development.html'), name='mobile_development'),
    path('desktop-application-development/', TemplateView.as_view(template_name='frontend/desktop_dev/desktop-application-development.html'), name='desktop_development'),
    path('database-development/', TemplateView.as_view(template_name='frontend/database_dev/database-development.html'), name='database_development'),
    path('it-support-&-maintenance/', TemplateView.as_view(template_name='frontend/it_support/it-support-&-maintenance.html'), name='it_maintenance'),
    path('graphic-design/', TemplateView.as_view(template_name='frontend/graphic_design/graphic-design.html'), name='graphic_design'),
    path('photography-and-videography/', TemplateView.as_view(template_name='frontend/video_photo/photography-and-videography.html'), name='video_photo'),
    path('software-solutions/', TemplateView.as_view(template_name='frontend/software_dev_services/software-solutions.html'), name='software_dev_services'),

    # Add pricing page
    path('pricing/', TemplateView.as_view(template_name='frontend/pricing/pricing.html'), name='pricing'),
    path('job-form/', TemplateView.as_view(template_name='frontend/job_form/job-form.html'), name='job_form'),
    path('partnerships/', TemplateView.as_view(template_name='frontend/partnerships/partnerships.html'), name='partnerships'),
    path('referrals/', TemplateView.as_view(template_name='frontend/referrals/referrals.html'), name='referrals'),
    # Add footer pages
    path('privacy-policy/', TemplateView.as_view(template_name='frontend/privacy_policy/privacy-policy.html'), name='privacy_policy'),
    path('terms-of-service/', TemplateView.as_view(template_name='frontend/terms_of_service/terms-of-service.html'), name='terms_of_service'),
    path('cookie-policy/', TemplateView.as_view(template_name='frontend/cookie_policy/cookie-policy.html'), name='cookie_policy'),
    path('sitemap/', TemplateView.as_view(template_name='frontend/sitemap/sitemap.html'), name='sitemap'),
    path('careers/', TemplateView.as_view(template_name='frontend/careers/careers.html'), name='careers'),
    path('accessibility/', TemplateView.as_view(template_name='frontend/accessibility/accessibility.html'), name='accessibility'),
]

# This serves static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
