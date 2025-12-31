function toggleCollapse(element) {
            const content = element.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
            element.classList.toggle('active');
        }

        // Initialize collapsible sections for mobile
        if (window.innerWidth <= 767.98) {
            document.querySelectorAll('.collapsible').forEach(item => {
                item.nextElementSibling.style.display = 'none';
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                document.querySelectorAll('.collapsible-content').forEach(content => {
                    content.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.collapsible-content').forEach(content => {
                    content.style.display = 'none';
                });
            }
        });