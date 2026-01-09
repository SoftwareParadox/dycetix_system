# admin/apps/forms/models/form_attachment.py
from django.db import models
from django.conf import settings
import os
import uuid


def attachment_upload_path(instance, filename):
    """Generate upload path for attachments"""
    # Store by date and unique ID
    return f"form_attachments/{instance.created_at.strftime('%Y/%m/%d')}/{uuid.uuid4()}_{filename}"


class FormAttachment(models.Model):
    """
    Model for form attachments (files uploaded with forms)
    """
    # Link to form submission
    client_requirement = models.ForeignKey(
        'ClientRequirement',
        on_delete=models.CASCADE,
        related_name='attachments',
        null=True,
        blank=True
    )
    
    # File info
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to=attachment_upload_path)
    file_size = models.BigIntegerField()  # In bytes
    mime_type = models.CharField(max_length=100)
    
    # Tracking
    uploaded_by_ip = models.GenericIPAddressField(blank=True, null=True)
    uploaded_by_user_agent = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'form_attachments'
        ordering = ['-created_at']
        verbose_name = 'Form Attachment'
        verbose_name_plural = 'Form Attachments'
    
    def __str__(self):
        return f"{self.original_filename} ({self.file_size} bytes)"
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)
    
    @property
    def download_url(self):
        """Get download URL for the file"""
        return self.file.url if self.file else None
    
    def save(self, *args, **kwargs):
        # Set file size before saving
        if self.file and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)