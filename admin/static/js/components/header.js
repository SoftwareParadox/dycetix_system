// admin/static/admin/js/components/header.js
function initHeader() {
    // Search functionality
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', debounce(function(e) {
            if (e.target.value.length > 2) {
                // Trigger HTMX search
                htmx.trigger(searchInput, 'keyup');
            }
        }, 300));
    }
    
    // Notifications dropdown
    const notificationsBtn = document.querySelector('.notifications-btn');
    const notificationsPopup = document.getElementById('notifications-popup');
    
    if (notificationsBtn && notificationsPopup) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationsPopup.classList.toggle('show');
            
            // Close user menu if open
            document.getElementById('user-dropdown').classList.remove('show');
            
            // Load notifications if not already loaded
            if (notificationsPopup.classList.contains('show')) {
                loadNotifications();
            }
        });
    }
    
    // User menu dropdown
    const userBtn = document.querySelector('.user-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            
            // Close notifications if open
            notificationsPopup.classList.remove('show');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        notificationsPopup.classList.remove('show');
        userDropdown.classList.remove('show');
    });
    
    // Prevent dropdown close when clicking inside
    if (notificationsPopup) {
        notificationsPopup.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Quick actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('onclick');
            if (action && action.includes('openModal')) {
                // Modal will be handled separately
            }
        });
    });
}

function toggleNotifications() {
    const popup = document.getElementById('notifications-popup');
    popup.classList.toggle('show');
    
    if (popup.classList.contains('show')) {
        loadNotifications();
    }
}

function toggleUserMenu() {
    document.getElementById('user-dropdown').classList.toggle('show');
}

function loadNotifications() {
    // Use HTMX to load notifications
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList && notificationsList.children.length <= 1) {
        htmx.ajax('GET', '/admin/api/notifications/recent/', {
            target: '#notifications-list',
            swap: 'innerHTML'
        });
    }
}

function markAllAsRead() {
    htmx.ajax('POST', '/admin/api/notifications/mark-all-read/', {
        target: '#notifications-list',
        swap: 'innerHTML'
    });
    
    // Update badge count
    document.getElementById('notification-count').textContent = '0';
    document.getElementById('notification-count').style.display = 'none';
}

function refreshData() {
    // Trigger HTMX refresh on dashboard components
    document.querySelectorAll('[hx-get]').forEach(el => {
        htmx.trigger(el, 'refresh');
    });
    showNotification('success', 'Data refreshed');
}

function exportData() {
    // Simple export functionality
    showNotification('info', 'Export started...');
    window.open('/admin/api/export/', '_blank');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initHeader);