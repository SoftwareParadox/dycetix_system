import os
import shutil
from pathlib import Path

def reorganize_customer_structure():
    """Reorganize customer structure while preserving existing Django files"""
    
    base_dir = Path.home() / "dycetix_system"
    customer_dir = base_dir / "customer"
    
    print(f"Reorganizing customer structure in: {customer_dir}")
    
    # Check if Django project exists
    if not (customer_dir / "manage.py").exists():
        print("❌ ERROR: manage.py not found! Did Django project creation fail?")
        return
    
    print("✅ Django project found (manage.py exists)")
    
    # 1. Create all customer directories (they already exist from your script)
    print("\n📁 Verifying directory structure...")
    
    # Just check key directories exist
    key_dirs = [
        "customer/dycetix_project/settings",
        "customer/client_portal/apps/core",
        "customer/client_portal/apps/search",
        "customer/client_portal/apps/forms",
    ]
    
    for directory in key_dirs:
        full_path = base_dir / directory
        if not full_path.exists():
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"  Created missing: {directory}")
    
    # 2. Preserve existing Django files
    print("\n🔧 Preserving existing Django files...")
    
    # Check current Django structure
    current_dycetix_project = customer_dir / "dycetix_project"
    if not current_dycetix_project.exists():
        print("❌ ERROR: dycetix_project folder not found!")
        return
    
    # Move settings.py to settings/base.py
    old_settings = current_dycetix_project / "settings.py"
    new_settings_dir = current_dycetix_project / "settings"
    new_settings_dir.mkdir(exist_ok=True)
    new_settings = new_settings_dir / "base.py"
    
    if old_settings.exists() and not new_settings.exists():
        print(f"  Moving: dycetix_project/settings.py → dycetix_project/settings/base.py")
        old_settings.rename(new_settings)
    elif old_settings.exists() and new_settings.exists():
        print(f"  Keeping both: settings.py exists, base.py already exists")
        # Keep the Django one, backup ours
        backup = current_dycetix_project / "settings.py.backup"
        old_settings.rename(backup)
        print(f"  Backup created: {backup}")
    
    # 3. Create other settings files ONLY if they don't exist
    print("\n⚙️ Creating environment settings files...")
    settings_files = {
        "__init__.py": "# Settings module initialization\nfrom .base import *\n",
        "development.py": "# Development settings\nfrom .base import *\n\nDEBUG = True\n",
        "production.py": "# Production settings\nfrom .base import *\n\nDEBUG = False\n",
        "docker.py": "# Docker settings\nfrom .base import *\n\n# Docker specific settings\n",
    }
    
    for filename, content in settings_files.items():
        file_path = new_settings_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            print(f"  Created: dycetix_project/settings/{filename}")
    
    # 4. Update wsgi.py and asgi.py if needed
    print("\n🔄 Updating Django configuration files...")
    
    # Update wsgi.py
    wsgi_path = current_dycetix_project / "wsgi.py"
    if wsgi_path.exists():
        content = wsgi_path.read_text()
        if "DJANGO_SETTINGS_MODULE" in content:
            # Replace default settings path
            if "'dycetix_project.settings" in content:
                content = content.replace("'dycetix_project.settings", "'dycetix_project.settings")
                wsgi_path.write_text(content)
                print("  Updated: dycetix_project/wsgi.py")
    
    # Update asgi.py
    asgi_path = current_dycetix_project / "asgi.py"
    if asgi_path.exists():
        content = asgi_path.read_text()
        if "DJANGO_SETTINGS_MODULE" in content:
            if "'dycetix_project.settings" in content:
                content = content.replace("'dycetix_project.settings", "'dycetix_project.settings")
                asgi_path.write_text(content)
                print("  Updated: dycetix_project/asgi.py")
    
    # Update manage.py
    manage_path = customer_dir / "manage.py"
    if manage_path.exists():
        content = manage_path.read_text()
        if "DJANGO_SETTINGS_MODULE" in content:
            if "'dycetix_project.settings" in content:
                content = content.replace("'dycetix_project.settings", "'dycetix_project.settings")
                manage_path.write_text(content)
                print("  Updated: manage.py")
    
    # 5. Create minimal customer app files
    print("\n📄 Creating customer app files...")
    
    # Create apps.py for customer apps
    apps_to_create = {
        "core": """# customer/client_portal/apps/core/apps.py
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'client_portal.apps.core'
    label = 'customer_core'
""",
        "search": """# customer/client_portal/apps/search/apps.py
from django.apps import AppConfig

class SearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'client_portal.apps.search'
    label = 'customer_search'
""",
        "forms": """# customer/client_portal/apps/forms/apps.py
from django.apps import AppConfig

class FormsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'client_portal.apps.forms'
    label = 'customer_forms'
""",
    }
    
    for app_name, app_content in apps_to_create.items():
        app_file = customer_dir / "client_portal" / "apps" / app_name / "apps.py"
        if not app_file.exists():
            app_file.parent.mkdir(parents=True, exist_ok=True)
            app_file.write_text(app_content)
            print(f"  Created: client_portal/apps/{app_name}/apps.py")
        
        # Create __init__.py
        init_file = customer_dir / "client_portal" / "apps" / app_name / "__init__.py"
        if not init_file.exists():
            init_file.write_text(f"# {app_name} app\n")
    
    print("\n✅ Customer app reorganization complete!")
    return customer_dir

def test_customer_django():
    """Test if Customer Django still works"""
    import subprocess
    import sys
    
    base_dir = Path.home() / "dycetix_system"
    customer_dir = base_dir / "customer"
    
    print("\n🧪 Testing Customer Django...")
    
    manage_py = customer_dir / "manage.py"
    if not manage_py.exists():
        print("❌ ERROR: manage.py not found!")
        return False
    
    try:
        print("Running: python manage.py check")
        result = subprocess.run(
            [sys.executable, str(manage_py), "check"],
            cwd=str(customer_dir),
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ Customer Django check passed!")
            return True
        else:
            print("❌ Customer Django check failed!")
            print(f"Error output: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception running Customer Django: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Reorganizing Customer App Structure...")
    print("=" * 60)
    
    try:
        result_dir = reorganize_customer_structure()
        
        print("\n" + "=" * 60)
        print("🔄 Testing Customer Django...")
        
        if test_customer_django():
            print("\n" + "=" * 60)
            print("✅ CUSTOMER REORGANIZATION SUCCESSFUL!")
            print(f"📁 Location: {result_dir}")
            print("\n📊 Customer App Ready For:")
            print("  - Static pages (Home, About, Services, Portfolio, Blog)")
            print("  - Contact forms (POST to admin API)")
            print("  - Site search (PostgreSQL search)")
            print("  - No database needed (stateless)")
            print("\n🎯 Next: Configure customer settings for static site")
        else:
            print("\n❌ REORGANIZATION FAILED - Django check failed")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()