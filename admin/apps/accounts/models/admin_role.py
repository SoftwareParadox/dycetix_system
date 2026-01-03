# admin_role.py
# Empty file - content will be added later
# admin/apps/accounts/models/admin_role.py
from django.db import models

class AdminRole(models.Model):
    name = models.CharField(max_length=100, unique=True)
    permissions = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'admin_roles'
    
    def __str__(self):
        return self.name