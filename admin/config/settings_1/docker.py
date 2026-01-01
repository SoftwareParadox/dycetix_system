from .base import *
import os

# Database - use PostgreSQL in Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'dycetix_db'),
        'USER': os.environ.get('POSTGRES_USER', 'dycetix'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'password123'),
        'HOST': 'postgres',  # ← Docker service name
        'PORT': '5432',
    }
}

# Security
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'admin.dycetix.local']

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')