# customer/client_portal/apps/search/apps.py
from django.apps import AppConfig

class SearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'client_portal.apps.search'
    label = 'customer_search'
