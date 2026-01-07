// admin/static/admin/js/components/notifications.js
function initNotifications() {
    // Load initial notification count
    updateNotificationCount();
    
    // Set up periodic refresh (every 30 seconds)
    setInterval(updateNotificationCount, 30000);
    
    // Setup notification close buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.notification-close')) {
            e.target.closest('.notification').remove();
        }
    });
}

async function updateNotificationCount() {
    try {
        const response = await fetch('/admin/api/notifications/unread-count/');
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('notification-count');
            if (badge) {
                badge.textContent = data.count || 0;
                badge.style.display = data.count > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Failed to update notification count:', error);
    }
}

function showNotification(type, message, duration = 5000) {
    const container = document.getElementById('notifications-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="notification-icon fas fa-${getIconForType(type)}"></i>
        <span class="notification-message">${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notifications-container';
    container.className = 'notifications-container';
    document.body.appendChild(container);
    return container;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initNotifications);

// Export for global use
window.showNotification = showNotification;