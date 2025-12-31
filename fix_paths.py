# fix_paths.py
import os
from pathlib import Path

def fix_django_paths():
    base_dir = Path.home() / "dycetix_system"
    admin_dir = base_dir / "admin"
    
    print("Fixing Django paths...")
    
    # Fix manage.py
    manage_py = admin_dir / "manage.py"
    if manage_py.exists():
        content = manage_py.read_text()
        
        # Add this at the top of manage.py (after the imports)
        fix_code = '''import sys
from pathlib import Path

# Add parent directory to Python path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

'''
        
        # Insert after existing imports
        lines = content.split('\n')
        new_lines = []
        imports_done = False
        
        for line in lines:
            new_lines.append(line)
            if not imports_done and line.strip() == '':
                # Add our path fix code after imports
                new_lines.append(fix_code.strip())
                imports_done = True
        
        if not imports_done:
            # If no blank line, add after the last import
            new_lines.append('\n' + fix_code.strip())
        
        manage_py.write_text('\n'.join(new_lines))
        print("✅ Fixed manage.py")
    
    # Fix wsgi.py
    wsgi_py = admin_dir / "config" / "wsgi.py"
    if wsgi_py.exists():
        content = wsgi_py.read_text()
        
        # Change from 'admin.config.settings' to 'config.settings'
        if "'admin.config.settings'" in content:
            content = content.replace("'admin.config.settings'", "'config.settings'")
            wsgi_py.write_text(content)
            print("✅ Fixed wsgi.py")
    
    # Fix asgi.py
    asgi_py = admin_dir / "config" / "asgi.py"
    if asgi_py.exists():
        content = asgi_py.read_text()
        
        if "'admin.config.settings'" in content:
            content = content.replace("'admin.config.settings'", "'config.settings'")
            asgi_py.write_text(content)
            print("✅ Fixed asgi.py")
    
    # Update settings/__init__.py to use correct imports
    settings_init = admin_dir / "config" / "settings" / "__init__.py"
    if settings_init.exists():
        content = '''# Settings module initialization
import os

env = os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings.docker')

if env == 'config.settings.docker':
    from .docker import *
elif env == 'config.settings.development':
    from .development import *
elif env == 'config.settings.production':
    from .production import *
elif env == 'config.settings.testing':
    from .testing import *
else:
    from .base import *
'''
        settings_init.write_text(content)
        print("✅ Fixed settings/__init__.py")
    
    print("\n🎯 All fixes applied!")
    print("Now test with: cd dycetix_system && python -m admin.manage check")

if __name__ == "__main__":
    fix_django_paths()