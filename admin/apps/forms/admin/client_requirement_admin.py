# admin/apps/forms/admin/client_requirement_admin.py
from django.contrib import admin
from django.utils.html import format_html
from ..models.client_requirement import ClientRequirement
from ..models.form_attachment import FormAttachment


class FormAttachmentInline(admin.TabularInline):
    model = FormAttachment
    extra = 0
    readonly_fields = ['original_filename', 'file_size_mb', 'created_at']
    fields = ['original_filename', 'file_size_mb', 'download_link', 'created_at']
    
    def download_link(self, obj):
        if obj.file:
            return format_html(
                '<a href="{}" download>Download</a>',
                obj.file.url
            )
        return "-"
    download_link.short_description = "File"


@admin.register(ClientRequirement)
class ClientRequirementAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'full_name', 'email', 'get_services_display', 
        'status', 'priority', 'created_at_short', 'attachments_count'
    ]
    
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'project_description']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent', 'attachments_count']
    inlines = [FormAttachmentInline]
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'company')
        }),
        ('Project Details', {
            'fields': ('services', 'other_service', 'project_description', 'budget_range', 'timeline')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'priority', 'assigned_to')
        }),
        ('Admin Notes', {
            'fields': ('internal_notes', 'admin_response', 'response_sent_at')
        }),
        ('System Information', {
            'fields': ('source', 'ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_services_display(self, obj):
        return obj.selected_services
    get_services_display.short_description = 'Services'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = 'Submitted'
    
    def attachments_count(self, obj):
        return obj.attachments.count()
    attachments_count.short_description = 'Files'
    
    actions = ['mark_as_contacted', 'mark_as_quoted']
    
    def mark_as_contacted(self, request, queryset):
        queryset.update(status='contacted')
        self.message_user(request, f"{queryset.count()} requirements marked as contacted.")
    mark_as_contacted.short_description = "Mark selected as contacted"
    
    def mark_as_quoted(self, request, queryset):
        queryset.update(status='quoted')
        self.message_user(request, f"{queryset.count()} requirements marked as quoted.")
    mark_as_quoted.short_description = "Mark selected as quoted"