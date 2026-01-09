document.addEventListener('DOMContentLoaded', function() {
    // FAQ Toggle Logic - Improved with conflict prevention
    const faqQuestions = document.querySelectorAll('.index-faq-faq-question');
    
    if (faqQuestions.length) {
        // Remove any existing event listeners first
        faqQuestions.forEach(button => {
            button.removeEventListener('click', toggleFAQ);
            button.addEventListener('click', toggleFAQ, { once: false });
        });
    }

    function toggleFAQ(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = e.currentTarget;
        const faqItem = button.closest('.index-faq-faq-item');
        const isActive = faqItem.classList.contains('active');
        
        console.log('FAQ clicked, isActive:', isActive);
        
        // Close all FAQs
        document.querySelectorAll('.index-faq-faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                const answer = item.querySelector('.index-faq-faq-answer');
                if(answer) {
                    answer.style.maxHeight = null;
                }
            }
        });
        
        // Toggle current FAQ
        if (!isActive) {
            faqItem.classList.add('active');
            const answer = faqItem.querySelector('.index-faq-faq-answer');
            if(answer) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        } else {
            faqItem.classList.remove('active');
            const answer = faqItem.querySelector('.index-faq-faq-answer');
            if(answer) {
                answer.style.maxHeight = null;
            }
        }
    }
});