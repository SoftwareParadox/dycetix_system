# admin/apps/forms/apps.py
from django.apps import AppConfig


class FormsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.forms'
    verbose_name = 'Forms Management'
    
    # def ready(self):
    #     # Import signals when app is ready
    #     try:
    #         import admin.apps.forms.signals  # noqa: F401
    #     except ImportError:
    #         pass