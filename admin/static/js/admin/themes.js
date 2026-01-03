// Theme management
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme or default to synthwave
    const savedTheme = localStorage.getItem('adminTheme') || 'synthwave';
    applyTheme(savedTheme);
    
    // Setup loading state for submit button
    setupSubmitButton();
    
    // Add sound effects to inputs
    setupInputEffects();
});

// Theme toggle functionality
function toggleTheme() {
    const themes = ['cyberpunk', 'bladerunner', 'synthwave'];
    const currentTheme = localStorage.getItem('adminTheme') || 'synthwave';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    localStorage.setItem('adminTheme', nextTheme);
    applyTheme(nextTheme);
}

// Apply a specific theme
function applyTheme(themeName) {
    // Remove all theme classes
    document.body.classList.remove('cyberpunk-theme', 'bladerunner-theme', 'synthwave-theme');
    
    // Add the selected theme class
    document.body.classList.add(themeName + '-theme');
    
    // Clear previous theme elements
    const themeElements = document.getElementById('theme-elements');
    if (themeElements) {
        themeElements.innerHTML = '';
    }
    
    // Create theme-specific elements
    createThemeElements(themeName);
    
    // Special initialization for certain themes
    if (themeName === 'cyberpunk') {
        createMatrixRain();
    }
}

// Create theme-specific HTML elements
function createThemeElements(themeName) {
    const themeElements = document.getElementById('theme-elements');
    if (!themeElements) return;
    
    switch(themeName) {
        case 'cyberpunk':
            // Create holograms
            for (let i = 0; i < 2; i++) {
                const hologram = document.createElement('div');
                hologram.className = 'hologram';
                hologram.style.cssText = `
                    top: ${10 + i * 50}%;
                    left: ${10 + i * 40}%;
                    animation-delay: ${i * 5}s;
                `;
                themeElements.appendChild(hologram);
            }
            break;
            
        case 'bladerunner':
            // Create rain effect
            const rainEffect = document.createElement('div');
            rainEffect.className = 'rain-effect';
            themeElements.appendChild(rainEffect);
            
            // Create neon grid
            const neonGrid = document.createElement('div');
            neonGrid.className = 'neon-grid';
            themeElements.appendChild(neonGrid);
            
            // Create holographic billboards
            for (let i = 0; i < 2; i++) {
                const billboard = document.createElement('div');
                billboard.className = 'holo-billboard';
                billboard.style.cssText = `
                    top: ${100 + i * 100}px;
                    animation-delay: ${i * 10}s;
                `;
                themeElements.appendChild(billboard);
            }
            break;
            
        case 'synthwave':
            // Create sun and grid
            const sunContainer = document.createElement('div');
            sunContainer.className = 'sun-container';
            sunContainer.innerHTML = '<div class="sun-gradient"></div>';
            themeElements.appendChild(sunContainer);
            
            const gridLines = document.createElement('div');
            gridLines.className = 'grid-lines';
            themeElements.appendChild(gridLines);
            
            // Create palm trees
            const palmTrees = document.createElement('div');
            palmTrees.className = 'palm-trees';
            
            const positions = [10, 30, 50, 70, 90];
            positions.forEach(pos => {
                const palmTree = document.createElement('div');
                palmTree.className = 'palm-tree';
                palmTree.style.left = `${pos}%`;
                palmTrees.appendChild(palmTree);
            });
            
            themeElements.appendChild(palmTrees);
            break;
    }
}

// Matrix rain effect for Cyberpunk theme
function createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain';
    
    // Remove existing matrix rain if any
    const existingCanvas = document.querySelector('.matrix-rain');
    if (existingCanvas) {
        existingCanvas.remove();
    }
    
    const themeElements = document.getElementById('theme-elements');
    if (themeElements) {
        themeElements.appendChild(canvas);
    } else {
        document.body.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Matrix rain properties
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"#&_(),.;:?!|{}[]';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    // Initialize drops
    for(let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
    }
    
    // Draw function
    function draw() {
        // Semi-transparent black background for trail effect
        ctx.fillStyle = 'rgba(0, 13, 26, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text properties
        ctx.fillStyle = '#00ffc3';
        ctx.font = fontSize + 'px monospace';
        
        // Draw each column
        for(let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Reset drop when it reaches bottom, with some randomness
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    // Start animation
    const animationInterval = setInterval(draw, 33);
    
    // Clean up function
    canvas.cleanup = function() {
        clearInterval(animationInterval);
        window.removeEventListener('resize', resizeCanvas);
    };
    
    // Store reference for cleanup
    canvas.matrixInterval = animationInterval;
    
    return canvas;
}

// Setup submit button loading state
function setupSubmitButton() {
    const submitBtn = document.querySelector('input[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            this.classList.add('loading');
            // Remove loading state after form submission or timeout
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
        });
    }
}

// Setup input effects
function setupInputEffects() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // Add subtle effect based on current theme
            const currentTheme = localStorage.getItem('adminTheme') || 'synthwave';
            
            // You could add sound effects here if you have audio files
            // Example:
            // if (currentTheme === 'cyberpunk') {
            //     new Audio('/static/admin/sounds/cyberpunk-focus.mp3').play();
            // }
        });
        
        input.addEventListener('input', () => {
            // Add typing effect for cyberpunk theme
            if (document.body.classList.contains('cyberpunk-theme')) {
                input.style.boxShadow = '0 0 10px #00ffc3';
                setTimeout(() => {
                    input.style.boxShadow = '';
                }, 300);
            }
        });
    });
}

// Clean up theme elements when switching themes
function cleanupThemeElements() {
    // Clean up matrix rain animation
    const matrixCanvas = document.querySelector('.matrix-rain');
    if (matrixCanvas && matrixCanvas.matrixInterval) {
        clearInterval(matrixCanvas.matrixInterval);
    }
    
    // Remove all theme-specific elements
    const themeElements = document.getElementById('theme-elements');
    if (themeElements) {
        themeElements.innerHTML = '';
    }
}

// Export functions for global access
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;
window.createMatrixRain = createMatrixRain;