# admin/apps/forms/constants.py
from django.db import models


class ServiceType(models.TextChoices):
    SOFTWARE = 'software', 'Software Development'
    DESIGN = 'design', 'Design'
    IT_SUPPORT = 'it_support', 'IT Support'
    PHOTOGRAPHY = 'photography', 'Photography'
    VIDEOGRAPHY = 'videography', 'Videography'
    OTHER = 'other', 'Other'


class RequirementStatus(models.TextChoices):
    NEW = 'new', 'New'
    CONTACTED = 'contacted', 'Contacted'
    QUOTED = 'quoted', 'Quoted'
    CONVERTED = 'converted', 'Converted'
    ARCHIVED = 'archived', 'Archived'


class PriorityType(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'


# We'll also need other form types later
class FormType(models.TextChoices):
    CLIENT_REQUIREMENT = 'client_requirement', 'Client Requirement'
    SUBSCRIPTION = 'subscription', 'Subscription'
    JOB_APPLICATION = 'job_application', 'Job Application'
    PARTNERSHIP = 'partnership', 'Partnership'
    REFERRAL = 'referral', 'Referral'