import os
import shutil
from pathlib import Path

def reorganize_admin_structure():
    """Reorganize admin structure while preserving existing Django files"""
    
    # Base directory
    base_dir = Path.home() / "dycetix_system"
    admin_dir = base_dir / "admin"
    
    print(f"Reorganizing admin structure in: {admin_dir}")
    
    # Check if Django project exists
    if not (admin_dir / "manage.py").exists():
        print("❌ ERROR: manage.py not found! Did Django project creation fail?")
        return
    
    print("✅ Django project found (manage.py exists)")
    
    # List of all directories to create (admin only)
    directories = [
        # Admin Django project structure - KEEP EXISTING
        "admin/config/settings",
        "admin/apps",
        "admin/apps/accounts",
        "admin/apps/accounts/models",
        "admin/apps/accounts/api",
        "admin/apps/accounts/services",
        "admin/apps/accounts/managers",
        "admin/apps/accounts/forms",
        "admin/apps/accounts/templatetags",
        "admin/apps/accounts/templates/accounts/partials",
        "admin/apps/accounts/templates/accounts/emails",
        "admin/apps/accounts/tests",
        "admin/apps/accounts/migrations",
        "admin/apps/forms",
        "admin/apps/forms/models",
        "admin/apps/forms/api",
        "admin/apps/forms/services",
        "admin/apps/forms/admin",
        "admin/apps/forms/utils",
        "admin/apps/forms/templates/forms/partials",
        "admin/apps/forms/tests",
        "admin/apps/forms/migrations",
        "admin/apps/content",
        "admin/apps/content/models",
        "admin/apps/content/api",
        "admin/apps/content/services",
        "admin/apps/content/templatetags",
        "admin/apps/content/templates/content/partials",
        "admin/apps/content/tests",
        "admin/apps/content/migrations",
        "admin/apps/finance",
        "admin/apps/finance/models",
        "admin/apps/finance/services",
        "admin/apps/finance/templates/finance",
        "admin/apps/finance/tests",
        "admin/apps/finance/migrations",
        "admin/apps/analytics",
        "admin/apps/analytics/models",
        "admin/apps/analytics/services",
        "admin/apps/analytics/utils",
        "admin/apps/analytics/tests",
        "admin/apps/analytics/migrations",
        "admin/apps/communications",
        "admin/apps/communications/models",
        "admin/apps/communications/services",
        "admin/apps/communications/templates/communications/emails",
        "admin/apps/communications/templates/communications/sms",
        "admin/apps/communications/tests",
        "admin/apps/communications/migrations",
        "admin/apps/portfolio",
        "admin/apps/portfolio/models",
        "admin/apps/portfolio/services",
        "admin/apps/portfolio/templates/portfolio",
        "admin/apps/portfolio/tests",
        "admin/apps/portfolio/migrations",
        "admin/apps/core",
        "admin/apps/core/middleware",
        "admin/apps/core/templatetags",
        "admin/apps/core/utils",
        "admin/apps/core/management/commands",
        "admin/apps/core/tests",
        
        # Templates
        "admin/templates/admin/partials",
        "admin/templates/admin/components/cards",
        "admin/templates/admin/components/tables",
        "admin/templates/admin/components/forms",
        "admin/templates/admin/components/alerts",
        "admin/templates/admin/layouts",
        "admin/templates/htmx/forms",
        "admin/templates/htmx/dashboard",
        "admin/templates/htmx/notifications",
        "admin/templates/emails",
        "admin/templates/search",
        
        # Static files
        "admin/static/css",
        "admin/static/js/admin",
        "admin/static/js/htmx",
        "admin/static/js/vendor",
        "admin/static/js/utils",
        "admin/static/images/logos",
        "admin/static/images/icons",
        "admin/static/images/avatars",
        "admin/static/vendor/htmx",
        "admin/static/vendor/hyperscript",
        "admin/static/vendor/bootstrap/css",
        "admin/static/vendor/bootstrap/js",
        "admin/static/vendor/fontawesome/css",
        "admin/static/vendor/fontawesome/webfonts",
        
        # Media directories
        "admin/media/blog/featured",
        "admin/media/blog/content",
        "admin/media/portfolio/projects",
        "admin/media/portfolio/gallery",
        "admin/media/avatars",
        "admin/media/documents/invoices",
        "admin/media/documents/resumes",
        "admin/media/documents/contracts",
        "admin/media/temp",
        
        # Locale
        "admin/locale/en/LC_MESSAGES",
        "admin/locale/fr/LC_MESSAGES",
    ]
    
    # Create all directories
    print("\n📁 Creating directory structure...")
    for directory in directories:
        # Convert relative path to absolute
        if directory.startswith("admin/"):
            full_path = base_dir / directory
        else:
            full_path = base_dir / "admin" / directory
            
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"  Created: {directory}")
    
    # STEP: PRESERVE EXISTING DJANGO FILES
    print("\n🔧 Preserving existing Django files...")
    
    # 1. Check current Django structure
    current_config = admin_dir / "config"
    if not current_config.exists():
        print("❌ ERROR: Django config folder not found!")
        return
    
    # 2. Create settings directory if it doesn't exist
    settings_dir = admin_dir / "config" / "settings"
    settings_dir.mkdir(exist_ok=True)
    
    # 3. Move settings.py to settings/base.py if not already there
    old_settings = current_config / "settings.py"
    new_settings = settings_dir / "base.py"
    
    if old_settings.exists() and not new_settings.exists():
        print(f"  Moving: config/settings.py → config/settings/base.py")
        old_settings.rename(new_settings)
    elif old_settings.exists() and new_settings.exists():
        print(f"  Keeping both: settings.py exists, base.py already exists")
        # Keep both, but we should probably rename the old one
        backup = current_config / "settings.py.backup"
        old_settings.rename(backup)
        print(f"  Backup created: {backup}")
    
    # 4. Create other settings files ONLY if they don't exist
    print("\n⚙️ Creating environment settings files...")
    settings_files = {
        "__init__.py": "# Settings module initialization\nfrom .base import *\n",
        "development.py": "# Development settings\nfrom .base import *\n\nDEBUG = True\n",
        "production.py": "# Production settings\nfrom .base import *\n\nDEBUG = False\n",
        "testing.py": "# Testing settings\nfrom .base import *\n\nDEBUG = True\n",
        "docker.py": "# Docker settings\nfrom .base import *\n\n# Docker specific settings\n",
    }
    
    for filename, content in settings_files.items():
        file_path = settings_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            print(f"  Created: config/settings/{filename}")
    
    # 5. Create wsgi.py and asgi.py if they don't exist (they should from Django)
    wsgi_path = current_config / "wsgi.py"
    asgi_path = current_config / "asgi.py"
    
    if not wsgi_path.exists():
        wsgi_path.write_text("# WSGI config\nimport os\nfrom django.core.wsgi import get_wsgi_application\n\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin.config.settings')\n\napplication = get_wsgi_application()\n")
    
    if not asgi_path.exists():
        asgi_path.write_text("# ASGI config\nimport os\nfrom django.core.asgi import get_asgi_application\n\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', 'admin.config.settings')\n\napplication = get_asgi_application()\n")
    
    # 6. Update wsgi.py and asgi.py to use new settings path
    print("\n🔄 Updating Django configuration files...")
    
    # Update wsgi.py
    if wsgi_path.exists():
        content = wsgi_path.read_text()
        # Replace default settings path with our new path
        if "DJANGO_SETTINGS_MODULE', 'config.settings" in content:
            content = content.replace("DJANGO_SETTINGS_MODULE', 'config.settings", "DJANGO_SETTINGS_MODULE', 'admin.config.settings")
            wsgi_path.write_text(content)
            print("  Updated: config/wsgi.py")
    
    # Update asgi.py
    if asgi_path.exists():
        content = asgi_path.read_text()
        if "DJANGO_SETTINGS_MODULE', 'config.settings" in content:
            content = content.replace("DJANGO_SETTINGS_MODULE', 'config.settings", "DJANGO_SETTINGS_MODULE', 'admin.config.settings")
            asgi_path.write_text(content)
            print("  Updated: config/asgi.py")
    
    # Update manage.py
    manage_path = admin_dir / "manage.py"
    if manage_path.exists():
        content = manage_path.read_text()
        if "DJANGO_SETTINGS_MODULE', 'config.settings" in content:
            content = content.replace("DJANGO_SETTINGS_MODULE', 'config.settings", "DJANGO_SETTINGS_MODULE', 'admin.config.settings")
            manage_path.write_text(content)
            print("  Updated: manage.py")
    
    # 7. Now create all other empty files (but skip if they exist)
    print("\n📄 Creating app structure files...")
    
    # List of essential empty files to create (excluding Django core files)
    app_files = [
        # Config additional files
        "admin/config/celery.py",
        "admin/config/gunicorn.conf.py",
        
        # Apps __init__.py files
        "admin/apps/__init__.py",
        "admin/apps/accounts/__init__.py",
        "admin/apps/accounts/apps.py",
        "admin/apps/accounts/admin.py",
        "admin/apps/accounts/urls.py",
        "admin/apps/accounts/permissions.py",
        "admin/apps/accounts/signals.py",
        "admin/apps/accounts/receivers.py",
        "admin/apps/accounts/constants.py",
        "admin/apps/accounts/exceptions.py",
        
        # Accounts models
        "admin/apps/accounts/models/__init__.py",
        "admin/apps/accounts/models/admin_user.py",
        "admin/apps/accounts/models/admin_role.py",
        "admin/apps/accounts/models/admin_profile.py",
        "admin/apps/accounts/models/admin_session.py",
        
        # Accounts API
        "admin/apps/accounts/api/__init__.py",
        "admin/apps/accounts/api/viewsets.py",
        "admin/apps/accounts/api/serializers.py",
        "admin/apps/accounts/api/permissions.py",
        "admin/apps/accounts/api/filters.py",
        "admin/apps/accounts/api/urls.py",
        
        # Accounts services
        "admin/apps/accounts/services/__init__.py",
        "admin/apps/accounts/services/user_service.py",
        "admin/apps/accounts/services/auth_service.py",
        "admin/apps/accounts/services/permission_service.py",
        "admin/apps/accounts/services/two_factor_service.py",
        "admin/apps/accounts/services/audit_service.py",
        
        # Other accounts files
        "admin/apps/accounts/managers/__init__.py",
        "admin/apps/accounts/managers/user_manager.py",
        "admin/apps/accounts/forms/__init__.py",
        "admin/apps/accounts/forms/user_forms.py",
        "admin/apps/accounts/forms/auth_forms.py",
        "admin/apps/accounts/forms/profile_forms.py",
        "admin/apps/accounts/templatetags/__init__.py",
        "admin/apps/accounts/templatetags/account_tags.py",
        
        # Other apps __init__.py and apps.py
        "admin/apps/content/__init__.py",
        "admin/apps/content/apps.py",
        "admin/apps/finance/__init__.py",
        "admin/apps/finance/apps.py",
        "admin/apps/analytics/__init__.py",
        "admin/apps/analytics/apps.py",
        "admin/apps/communications/__init__.py",
        "admin/apps/communications/apps.py",
        "admin/apps/portfolio/__init__.py",
        "admin/apps/portfolio/apps.py",
        
        # Core app files
        "admin/apps/core/__init__.py",
        "admin/apps/core/apps.py",
        "admin/apps/core/exceptions.py",
        "admin/apps/core/constants.py",
        "admin/apps/core/context_processors.py",
        
        # Static files (empty)
        "admin/static/css/admin.css",
        "admin/static/css/dashboard.css",
        "admin/static/css/forms.css",
        "admin/static/css/tables.css",
        "admin/static/css/responsive.css",
        "admin/static/css/darkmode.css",
        
        # .gitkeep files for empty directories (to preserve in git)
        "admin/media/blog/.gitkeep",
        "admin/media/portfolio/.gitkeep",
        "admin/media/avatars/.gitkeep",
        "admin/media/documents/.gitkeep",
        "admin/media/temp/.gitkeep",
    ]
    
    # Create all files (only if they don't exist)
    for file_path in app_files:
        # Convert to absolute path
        if file_path.startswith("admin/"):
            full_path = base_dir / file_path
        else:
            full_path = base_dir / "admin" / file_path
        
        # Skip if file already exists
        if full_path.exists():
            continue
            
        # Create parent directories if they don't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Get just the filename for the comment
        filename = Path(file_path).name
        
        # Create file with appropriate content
        with open(full_path, 'w', encoding='utf-8') as f:
            if file_path.endswith('.py'):
                f.write(f"# {filename}\n")
                f.write("# Empty file - content will be added later\n")
            elif file_path.endswith('.css'):
                f.write(f"/* {filename} */\n")
                f.write("/* Empty file - content will be added later */\n")
            elif file_path.endswith('.gitkeep'):
                # Just create empty .gitkeep file
                pass
        
        print(f"  Created: {file_path}")
    
    return admin_dir

def test_django():
    """Test if Django still works after reorganization"""
    import subprocess
    import sys
    
    base_dir = Path.home() / "dycetix_system"
    admin_dir = base_dir / "admin"
    
    print("\n🧪 Testing Django after reorganization...")
    
    # Check if manage.py exists
    manage_py = admin_dir / "manage.py"
    if not manage_py.exists():
        print("❌ ERROR: manage.py not found!")
        return False
    
    # Try to run a simple Django command
    try:
        print("Running: python manage.py check")
        result = subprocess.run(
            [sys.executable, str(manage_py), "check"],
            cwd=str(admin_dir),
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ Django check passed!")
            return True
        else:
            print("❌ Django check failed!")
            print(f"Error output: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception running Django: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Reorganizing Dycetix Admin Structure...")
    print("=" * 60)
    
    try:
        # First, reorganize the structure
        result_dir = reorganize_admin_structure()
        
        # Then test Django
        print("\n" + "=" * 60)
        print("🔄 Testing Django functionality...")
        
        if test_django():
            print("\n" + "=" * 60)
            print("✅ REORGANIZATION SUCCESSFUL!")
            print(f"📁 Location: {result_dir}")
            print("\n📊 Summary:")
            print("  - ✅ Django core files preserved")
            print("  - ✅ Settings split into multiple files")
            print("  - ✅ App structure created")
            print("  - ✅ Django still functional")
            print("\n🎯 Next step: Test Django manually:")
            print("  cd admin")
            print("  python manage.py runserver")
            print("  http://127.0.0.1:8000/admin/")
        else:
            print("\n❌ REORGANIZATION FAILED - Django check failed")
            print("Please check the errors above.")
            
    except Exception as e:
        print(f"\n❌ Error during reorganization: {e}")
        import traceback
        traceback.print_exc()