# admin/config/settings_migrate.py
"""
Minimal settings for running migrations only.
This avoids loading URLs, admin, forms, etc.
"""
import os
from .settings import *

# Disable ALL applications except the ones needed for migrations
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.migrations',
]

# Keep only the DATABASES setting
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'dycetix_db'),
        'USER': os.getenv('POSTGRES_USER', 'dycetix'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', ''),
        'HOST': os.getenv('POSTGRES_HOST', 'postgres'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Disable everything else
MIDDLEWARE = []
TEMPLATES = []
STATIC_URL = '/static/'
DEBUG = True
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'migration-secret-key')
ALLOWED_HOSTS = ['*']