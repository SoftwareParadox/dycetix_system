// // Particle Animation
// const canvas = document.querySelector('.desktop-hero-particle-canvas');
// const ctx = canvas.getContext('2d');
// let particles = [];

// class Particle {
//     constructor() {
//         this.x = Math.random() * canvas.width;
//         this.y = Math.random() * canvas.height;
//         this.size = Math.random() * 2 + 1;
//         this.speedX = Math.random() * 3 - 1.5;
//         this.speedY = Math.random() * 3 - 1.5;
//     }

//     update() {
//         this.x += this.speedX;
//         this.y += this.speedY;

//         if (this.x > canvas.width) this.x = 0;
//         if (this.x < 0) this.x = canvas.width;
//         if (this.y > canvas.height) this.y = 0;
//         if (this.y < 0) this.y = canvas.height;
//     }

//     draw() {
//         ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.fill();
//     }
// }

// function init() {
//     canvas.width = window.innerWidth;
//     canvas.height = document.querySelector('.desktop-hero').offsetHeight;
    
//     particles = [];
//     for (let i = 0; i < 100; i++) {
//         particles.push(new Particle());
//     }
// }

// function animate() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     particles.forEach(particle => {
//         particle.update();
//         particle.draw();
//     });
    
//     requestAnimationFrame(animate);
// }

// window.addEventListener('resize', init);
// init();
// animate();

// why entrust us
// Tab functionality
// Wait for DOM to be fully loaded
// Add this debug version to identify conflicts
document.addEventListener('DOMContentLoaded', function() {
    console.log('Desktop Development JS Loaded');
    
    // Namespace our functionality
    const dycetixDesktopTabs = {
        init: function() {
            this.bindTabs();
            console.log('Dycetix desktop tabs initialized');
        },
        
        bindTabs: function() {
            const tabs = document.querySelectorAll('.why-us-tab');
            console.log('Found tabs:', tabs.length);
            
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event bubbling
                    console.log('Tab clicked:', tab.dataset.tab);
                    this.switchTab(tab.dataset.tab);
                });
            });
        },
        
        switchTab: function(tabId) {
            console.log('Switching to tab:', tabId);
            
            // Remove active classes
            document.querySelectorAll('.why-us-tab').forEach(t => {
                t.classList.remove('active');
            });
            document.querySelectorAll('.why-us-tab-content').forEach(c => {
                c.classList.remove('active');
            });
            
            // Add active classes
            const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
            const activeContent = document.getElementById(tabId);
            
            if (activeTab && activeContent) {
                activeTab.classList.add('active');
                activeContent.classList.add('active');
                console.log('Tab switch successful');
            } else {
                console.error('Tab or content not found:', tabId);
            }
        }
    };
    
    // Initialize only if on desktop development page
    if (document.querySelector('.why-us-section')) {
        dycetixDesktopTabs.init();
    }
});


