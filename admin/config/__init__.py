# admin/config/__init__.py
# This makes the config package importable
import os

# Validate required environment variables
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