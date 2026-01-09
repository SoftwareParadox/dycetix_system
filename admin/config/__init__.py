# admin/config/__init__.py
import os

# Skip environment variable check when on Render
# Render uses DATABASE_URL instead of separate POSTGRES_* variables
if not os.environ.get('RENDER'):
    # Only check these for local Docker development
    required_env_vars = [
        'POSTGRES_DB',
        'POSTGRES_USER', 
        'POSTGRES_PASSWORD',
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'ADMIN_SECRET_KEY',
    ]
    
    for var in required_env_vars:
        if not os.environ.get(var):
            raise EnvironmentError(f"Required environment variable {var} is not set")
else:
    print("Running on Render - skipping Docker env var checks")