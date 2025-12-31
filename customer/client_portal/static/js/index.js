// FAQ Toggle Logic
document.addEventListener('DOMContentLoaded', function() {
    // FAQ Toggle Logic
    const faqQuestions = document.querySelectorAll('.index-faq-faq-question');
    if (faqQuestions.length) {
        faqQuestions.forEach(button => {
            button.addEventListener('click', () => {
                const faqItem = button.closest('.index-faq-faq-item');
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQs
                document.querySelectorAll('.index-faq-faq-item').forEach(item => {
                    item.classList.remove('active');
                    const answer = item.querySelector('.index-faq-faq-answer');
                    if(answer) {
                        answer.style.maxHeight = null;
                    }
                });
    
                // Open clicked FAQ if it wasn't already active
                if (!isActive) {
                    faqItem.classList.add('active');
                    const answer = faqItem.querySelector('.index-faq-faq-answer');
                    if(answer) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                }
            });
        });
    }

    // Smooth scroll for WhatsApp button
    // const whatsappBtn = document.querySelector('.whatsapp-float');
    // if (whatsappBtn) {
    //     whatsappBtn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         // Use currentTarget to ensure you're referencing the correct element
    //         const link = e.currentTarget.closest('a');
    //         if (link && link.href) {
    //             window.open(link.href, '_blank');
    //         }
    //     });
    // }
});

