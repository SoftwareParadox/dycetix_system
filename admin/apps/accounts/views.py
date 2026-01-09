# admin/apps/accounts/views.py
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils import timezone


@login_required
def custom_logout(request):
    """
    Custom logout view that handles GET requests
    and displays a custom logout page
    """
    # Store user info before logging out
    user_email = request.user.email
    user_name = request.user.get_full_name() or request.user.email
    last_login = request.user.last_login
    
    # Perform logout
    logout(request)
    
    # Clear session
    request.session.flush()
    
    # Render custom logout page
    return render(request, 'admin/logout.html', {
        'user_email': user_email,
        'user_name': user_name,
        'last_login': last_login,
        'logout_time': timezone.now()
    })