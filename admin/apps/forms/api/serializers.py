# admin/apps/forms/api/serializers.py
from rest_framework import serializers
from ..models.client_requirement import ClientRequirement
from ..constants import ServiceType


class ClientRequirementSerializer(serializers.ModelSerializer):
    """Serializer for Client Requirement form submissions"""
    
    # Custom fields for display
    full_name = serializers.SerializerMethodField()
    service_display = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientRequirement
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'company',
            'service_needed',
            'service_display',
            'other_service',
            'project_description',
            'timeline',
            'status',
            'priority',
            'assigned_to',
            'created_at',
            'created_at_formatted',
            'ip_address',
        ]
        read_only_fields = ['id', 'created_at', 'ip_address', 'status']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_service_display(self, obj):
        return obj.get_final_service()
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%b %d, %Y %I:%M %p")
    
    def validate(self, data):
        """Custom validation for form data"""
        # If service is "other", require other_service field
        if data.get('service_needed') == ServiceType.OTHER and not data.get('other_service'):
            raise serializers.ValidationError({
                'other_service': 'Please specify the service when selecting "Other"'
            })
        return data
    
    def create(self, validated_data):
        """Create a new client requirement with IP address"""
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = request.META.get('REMOTE_ADDR')
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return super().create(validated_data)


class ClientRequirementStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating status only"""
    class Meta:
        model = ClientRequirement
        fields = ['status', 'assigned_to', 'internal_notes']