# customer/client_portal/apps/core/apps.py
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'client_portal.apps.core'
    label = 'customer_core'
