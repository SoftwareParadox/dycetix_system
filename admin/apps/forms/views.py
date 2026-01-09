# admin/apps/forms/views.py
import json
import base64
import mimetypes
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.base import ContentFile
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.db import connection

from .models.client_requirement import ClientRequirement
from .models.form_attachment import FormAttachment

# admin/apps/forms/views.py - ADD THIS FUNCTION
@login_required
@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def client_requirement_detail(request, pk):
    """
    Get or update details of a specific client requirement
    GET: Return all details
    PATCH: Update status/notes
    """
    try:
        requirement = ClientRequirement.objects.get(pk=pk)
    except ClientRequirement.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Client requirement not found'
        }, status=404)
    
    if request.method == 'GET':
        # Get all attachments
        attachments = []
        for attachment in requirement.attachments.all():
            attachments.append({
                'id': attachment.id,
                'filename': attachment.original_filename,
                'url': attachment.file.url,
                'size_mb': attachment.file_size_mb,
                'mime_type': attachment.mime_type,
                'uploaded_at': attachment.created_at.isoformat()
            })
        
        data = {
            'id': requirement.id,
            'first_name': requirement.first_name,
            'last_name': requirement.last_name,
            'email': requirement.email,
            'phone': requirement.phone,
            'company': requirement.company,
            'services': requirement.services,
            'other_service': requirement.other_service,
            'project_description': requirement.project_description,
            'budget_range': requirement.budget_range,
            'timeline': requirement.timeline,
            'source': requirement.source,
            'status': requirement.status,
            'status_display': requirement.get_status_display(),
            'priority': requirement.priority,
            'internal_notes': requirement.internal_notes,
            'admin_response': requirement.admin_response,
            'assigned_to': requirement.assigned_to.get_full_name() if requirement.assigned_to else None,
            'assigned_to_id': requirement.assigned_to.id if requirement.assigned_to else None,
            'created_at': requirement.created_at.isoformat(),
            'created_at_formatted': requirement.created_at.strftime('%Y-%m-%d %H:%M'),
            'ip_address': requirement.ip_address,
            'user_agent': requirement.user_agent,
            'attachments': attachments,
            'attachments_count': len(attachments)
        }
        
        return JsonResponse({
            'success': True,
            'data': data
        })
    
    elif request.method == 'PATCH':
        # Update the requirement
        try:
            data = json.loads(request.body.decode('utf-8'))
            
            # Allowed fields to update
            allowed_fields = ['status', 'priority', 'assigned_to_id', 'internal_notes', 'admin_response']
            
            for field in allowed_fields:
                if field in data:
                    if field == 'assigned_to_id':
                        if data[field]:
                            try:
                                from accounts.models import AdminUser
                                user = AdminUser.objects.get(id=data[field])
                                requirement.assigned_to = user
                            except AdminUser.DoesNotExist:
                                pass
                        else:
                            requirement.assigned_to = None
                    else:
                        setattr(requirement, field, data[field])
            
            # If status is being updated to 'contacted' and no assigned_to, assign to current user
            if 'status' in data and data['status'] == 'contacted' and not requirement.assigned_to:
                requirement.assigned_to = request.user
            
            requirement.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Updated successfully',
                'data': {
                    'id': requirement.id,
                    'status': requirement.status,
                    'status_display': requirement.get_status_display(),
                    'priority': requirement.priority,
                    'assigned_to': requirement.assigned_to.get_full_name() if requirement.assigned_to else None
                }
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Update failed: {str(e)}'
            }, status=500)
@login_required
@csrf_exempt
@require_http_methods(["GET"])
def admin_stats(request):
    """Stats for custom admin dashboard sidebar"""
    total_requirements = ClientRequirement.objects.count()
    new_requirements = ClientRequirement.objects.filter(status='new').count()
    today_requirements = ClientRequirement.objects.filter(
        created_at__date=timezone.now().date()
    ).count()
    
    return JsonResponse({
        'success': True,
        'data': {
            'total_forms': total_requirements,
            'new_forms': new_requirements,
            'today_forms': today_requirements,
            'alerts': 0,
            'system_status': 'online'
        }
    })


@login_required
@csrf_exempt
@require_http_methods(["GET"])
def admin_health(request):
    """Health check for custom admin dashboard"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = 'connected'
    except Exception as e:
        db_status = f'disconnected: {str(e)}'
    
    return JsonResponse({
        'success': True,
        'data': {
            'status': 'ok',
            'database': db_status,
            'timestamp': timezone.now().isoformat()
        }
    })


@login_required
@csrf_exempt
@require_http_methods(["GET"])
def sidebar_stats(request):
    """Get stats for sidebar (new forms count)"""
    new_requirements = ClientRequirement.objects.filter(status='new').count()
    
    return JsonResponse({
        'success': True,
        'new_forms': new_requirements,
        'alerts': 0
    })


@login_required
@csrf_exempt
@require_http_methods(["GET"])
def notifications_unread_count(request):
    """Get unread notifications count (placeholder)"""
    return JsonResponse({
        'success': True,
        'count': 0
    })
@csrf_exempt  # For now, we'll exempt CSRF for form submissions
@require_http_methods(["POST"])
def submit_client_requirement(request):
    """
    Handle form submissions from customer app
    """
    try:
        # Parse JSON data
        data = json.loads(request.body.decode('utf-8'))
        
        # Extract form data
        form_data = {
            'first_name': data.get('firstName', '').strip(),
            'last_name': data.get('lastName', '').strip(),
            'email': data.get('email', '').strip().lower(),
            'phone': data.get('phone', '').strip(),
            'company': data.get('company', '').strip(),
            'services': data.get('services', []),  # Array of service codes
            'other_service': data.get('otherService', '').strip(),
            'project_description': data.get('projectDetails', '').strip(),
            'source': data.get('source', 'website'),  # 'website' or 'website-modal'
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'project_description']
        for field in required_fields:
            if not form_data[field]:
                return JsonResponse({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=400)
        
        # Validate at least one service is selected
        if not form_data['services']:
            return JsonResponse({
                'success': False,
                'error': 'Please select at least one service'
            }, status=400)
        
        # If "other" is selected, require other_service
        if 'other' in form_data['services'] and not form_data['other_service']:
            return JsonResponse({
                'success': False,
                'error': 'Please specify the "Other" service'
            }, status=400)
        
        # Create the client requirement
        client_req = ClientRequirement.objects.create(**form_data)
        
        # Handle file uploads if present
        files = data.get('files', [])
        attachments_created = []
        
        for file_data in files:
            try:
                # Decode base64 file
                file_content = base64.b64decode(file_data['data'])
                
                # Create file name
                file_name = file_data['name']
                
                # Create ContentFile
                content_file = ContentFile(file_content, name=file_name)
                
                # Create attachment
                attachment = FormAttachment.objects.create(
                    client_requirement=client_req,
                    original_filename=file_name,
                    file=content_file,
                    file_size=file_data['size'],
                    mime_type=file_data['type'],
                    uploaded_by_ip=form_data['ip_address'],
                    uploaded_by_user_agent=form_data['user_agent']
                )
                
                attachments_created.append({
                    'filename': file_name,
                    'size': file_data['size'],
                    'id': attachment.id
                })
                
            except Exception as e:
                # Log the error but don't fail the entire submission
                print(f"Error processing file {file_data.get('name', 'unknown')}: {str(e)}")
                continue
        
        # Return success response
        return JsonResponse({
            'success': True,
            'message': 'Form submitted successfully',
            'submission_id': client_req.id,
            'attachments_count': len(attachments_created),
            'submission_date': client_req.created_at.isoformat()
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Server error: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def client_requirements_list(request):
    """
    List client requirements for admin dashboard (requires authentication)
    """
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'error': 'Authentication required'
        }, status=401)
    
    # Get filter parameters
    status_filter = request.GET.get('status')
    search_query = request.GET.get('search', '')
    
    # Start with base queryset
    requirements = ClientRequirement.objects.all()
    
    # Apply filters
    if status_filter:
        requirements = requirements.filter(status=status_filter)
    
    if search_query:
        requirements = requirements.filter(
            models.Q(first_name__icontains=search_query) |
            models.Q(last_name__icontains=search_query) |
            models.Q(email__icontains=search_query) |
            models.Q(company__icontains=search_query) |
            models.Q(project_description__icontains=search_query)
        )
    
    # Order by newest first
    requirements = requirements.order_by('-created_at')[:50]  # Limit to 50
    
    # Prepare response data
    data = []
    for req in requirements:
        data.append({
            'id': req.id,
            'full_name': req.full_name,
            'email': req.email,
            'company': req.company,
            'phone': req.phone,
            'services': req.selected_services,
            'project_description': req.project_description,
            'status': req.status,
            'status_display': req.get_status_display(),
            'priority': req.priority,
            'created_at': req.created_at.isoformat(),
            'created_at_formatted': req.created_at.strftime('%Y-%m-%d %H:%M'),
            'assigned_to': req.assigned_to.get_full_name() if req.assigned_to else None,
            'attachments_count': req.attachments.count()
        })
    
    # Get counts for dashboard
    counts = {
        'total': ClientRequirement.objects.count(),
        'new': ClientRequirement.objects.filter(status='new').count(),
        'contacted': ClientRequirement.objects.filter(status='contacted').count(),
        'today': ClientRequirement.objects.filter(
            created_at__date=timezone.now().date()
        ).count(),
    }
    
    return JsonResponse({
        'success': True,
        'data': data,
        'counts': counts,
        'total_count': len(data)
    })