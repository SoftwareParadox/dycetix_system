# admin/apps/forms/api/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from ..models.client_requirement import ClientRequirement
from .serializers import ClientRequirementSerializer, ClientRequirementStatusSerializer


class ClientRequirementViewSet(viewsets.ModelViewSet):
    """
    API endpoint for client requirements
    - Public POST for submissions
    - Authenticated GET for admin
    """
    queryset = ClientRequirement.objects.all()
    serializer_class = ClientRequirementSerializer
    
    def get_permissions(self):
        """
        Custom permissions:
        - Allow anyone to POST (submit forms)
        - Require authentication for GET, PUT, PATCH, DELETE
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role and query params"""
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by assigned_to if provided
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter by service if provided
        service = self.request.query_params.get('service')
        if service:
            queryset = queryset.filter(service_needed=service)
        
        # Filter by search term if provided
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company__icontains=search) |
                Q(project_description__icontains=search)
            )
        
        # For non-super users, show only assigned or unassigned
        if not self.request.user.is_superuser:
            queryset = queryset.filter(
                Q(assigned_to=self.request.user) | 
                Q(assigned_to__isnull=True)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics for dashboard"""
        # Total counts by status
        status_counts = ClientRequirement.objects.values('status').annotate(
            count=Count('id')
        )
        
        # Today's submissions
        today = timezone.now().date()
        today_count = ClientRequirement.objects.filter(
            created_at__date=today
        ).count()
        
        # Unassigned requirements
        unassigned_count = ClientRequirement.objects.filter(
            assigned_to__isnull=True,
            status='new'
        ).count()
        
        # Service breakdown
        service_counts = ClientRequirement.objects.values('service_needed').annotate(
            count=Count('id')
        )
        
        return Response({
            'status_counts': dict(status_counts),
            'today_count': today_count,
            'unassigned_count': unassigned_count,
            'service_counts': dict(service_counts),
            'total': ClientRequirement.objects.count()
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update status of a client requirement"""
        requirement = self.get_object()
        serializer = ClientRequirementStatusSerializer(
            requirement, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent submissions (last 7 days)"""
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent = ClientRequirement.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)