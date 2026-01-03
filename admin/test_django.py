#!/usr/bin/env python
import os
import sys

# Add the app directory to the path
sys.path.insert(0, '/app/admin')

# Try to load Django settings
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    import django
    django.setup()
    print("✓ Django setup successful!")
    
    # Test database connection
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"✓ Database connection successful: {result}")
        
    # Test if accounts app can be loaded
    from admin.apps.accounts.models.admin_user import AdminUser
    print("✓ AdminUser model imported successfully")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)