# admin/apps/accounts/apps.py
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin.apps.accounts'  # This is the full Python path
    # Django will use the last part 'accounts' as the app label
    
    # Optional: Explicitly set the label if you want
    # label = 'accounts'