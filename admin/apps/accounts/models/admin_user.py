# admin/apps/accounts/models.admin_user.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from ..managers.user_manager import AdminUserManager

class AdminUser(AbstractUser):
    # Remove username
    username = None
    email = models.EmailField(unique=True, db_index=True)
    
    # Custom fields
    role = models.CharField(max_length=20, choices=[
        ('super_admin', 'Super Admin'),
        ('operations', 'Operations'),
        ('content', 'Content'),
        ('finance', 'Finance')
    ], default='operations')
    
    avatar_url = models.URLField(blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = AdminUserManager()
    
    # FIX THE CONFLICT - Add these lines to override the inherited fields:
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='adminuser_set',  # CHANGED from default
        related_query_name='adminuser',
    )
    
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='adminuser_set',  # CHANGED from default
        related_query_name='adminuser',
    )
    
    class Meta:
        db_table = 'admins'
        verbose_name = 'Admin User'
        verbose_name_plural = 'Admin Users'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()