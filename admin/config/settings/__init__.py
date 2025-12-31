# Settings module initialization
import os

env = os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings.docker')

if env == 'config.settings.docker':
    from .docker import *
elif env == 'config.settings.development':
    from .development import *
elif env == 'config.settings.production':
    from .production import *
elif env == 'config.settings.testing':
    from .testing import *
else:
    from .base import *
