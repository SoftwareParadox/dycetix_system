# admin/apps/forms/models/client_requirement.py
from django.db import models
from django.conf import settings
import json


class ClientRequirement(models.Model):
    """
    Model for client requirement form submissions
    """
    # Personal Information (from your form)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)  # International numbers can be long
    company = models.CharField(max_length=100, blank=True, null=True)
    
    # Project Details
    services = models.JSONField(default=list)  # Store array of selected services
    other_service = models.CharField(max_length=100, blank=True, null=True)  # If "Other" is selected
    project_description = models.TextField()
    
    # Optional fields (may not be in form initially)
    budget_range = models.CharField(max_length=50, blank=True, null=True)
    timeline = models.CharField(max_length=50, blank=True, null=True)
    
    # Source & Tracking
    source = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    # Status & Assignment
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('quoted', 'Quoted'),
        ('converted', 'Converted'),
        ('archived', 'Archived'),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requirements'
    )
    
    # Admin Fields
    internal_notes = models.TextField(blank=True, null=True)
    admin_response = models.TextField(blank=True, null=True)
    response_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'client_requirements'
        ordering = ['-created_at']
        verbose_name = 'Client Requirement'
        verbose_name_plural = 'Client Requirements'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def selected_services(self):
        """Get human-readable service names"""
        service_map = {
            'software': 'Software Development',
            'design': 'Graphic Design',
            'it': 'IT Support',
            'photography': 'Photography',
            'videography': 'Videography',
            'other': 'Other'
        }
        
        services = []
        for service in self.services:
            if service == 'other' and self.other_service:
                services.append(self.other_service)
            else:
                services.append(service_map.get(service, service))
        
        return ', '.join(services)
    
    def mark_as_contacted(self, admin_user=None):
        self.status = 'contacted'
        if admin_user:
            self.assigned_to = admin_user
        self.save()