# complete_customer_fix.py
from pathlib import Path

def create_customer_structure():
    """Create complete customer structure with all files"""
    
    base_dir = Path.home() / "dycetix_system"
    customer_dir = base_dir / "customer"
    client_portal = customer_dir / "client_portal"
    
    print("Creating complete customer structure...")
    
    # First, ensure all folders exist
    print("\n1. Ensuring folders exist...")
    required_folders = [
        "static/css", "static/js", "static/images", "static/videos", "static/fonts",
        "templates/includes", "templates/frontend/home", "templates/frontend/about_us",
        "templates/frontend/services", "templates/frontend/portfolio", 
        "templates/frontend/blog", "templates/frontend/contact", "templates/frontend/search",
        "templates/components/cards", "templates/components/forms", 
        "templates/components/modals", "templates/components/sections",
        "templates/emails",
        "media/uploads",
        "locale/en/LC_MESSAGES",
    ]
    
    for folder in required_folders:
        full_path = client_portal / folder
        full_path.mkdir(parents=True, exist_ok=True)
    
    # ============================================
    # 2. CREATE ALL PYTHON FILES FOR APPS
    # ============================================
    print("\n2. Creating Python app files...")
    
    # Core app
    core_dir = client_portal / "apps" / "core"
    
    core_files = {
        "views.py": """from django.shortcuts import render

def home(request):
    return render(request, 'frontend/home/index.html')

def about(request):
    return render(request, 'frontend/about_us/about-us.html')

def services(request):
    return render(request, 'frontend/services/list.html')

def portfolio(request):
    return render(request, 'frontend/portfolio/list.html')

def blog(request):
    return render(request, 'frontend/blog/list.html')

def contact(request):
    return render(request, 'frontend/contact/contact.html')
""",
        
        "urls.py": """from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('services/', views.services, name='services'),
    path('portfolio/', views.portfolio, name='portfolio'),
    path('blog/', views.blog, name='blog'),
    path('contact/', views.contact, name='contact'),
]
""",
        
        "context_processors.py": """def global_context(request):
    return {
        'site_name': 'Dycetix Technology Solutions',
        'site_url': 'https://dycetix.co.za',
        'current_year': 2024,
    }
"""
    }
    
    for filename, content in core_files.items():
        file_path = core_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            print(f"  Created: apps/core/{filename}")
    
    # Search app
    search_dir = client_portal / "apps" / "search"
    
    search_files = {
        "views.py": """from django.shortcuts import render
from django.http import JsonResponse

def search_page(request):
    return render(request, 'frontend/search/search.html')

def search_results(request):
    query = request.GET.get('q', '')
    return render(request, 'frontend/search/results.html', {'query': query})

def search_suggestions(request):
    query = request.GET.get('q', '')
    return JsonResponse({'suggestions': [], 'query': query})
""",
        
        "urls.py": """from django.urls import path
from . import views

app_name = 'search'

urlpatterns = [
    path('', views.search_page, name='search_page'),
    path('results/', views.search_results, name='search_results'),
    path('suggestions/', views.search_suggestions, name='search_suggestions'),
]
""",
        
        "services.py": """# Search service for PostgreSQL full-text search
def search_content(query, limit=20):
    \"\"\"Search blog posts, services, portfolio\"\"\"
    # Will be implemented when PostgreSQL is connected
    return []
""",
        
        "utils.py": """# Search utilities
import re

def clean_search_query(query):
    \"\"\"Clean and normalize search query\"\"\"
    if not query:
        return ''
    # Remove extra whitespace
    query = re.sub(r'\\s+', ' ', query.strip())
    return query
"""
    }
    
    for filename, content in search_files.items():
        file_path = search_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            print(f"  Created: apps/search/{filename}")
    
    # Forms app
    forms_dir = client_portal / "apps" / "forms"
    
    forms_files = {
        "views.py": """import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

@csrf_exempt
def submit_contact_form(request):
    \"\"\"Submit contact form to admin API\"\"\"
    if request.method == 'POST':
        # In production, forward to admin API
        # For now, just return success
        return JsonResponse({
            'success': True,
            'message': 'Thank you for your message! We will contact you soon.'
        })
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def submit_newsletter(request):
    \"\"\"Submit newsletter subscription\"\"\"
    if request.method == 'POST':
        return JsonResponse({
            'success': True,
            'message': 'Thank you for subscribing!'
        })
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)
""",
        
        "urls.py": """from django.urls import path
from . import views

app_name = 'forms'

urlpatterns = [
    path('contact/', views.submit_contact_form, name='contact'),
    path('newsletter/', views.submit_newsletter, name='newsletter'),
]
"""
    }
    
    for filename, content in forms_files.items():
        file_path = forms_dir / filename
        if not file_path.exists():
            file_path.write_text(content)
            print(f"  Created: apps/forms/{filename}")
    
    # ============================================
    # 3. CREATE TEMPLATE FILES
    # ============================================
    print("\n3. Creating template files...")
    
    templates = {
        # Base templates
        "includes/base.html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Dycetix Technology Solutions{% endblock %}</title>
    {% block extra_css %}{% endblock %}
</head>
<body>
    {% include 'includes/header.html' %}
    
    <main>
        {% block content %}{% endblock %}
    </main>
    
    {% include 'includes/footer.html' %}
    
    {% block extra_js %}{% endblock %}
</body>
</html>
""",
        
        "includes/header.html": """<header>
    <div class="container">
        <a href="/" class="logo">Dycetix</a>
        <nav>
            <a href="/">Home</a>
            <a href="/about/">About</a>
            <a href="/services/">Services</a>
            <a href="/portfolio/">Portfolio</a>
            <a href="/blog/">Blog</a>
            <a href="/contact/">Contact</a>
        </nav>
    </div>
</header>
""",
        
        "includes/footer.html": """<footer>
    <div class="container">
        <p>&copy; 2024 Dycetix Technology Solutions. All rights reserved.</p>
        <p>Email: solutions@dycetix.co.za | Phone: +27 075 195 5229</p>
    </div>
</footer>
""",
        
        # Home page
        "frontend/home/index.html": """{% extends 'includes/base.html' %}

{% block title %}Home - Dycetix Technology Solutions{% endblock %}

{% block content %}
<section class="hero">
    <div class="container">
        <h1>Innovative Technology Solutions</h1>
        <p>Software Development, Design, IT Support, Photography & Videography</p>
        <a href="/contact/" class="button">Get Started</a>
    </div>
</section>

<section class="services-preview">
    <div class="container">
        <h2>Our Services</h2>
        <div class="services-grid">
            <div class="service-card">
                <h3>Software Development</h3>
                <p>Custom web and mobile applications</p>
            </div>
            <div class="service-card">
                <h3>Design Services</h3>
                <p>UI/UX, branding, and graphic design</p>
            </div>
            <div class="service-card">
                <h3>IT Support</h3>
                <p>Technical support and maintenance</p>
            </div>
            <div class="service-card">
                <h3>Media Production</h3>
                <p>Photography and videography services</p>
            </div>
        </div>
    </div>
</section>
{% endblock %}
""",
        
        # About page
        "frontend/about_us/about-us.html": """{% extends 'includes/base.html' %}

{% block title %}About Us - Dycetix Technology Solutions{% endblock %}

{% block content %}
<div class="container">
    <h1>About Dycetix</h1>
    
    <section>
        <h2>Who We Are</h2>
        <p>Dycetix Technology Solutions is a service-based technology company offering comprehensive digital solutions for businesses of all sizes.</p>
    </section>
    
    <section>
        <h2>Our Services</h2>
        <ul>
            <li><strong>Software Development:</strong> Custom applications, web development, mobile apps</li>
            <li><strong>Design Services:</strong> UI/UX design, branding, graphic design</li>
            <li><strong>IT Support:</strong> Technical support, maintenance, consulting</li>
            <li><strong>Photography & Videography:</strong> Professional media production</li>
        </ul>
    </section>
</div>
{% endblock %}
""",
        
        # Contact page
        "frontend/contact/contact.html": """{% extends 'includes/base.html' %}

{% block title %}Contact Us - Dycetix Technology Solutions{% endblock %}

{% block content %}
<div class="container">
    <h1>Contact Us</h1>
    
    <div class="contact-grid">
        <div class="contact-info">
            <h2>Get in Touch</h2>
            <p><strong>Email:</strong> solutions@dycetix.co.za</p>
            <p><strong>Phone:</strong> +27 075 195 5229</p>
            <p><strong>Hours:</strong> Mon-Fri 9am-5pm</p>
        </div>
        
        <div class="contact-form">
            <h2>Send a Message</h2>
            <form id="contactForm">
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <textarea placeholder="Your Message" rows="5" required></textarea>
                <button type="submit" class="button">Send Message</button>
            </form>
        </div>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script>
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you! This form will be functional when connected to the admin system.');
});
</script>
{% endblock %}
"""
    }
    
    templates_dir = client_portal / "templates"
    for template_path, content in templates.items():
        full_path = templates_dir / template_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not full_path.exists():
            full_path.write_text(content)
            print(f"  Created: templates/{template_path}")
    
    # ============================================
    # 4. UPDATE MAIN URLS.PY
    # ============================================
    print("\n4. Updating main URLs configuration...")
    
    main_urls = customer_dir / "dycetix_project" / "urls.py"
    main_urls.write_text("""from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Core pages
    path('', include('client_portal.apps.core.urls')),
    
    # Search
    path('search/', include('client_portal.apps.search.urls')),
    
    # Forms
    path('forms/', include('client_portal.apps.forms.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
""")
    print("  Updated: dycetix_project/urls.py")
    
    # ============================================
    # 5. UPDATE SETTINGS
    # ============================================
    print("\n5. Updating settings for customer apps...")
    
    settings_base = customer_dir / "dycetix_project" / "settings" / "base.py"
    if settings_base.exists():
        content = settings_base.read_text()
        
        # Ensure our apps are in INSTALLED_APPS
        apps_to_add = [
            "'client_portal.apps.core',",
            "'client_portal.apps.search',", 
            "'client_portal.apps.forms',"
        ]
        
        lines = content.split('\n')
        new_lines = []
        in_installed_apps = False
        apps_added = False
        
        for line in lines:
            new_lines.append(line)
            
            if 'INSTALLED_APPS = [' in line:
                in_installed_apps = True
            
            if in_installed_apps and line.strip() == ']':
                # Add our apps before the closing bracket
                if not apps_added:
                    for app in apps_to_add:
                        new_lines.append(f"    {app}")
                    apps_added = True
                in_installed_apps = False
        
        settings_base.write_text('\n'.join(new_lines))
        print("  Added customer apps to INSTALLED_APPS")
    
    # Add template and static settings
    settings_content = settings_base.read_text()
    
    # Add template directory if not present
    if "'DIRS':" not in settings_content:
        # Find TEMPLATES section and add DIRS
        lines = settings_content.split('\n')
        new_lines = []
        in_templates = False
        dirs_added = False
        
        for line in lines:
            new_lines.append(line)
            
            if 'TEMPLATES = [' in line:
                in_templates = True
            
            if in_templates and "'APP_DIRS': True" in line and not dirs_added:
                # Add DIRS after APP_DIRS
                new_lines.append("            'DIRS': [")
                new_lines.append("                str(BASE_DIR / 'client_portal' / 'templates'),")
                new_lines.append("            ],")
                dirs_added = True
                in_templates = False
        
        settings_base.write_text('\n'.join(new_lines))
        print("  Added template directory to settings")
    
    print("\n✅ CUSTOMER STRUCTURE COMPLETE!")
    print("\n📁 Structure created:")
    print("  ✓ client_portal/apps/ with all Python files")
    print("  ✓ client_portal/templates/ with HTML files")
    print("  ✓ client_portal/static/ with folder structure")
    print("  ✓ client_portal/media/ for uploads")
    print("  ✓ Updated URLs and settings")
    
    print("\n🎯 To test:")
    print("  cd customer")
    print("  python manage.py runserver")
    print("  Visit: http://127.0.0.1:8000/")
    print("  Visit: http://127.0.0.1:8000/about/")
    print("  Visit: http://127.0.0.1:8000/contact/")

if __name__ == "__main__":
    print("COMPLETING CUSTOMER APP STRUCTURE")
    print("=" * 60)
    create_customer_structure()