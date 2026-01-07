// Create namespace if it doesn't exist
window.AdminApp = window.AdminApp || {};
window.AdminApp.Helpers = window.AdminApp.Helpers || {};

(function() {
    'use strict';
    
    // Helper functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatCurrency(amount, currency = 'ZAR') {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    function copyToClipboard(text) {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            AdminApp.Helpers.showNotification('success', 'Copied to clipboard!');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            AdminApp.Helpers.showNotification('success', 'Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            AdminApp.Helpers.showNotification('error', 'Failed to copy to clipboard');
        });
    }

    function getCsrfToken() {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.content : '';
    }

    function showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to container
        const container = document.getElementById('notification-container') || createNotificationContainer();
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.parentNode.removeChild(notification), 300);
            }
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => notification.parentNode.removeChild(notification), 300);
        });
    }
    
    function createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }
    
    // Export to namespace
    AdminApp.Helpers.debounce = debounce;
    AdminApp.Helpers.formatDate = formatDate;
    AdminApp.Helpers.formatCurrency = formatCurrency;
    AdminApp.Helpers.copyToClipboard = copyToClipboard;
    AdminApp.Helpers.getCsrfToken = getCsrfToken;
    AdminApp.Helpers.showNotification = showNotification;
})();