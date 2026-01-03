# admin/apps/accounts/admin_site.py - CLEAN VERSION
from django.contrib.admin import AdminSite
from .models.admin_user import AdminUser
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

class DyceTixAdminSite(AdminSite):
    """Custom admin site for DyceTix"""
    site_header = "DyceTix Admin"
    site_title = "DyceTix Administration"
    index_title = "Welcome to DyceTix Admin"
    
    # Optional: Set custom login template
    # login_template = "admin/login.html"

# Create the custom admin site instance
admin_site = DyceTixAdminSite(name="admin")

# Register models directly with the custom admin site
class AdminUserAdmin(UserAdmin):
    model = AdminUser
    list_display = ("email", "first_name", "last_name", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "created_at")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal Info"), {"fields": ("first_name", "last_name")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important Dates"), {"fields": ("created_at", "updated_at", "last_login")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "first_name", "last_name"),
        }),
    )
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    readonly_fields = ("created_at", "updated_at", "last_login")

admin_site.register(AdminUser, AdminUserAdmin)
