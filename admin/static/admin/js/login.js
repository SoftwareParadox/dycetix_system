// admin/static/admin/js/login.js
document.addEventListener('DOMContentLoaded', function() {
    // Theme switcher functionality
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('adminTheme') || 'synthwave';
    applyTheme(savedTheme);

    // Add loading state to submit button
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('input[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.value = 'LOGGING IN...';
            
            // Remove loading state after 3 seconds if still on page
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.value = 'LOG IN';
            }, 3000);
        });
    }

    // Matrix rain effect for Cyberpunk theme
    if (document.body.classList.contains('cyberpunk-theme')) {
        createMatrixRain();
    }

    // Add sound effects (optional - uncomment when you have sound files)
    // setupSoundEffects();

    // Add input focus animations
    setupInputAnimations();
});

function toggleTheme() {
    const themes = ['synthwave', 'cyberpunk2077', 'bladerunner'];
    const currentTheme = localStorage.getItem('adminTheme') || 'synthwave';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    applyTheme(nextTheme);
    localStorage.setItem('adminTheme', nextTheme);
}

function applyTheme(themeName) {
    const themeCSS = document.getElementById('theme-css');
    if (themeCSS) {
        themeCSS.href = `/static/admin/css/themes/${themeName}.css`;
    }
    
    // Update body class for theme-specific effects
    document.body.className = document.body.className.replace(/cyberpunk-theme|bladerunner-theme|synthwave-theme/g, '');
    document.body.classList.add(themeName + '-theme');
}

function createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('matrix-rain');
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"#&_(),.;:?!|{}[]';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for(let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height);
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(13, 13, 26, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ffc3';
        ctx.font = fontSize + 'px monospace';
        
        for(let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    const matrixInterval = setInterval(draw, 33);
    
    // Clean up on theme change
    return () => clearInterval(matrixInterval);
}

function setupInputAnimations() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Add typing effect
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
}

function setupSoundEffects() {
    // This function requires sound files in admin/static/admin/sounds/
    const focusSound = new Audio('/static/admin/sounds/focus.mp3');
    const clickSound = new Audio('/static/admin/sounds/click.mp3');
    
    // Focus sound on input focus
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            focusSound.currentTime = 0;
            focusSound.play().catch(e => console.log('Audio play failed:', e));
        });
    });
    
    // Click sound on button click
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log('Audio play failed:', e));
        });
    });
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Reinitialize effects on resize
        if (document.body.classList.contains('cyberpunk-theme')) {
            document.querySelector('.matrix-rain')?.remove();
            createMatrixRain();
        }
    }, 250);
});