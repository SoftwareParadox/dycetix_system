#!/usr/bin/env python
import os
import sys
import django

# Add both project paths
sys.path.append('/app/admin')
sys.path.append('/app/customer')

# Setup Django for admin
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("✅ Railway setup check completed")
print(f"Current directory: {os.getcwd()}")
print(f"Python path: {sys.path}")