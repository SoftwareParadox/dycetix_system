# admin_profile.py
# Empty file - content will be added later
# admin/apps/accounts/models/admin_profile.py
from django.db import models

class AdminProfile(models.Model):
    user = models.OneToOneField('AdminUser', on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'admin_profiles'
    
    def __str__(self):
        return f"Profile of {self.user.email}"