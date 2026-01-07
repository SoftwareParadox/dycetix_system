// admin/static/admin/js/components/sidebar.js
// Sidebar functionality - UPDATED VERSION

function initSidebar() {
    // Menu item click handlers
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', handleMenuClick);
    });
    
    // Initialize active state based on current page
    highlightActiveMenu();
    
    // Load initial stats
    loadSidebarStats();
    
    // Setup system status check
    setupSystemStatusCheck();
    
    // Setup flyout submenu for collapsed state
    setupFlyoutSubmenus();
    
    // Close flyout when clicking outside
    setupClickOutsideHandler();
}

function handleMenuClick(event) {
    const link = event.currentTarget;
    const section = link.dataset.section;
    const sidebar = document.querySelector('.admin-sidebar');
    const hasSubmenu = link.parentElement.classList.contains('has-submenu');
    
    // Handle submenu items differently in collapsed state
    if (sidebar.classList.contains('collapsed') && hasSubmenu) {
        event.preventDefault();
        event.stopPropagation();
        
        // If sidebar is collapsed and item has submenu, show flyout
        const menuItem = link.parentElement;
        const isFlyoutOpen = menuItem.classList.contains('show-flyout');
        
        // Close all other flyouts
        document.querySelectorAll('.has-submenu.show-flyout').forEach(item => {
            if (item !== menuItem) {
                item.classList.remove('show-flyout');
            }
        });
        
        // Toggle current flyout
        if (!isFlyoutOpen) {
            menuItem.classList.add('show-flyout');
            positionFlyoutSubmenu(menuItem);
        } else {
            menuItem.classList.remove('show-flyout');
        }
        
        return;
    }
    
    // Regular handling for expanded sidebar
    if (hasSubmenu) {
        event.preventDefault();
        event.stopPropagation();
        
        const menuItem = link.parentElement;
        const isActive = menuItem.classList.contains('active');
        
        // Close other submenus
        if (!isActive) {
            document.querySelectorAll('.has-submenu.active').forEach(item => {
                if (item !== menuItem) {
                    item.classList.remove('active');
                }
            });
        }
        
        // Toggle current submenu
        menuItem.classList.toggle('active');
        return;
    }
    
    // Don't prevent default for links with href
    if (link.getAttribute('href') && link.getAttribute('href') !== '#') {
        return;
    }
    
    event.preventDefault();
    
    // Update active state
    document.querySelectorAll('.menu-link.active').forEach(activeLink => {
        activeLink.classList.remove('active');
    });
    link.classList.add('active');
    
    // Load section content via HTMX
    loadSection(section);
}

function setupFlyoutSubmenus() {
    const sidebar = document.querySelector('.admin-sidebar');
    
    // Add show-flyout class on hover for collapsed sidebar
    document.querySelectorAll('.has-submenu').forEach(menuItem => {
        const link = menuItem.querySelector('.menu-link');
        
        // Hover functionality for flyout
        menuItem.addEventListener('mouseenter', function() {
            if (sidebar.classList.contains('collapsed')) {
                // Close other flyouts
                document.querySelectorAll('.has-submenu.show-flyout').forEach(item => {
                    if (item !== menuItem) {
                        item.classList.remove('show-flyout');
                    }
                });
                
                this.classList.add('show-flyout');
                positionFlyoutSubmenu(this);
            }
        });
        
        menuItem.addEventListener('mouseleave', function(e) {
            // Don't close immediately if mouse moves to flyout
            const flyout = this.querySelector('.submenu');
            if (flyout && flyout.contains(e.relatedTarget)) {
                return;
            }
            
            setTimeout(() => {
                if (!this.matches(':hover') && !flyout?.matches(':hover')) {
                    this.classList.remove('show-flyout');
                }
            }, 100);
        });
        
        // Keep flyout open when hovering over it
        const submenu = menuItem.querySelector('.submenu');
        if (submenu) {
            submenu.addEventListener('mouseenter', function() {
                menuItem.classList.add('show-flyout');
            });
            
            submenu.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    if (!menuItem.matches(':hover') && !this.matches(':hover')) {
                        menuItem.classList.remove('show-flyout');
                    }
                }, 100);
            });
        }
    });
}

function positionFlyoutSubmenu(menuItem) {
    const submenu = menuItem.querySelector('.submenu');
    if (!submenu) return;
    
    const rect = menuItem.getBoundingClientRect();
    const sidebar = document.querySelector('.admin-sidebar');
    
    // Position the flyout to the right of the menu item
    submenu.style.position = 'fixed';
    submenu.style.left = rect.right + 'px';
    submenu.style.top = rect.top + 'px';
    submenu.style.minWidth = '200px';
    submenu.style.maxHeight = '400px';
    submenu.style.overflowY = 'auto';
    submenu.style.zIndex = '10000';
    
    // Ensure it stays within viewport
    const viewportHeight = window.innerHeight;
    if (rect.top + submenu.offsetHeight > viewportHeight) {
        submenu.style.top = (viewportHeight - submenu.offsetHeight - 10) + 'px';
    }
}

function setupClickOutsideHandler() {
    document.addEventListener('click', function(event) {
        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) return;
        
        // Check if click is outside the sidebar and flyouts
        if (!event.target.closest('.admin-sidebar') && 
            !event.target.closest('.submenu')) {
            // Close all flyouts
            document.querySelectorAll('.has-submenu.show-flyout').forEach(item => {
                item.classList.remove('show-flyout');
            });
        }
    });
}

function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentPath.includes(href)) {
            link.classList.add('active');
            
            // Open parent submenu if applicable
            const parentMenuItem = link.closest('.has-submenu');
            if (parentMenuItem) {
                parentMenuItem.classList.add('active');
            }
        }
    });
}

function loadSection(section) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    // Show loading state
    mainContent.innerHTML = `
        <div class="section-loading">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
            </div>
            <p>Loading ${section}...</p>
        </div>
    `;
    
    // Load section content via HTMX
    if (window.htmx) {
        htmx.ajax('GET', `/admin/sections/${section}/`, {
            target: '#main-content',
            swap: 'innerHTML'
        });
    }
}

async function loadSidebarStats() {
    try {
        const response = await fetch('/admin/api/sidebar-stats/');
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
        }
    } catch (error) {
        console.error('Failed to load sidebar stats:', error);
    }
}

function setupSystemStatusCheck() {
    // Check system status every 60 seconds
    setInterval(checkSystemStatus, 60000);
    
    // Initial check
    checkSystemStatus();
}

async function checkSystemStatus() {
    try {
        const response = await fetch('/admin/api/health/');
        const data = await response.json();
        
        const statusIndicator = document.getElementById('system-status');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            if (data.status === 'healthy') {
                statusIndicator.style.background = 'var(--synth-success)';
                statusIndicator.style.boxShadow = '0 0 10px var(--synth-success)';
                statusIndicator.title = 'System Online';
                statusText.textContent = 'System Online';
            } else {
                statusIndicator.style.background = 'var(--synth-warning)';
                statusIndicator.style.boxShadow = '0 0 10px var(--synth-warning)';
                statusIndicator.title = 'System Issues';
                statusText.textContent = 'System Issues';
            }
        }
    } catch (error) {
        console.error('Failed to check system status:', error);
        const statusIndicator = document.getElementById('system-status');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.style.background = 'var(--synth-danger)';
            statusIndicator.style.boxShadow = '0 0 10px var(--synth-danger)';
            statusIndicator.title = 'Connection Failed';
            statusText.textContent = 'Offline';
        }
    }
}

// Sidebar Toggle Functions
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const isCollapsed = sidebar.classList.toggle('collapsed');
    
    // Save preference to localStorage
    localStorage.setItem('sidebar-collapsed', isCollapsed);
    
    // Update toggle button icon
    const toggleBtn = document.querySelector('.sidebar-action-btn[title="Collapse"]');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
            toggleBtn.title = isCollapsed ? 'Expand' : 'Collapse';
        }
    }
    
    // Close all flyouts when collapsing
    if (isCollapsed) {
        document.querySelectorAll('.has-submenu.show-flyout').forEach(item => {
            item.classList.remove('show-flyout');
        });
    }
    
    // Close all submenus when collapsing
    document.querySelectorAll('.has-submenu.active').forEach(item => {
        item.classList.remove('active');
    });
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const isOpen = sidebar.classList.toggle('mobile-open');
    
    // Update toggle button icon
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        }
    }
    
    // Close flyouts when closing mobile sidebar
    if (!isOpen) {
        document.querySelectorAll('.has-submenu.show-flyout').forEach(item => {
            item.classList.remove('show-flyout');
        });
    }
}

// Initialize sidebar on load
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    
    // Restore sidebar state from localStorage
    const wasCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (wasCollapsed && window.innerWidth >= 768) {
        document.querySelector('.admin-sidebar')?.classList.add('collapsed');
    }
    
    // On mobile, don't auto-collapse - just use mobile-open class
    if (window.innerWidth < 768) {
        document.querySelector('.admin-sidebar')?.classList.remove('collapsed');
    }
});

// Export functions for global use
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;