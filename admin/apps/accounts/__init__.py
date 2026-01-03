# __init__.py
# Empty file - content will be added later
# This makes the accounts app a proper Python package
# admin/apps/accounts/__init__.py
default_app_config = 'admin.apps.accounts.apps.AccountsConfig'

# This helps with circular imports
__all__ = [
    'AdminUser',
    'AdminRole',
    'admin_site',
]