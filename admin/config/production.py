import os
from .settings import *

# Disable debug mode
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Railway specific
if os.environ.get('RAILWAY_ENVIRONMENT'):
    # Database
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=True
        )
    }
    
    # Allowed hosts
    railway_url = os.environ.get('RAILWAY_PUBLIC_DOMAIN')
    if railway_url:
        ALLOWED_HOSTS = [railway_url, f'https://{railway_url}']
    
    # HTTPS settings
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Static files
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'