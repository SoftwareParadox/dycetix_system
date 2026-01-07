// admin/static/admin/js/base/theme.js
function initTheme() {
    // Load saved theme
    const savedTheme = localStorage.getItem('admin-theme') || 'synthwave';
    setTheme(savedTheme);
    
    // Setup theme toggle buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
            localStorage.setItem('admin-theme', theme);
        });
    });
}

function setTheme(themeName) {
    // Update data-theme attribute
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Update theme CSS
    const themeCSS = document.getElementById('theme-css');
    if (themeCSS) {
        themeCSS.href = `/static/admin/css/theme/${themeName}.css`;
    }
    
    // Update active button
    document.querySelectorAll('[data-theme]').forEach(btn => {
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    window.theme = themeName;
}

function toggleTheme() {
    const themes = ['synthwave', 'dark', 'light'];
    const currentIndex = themes.indexOf(window.theme || 'synthwave');
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    localStorage.setItem('admin-theme', themes[nextIndex]);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initTheme);