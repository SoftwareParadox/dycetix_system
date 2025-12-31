// JavaScript for Interactive Elements
document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect for mockups
    document.addEventListener('mousemove', (e) => {
        const mockups = document.querySelector('.mobile-hero-phone-mockups');
        const x = (window.innerWidth - e.pageX) / 30;
        const y = (window.innerHeight - e.pageY) / 30;
        
        mockups.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// service definition
document.addEventListener('DOMContentLoaded', () => {
    // Platform Workflow Switching
    const platformButtons = document.querySelectorAll('.mobile-definition-platform-btn');
    const screenContent = document.querySelector('.mobile-definition-screen-content');
    
    const platformBackgrounds = {
        ios: 'url("/static/images/main/apple.svg") no-repeat center/contain',
        android: 'url("/static/images/main/android_1.svg") no-repeat center/contain'
    };

    // Initialize background using the active button (default is iOS)
    const activePlatform = document.querySelector('.mobile-definition-platform-btn.active').dataset.platform;
    screenContent.style.background = platformBackgrounds[activePlatform];

    platformButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            platformButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const platform = btn.dataset.platform;
            screenContent.style.background = platformBackgrounds[platform];
        });
    });

    // Phase Interaction
    const phases = document.querySelectorAll('.mobile-definition-workflow-phase');
    phases.forEach(phase => {
        phase.addEventListener('mouseenter', () => {
            const phaseType = phase.dataset.phase;
            document.querySelectorAll('.mobile-definition-workflow-phase').forEach(layer => {
                layer.style.opacity = layer.dataset.phase === phaseType ? 1 : 0.2;
            });
        });
        
        phase.addEventListener('mouseleave', () => {
            document.querySelectorAll('.mobile-definition-workflow-phase').forEach(layer => {
                layer.style.opacity = 1;
            });
        });
    });

    // Tooltip Initialization
    const techItems = document.querySelectorAll('.mobile-definition-tech-item');
    techItems.forEach(item => {
        item.dataset.tooltip = item.dataset.tooltip || 'Technology feature';
    });
});

// why trust us
document.addEventListener('DOMContentLoaded', () => {
    const metric = document.querySelector('[data-metric]');
    if (!metric) return;
  
    // Initialize with 0
    metric.textContent = '0';
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let count = 0;
          const target = parseInt(metric.dataset.metric); // Changed to dataset.metric
          
          const interval = setInterval(() => {
            count += Math.ceil(target/50); // Better increment control
            metric.textContent = Math.min(count, target);
            if (count >= target) clearInterval(interval);
          }, 30);
        }
      });
    }, { threshold: 0.5 });
  
    observer.observe(metric);
  });


