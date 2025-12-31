# fix_customer_folders.py
from pathlib import Path

def create_missing_folders():
    """Create the missing folders in client_portal"""
    
    base_dir = Path.home() / "dycetix_system"
    customer_dir = base_dir / "customer"
    client_portal = customer_dir / "client_portal"
    
    print("Creating missing folders in client_portal...")
    
    # Folders that should exist
    folders = [
        # Static files
        "static/css/base",
        "static/css/components", 
        "static/css/pages",
        "static/css/responsive",
        "static/css/vendor",
        "static/js/modules",
        "static/js/pages",
        "static/js/vendor",
        "static/js/utils",
        "static/images/logos",
        "static/images/home",
        "static/images/about", 
        "static/images/services",
        "static/images/portfolio",
        "static/images/blog",
        "static/videos/hero",
        "static/videos/testimonials",
        "static/fonts/opensans",
        "static/fonts/montserrat",
        
        # Templates
        "templates/frontend/home/sections",
        "templates/frontend/about_us/sections", 
        "templates/frontend/services/detail",
        "templates/frontend/portfolio/detail",
        "templates/frontend/contact",
        "templates/frontend/search",
        "templates/includes",
        "templates/components/cards",
        "templates/components/forms",
        "templates/components/modals",
        "templates/components/sections",
        "templates/emails",
        
        # Media and locale
        "media/uploads",
        "locale/en/LC_MESSAGES",
    ]
    
    created_count = 0
    for folder in folders:
        full_path = client_portal / folder
        if not full_path.exists():
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"  Created: {folder}")
            created_count += 1
    
    print(f"\n✅ Created {created_count} missing folders!")
    
    # Verify structure
    print("\n📁 Verifying structure...")
    expected = ["static", "templates", "media", "locale"]
    for folder in expected:
        path = client_portal / folder
        if path.exists():
            print(f"✓ {folder}/ exists")
        else:
            print(f"✗ {folder}/ MISSING")
    
    return client_portal

if __name__ == "__main__":
    print("FIXING CUSTOMER CLIENT_PORTAL FOLDERS")
    print("=" * 50)
    create_missing_folders()