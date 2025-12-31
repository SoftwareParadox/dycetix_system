//our process Scroll Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.development-process-timeline-step').forEach((step) => {
    observer.observe(step);
});

// Chat Toggle
const chatTrigger = document.querySelector('.development-process-chat-trigger');
const chatWindow = document.querySelector('.development-process-chat-window');
const closeChat = document.querySelector('.development-process-close-chat');

chatTrigger.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
});

closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('active');
});

// Form Handling (Example using Formspree)
document.querySelector('.development-process-send-button').addEventListener('click', async (e) => {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you for your question! We will respond within 24 hours.');
    chatWindow.classList.remove('active');
});