# admin/config/__init__.py
import os

# REMOVE or COMMENT OUT the environment variable check for now
# This allows Django to start and load settings where env vars will be handled
pass

# Optional: Keep only a warning
if not os.environ.get('RENDER'):
    required_env_vars = [
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'ADMIN_SECRET_KEY',
    ]
    
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    if missing_vars:
        print(f"Warning: Missing environment variables: {missing_vars}")
        # Don't raise error - let settings.py handle it