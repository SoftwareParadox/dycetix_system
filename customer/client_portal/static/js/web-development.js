document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect for 3D preview
    const preview = document.querySelector('.webdev-hero-website-preview');
    
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;
        preview.style.transform = `rotateX(${yAxis}deg) rotateY(${-xAxis}deg)`;
    });
});
// Sample content cycling for tech stack
const stackItems = document.querySelectorAll('.stack-item');
let current = 0;

setInterval(() => {
    stackItems[current].classList.remove('active');
    current = (current + 1) % stackItems.length;
    stackItems[current].classList.add('active');
}, 3000); // end of hero code

// why entrust  us
// JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Number animation with proper handling
    const animateNumbers = (entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const statNumbers = document.querySelectorAll('.webdev-why-us-stat-number');
                
                statNumbers.forEach(number => {
                    const content = number.textContent.trim();
                    let target;
                    
                    // Handle different number cases
                    if(content === '0%') {
                        target = 0;
                        animateValue(number, 100, target, '%');
                    } 
                    else if(content === '1:1') {
                        target = 1;
                        animateValue(number, 0, target, ':1');
                    }
                    // Skip infinity symbol
                });
                
                observer.disconnect();
            }
        });
    };

    const observer = new IntersectionObserver(animateNumbers, { threshold: 0.5 });
    observer.observe(document.querySelector('.webdev-why-us-section'));

    // Card hover effects with safety check
    setTimeout(() => {
        document.querySelectorAll('.webdev-why-us-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }, 500);

    // Proper number animation function
    function animateValue(element, start, end, suffix = '') {
        const duration = 1500;
        const startTime = Date.now();
        
        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            element.textContent = `${value}${suffix}`;
            
            if(progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
});
// pricing


// more services
// JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Card hover effects
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Animate particles
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animation = `float ${8 + Math.random() * 8}s infinite`;
    });

    // Intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
    });
});