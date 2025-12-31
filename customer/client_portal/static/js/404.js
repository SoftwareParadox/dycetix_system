// Create floating particles for background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 30 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDuration = Math.random() * 30 + 10;
        const animationDelay = Math.random() * 5;
        const opacity = Math.random() * 0.4 + 0.1;
        
        // Apply properties
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        particle.style.opacity = opacity;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', createParticles);

// Search functionality
// document.querySelector('.search-box button').addEventListener('click', function() {
//     const searchTerm = document.querySelector('.search-box input').value;
//     if (searchTerm.trim() !== '') {
//         alert(`Searching for: ${searchTerm}\nThis would trigger a real search in production.`);
//     }
// });

// // Handle Enter key in search
// document.querySelector('.search-box input').addEventListener('keypress', function(e) {
//     if (e.key === 'Enter') {
//         document.querySelector('.search-box button').click();
//     }
// });