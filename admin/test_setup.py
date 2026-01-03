import os
import sys

# Add the admin directory to the path
sys.path.insert(0, '/app/admin')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    import django
    django.setup()
    print("✓ Django setup successful")
    
    from apps.accounts.models import AdminUser
    print(f"✓ AdminUser model: {AdminUser}")
    print(f"✓ USERNAME_FIELD: {AdminUser.USERNAME_FIELD}")
    
    # Check if we can create a user
    user = AdminUser(email='test@example.com')
    print(f"✓ Can create AdminUser instance")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
