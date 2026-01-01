# admin/apps/accounts/models/admin_user.py

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class AdminUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'super_admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class AdminUser(AbstractUser):
    # Remove username, use email as unique identifier
    username = None
    email = models.EmailField(unique=True, db_index=True)
    
    # Custom fields from your schema
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
    
    # Timestamps (AbstractUser already has date_joined)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Remove 'username' from required fields
    
    objects = AdminUserManager()
    
    class Meta:
        db_table = 'admins'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()