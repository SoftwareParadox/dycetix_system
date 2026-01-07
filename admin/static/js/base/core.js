// Core functionality for admin base
// Clean version without tooltips

function initAdminBase() {
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Initialize system status check
    checkSystemStatus();
    
    // Initialize real-time updates
    initRealTimeUpdates();
    
    // Initialize click outside handlers
    initClickOutsideHandlers();
    
    // Set up error handling
    setupErrorHandling();
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Don't trigger shortcuts when typing in inputs
        if (event.target.matches('input, textarea, select')) return;
        
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + R for refresh
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            window.location.reload();
        }
        
        // Escape to close modals and dropdowns
        if (event.key === 'Escape') {
            closeAllDropdowns();
            closeAllModals();
        }
        
        // ? for help (optional - remove if not needed)
        if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            openHelp();
        }
    });
}

// System Status
async function checkSystemStatus() {
    try {
        const response = await fetch('/admin/api/health/');
        if (response.ok) {
            const data = await response.json();
            updateSystemStatus(data.status === 'healthy');
        }
    } catch (error) {
        updateSystemStatus(false);
    }
}

function updateSystemStatus(healthy) {
    const statusIndicator = document.getElementById('system-status');
    if (!statusIndicator) return;
    
    if (healthy) {
        statusIndicator.style.background = 'var(--synth-success)';
        statusIndicator.style.boxShadow = '0 0 10px var(--synth-success)';
        statusIndicator.title = 'System Online';
    } else {
        statusIndicator.style.background = 'var(--synth-danger)';
        statusIndicator.style.boxShadow = '0 0 10px var(--synth-danger)';
        statusIndicator.title = 'System Issues Detected';
    }
}

// Real-time Updates
function initRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Check for notifications every minute
    setInterval(checkNotifications, 60000);
    
    // Initial updates
    updateStats();
    checkNotifications();
}

async function updateStats() {
    try {
        const response = await fetch('/admin/api/stats/');
        if (response.ok) {
            const data = await response.json();
            
            // Update new forms count
            const newFormsEl = document.getElementById('new-forms-count');
            if (newFormsEl && data.new_forms !== undefined) {
                newFormsEl.textContent = data.new_forms;
            }
            
            // Update alerts count
            const alertsEl = document.getElementById('alerts-count');
            if (alertsEl && data.alerts !== undefined) {
                alertsEl.textContent = data.alerts;
            }
            
            // Update notification badge
            const notifBadge = document.getElementById('notification-count');
            if (notifBadge && data.notifications !== undefined) {
                notifBadge.textContent = data.notifications;
                notifBadge.style.display = data.notifications > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

async function checkNotifications() {
    try {
        const response = await fetch('/admin/api/notifications/unread-count/');
        if (response.ok) {
            const data = await response.json();
            const notifBadge = document.getElementById('notification-count');
            if (notifBadge) {
                notifBadge.textContent = data.count;
                notifBadge.style.display = data.count > 0 ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error('Failed to check notifications:', error);
    }
}

// Click Outside Handlers
function initClickOutsideHandlers() {
    document.addEventListener('click', (event) => {
        // Close dropdowns when clicking outside
        if (!event.target.closest('.notifications-popup') && 
            !event.target.closest('.notifications-btn') &&
            !event.target.closest('.user-dropdown') &&
            !event.target.closest('.user-btn')) {
            closeAllDropdowns();
        }
        
        // Close modals when clicking on backdrop
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Error Handling
function setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showNotification('error', 'An unexpected error occurred');
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled rejection:', event.reason);
        showNotification('error', 'An operation failed');
    });
}

// Utility Functions
function closeAllDropdowns() {
    document.querySelectorAll('.notifications-popup, .user-dropdown').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    
    document.querySelectorAll('.menu-item.active').forEach(item => {
        item.classList.remove('active');
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showNotification(type, message, duration = 5000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="notification-icon fas fa-${getNotificationIcon(type)}"></i>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function openHelp() {
    window.open('/admin/help/', '_blank');
}

// Export functions for global use
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
window.openHelp = openHelp;