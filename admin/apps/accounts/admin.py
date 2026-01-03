# # admin/apps/accounts/admin.py
# from django.contrib import admin
# from .models.admin_user import AdminUser
# from django.contrib.auth.admin import UserAdmin
# from django.utils.translation import gettext_lazy as _

# @admin.register(AdminUser)
# class AdminUserAdmin(UserAdmin):
#     # Use email instead of username
#     ordering = ('email',)
    
#     # Remove username from fieldsets
#     fieldsets = (
#         (None, {'fields': ('email', 'password')}),
#         (_('Personal Info'), {'fields': ('first_name', 'last_name')}),
#         (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
#         (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
#     )
    
#     # Update add_fieldsets to use email
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('email', 'password1', 'password2'),
#         }),
#     )
    
#     # Update list_display
#     list_display = ('email', 'first_name', 'last_name', 'is_staff')
#     search_fields = ('email', 'first_name', 'last_name')
#     list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
