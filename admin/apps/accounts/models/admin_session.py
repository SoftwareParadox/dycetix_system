# admin_session.py
# Empty file - content will be added later
# admin/apps/accounts/models/admin_session.py
from django.db import models

class AdminSession(models.Model):
    user = models.ForeignKey('AdminUser', on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'admin_sessions'
    
    def __str__(self):
        return f"Session for {self.user.email}"