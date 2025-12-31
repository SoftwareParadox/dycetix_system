// Blog filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const audienceBtns = document.querySelectorAll('.blog-audience-btn');
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const sortSelect = document.querySelector('.blog-sort-select');
    const searchInput = document.querySelector('.blog-search-input');
    const articleCards = document.querySelectorAll('.blog-article-card');
    const loadMoreBtn = document.querySelector('.blog-load-more-btn');

    // Current filters state
    let currentFilters = {
        audience: 'all',
        type: 'all',
        sort: 'latest',
        search: ''
    };

    // Initialize
    initBlogFilters();

    function initBlogFilters() {
        // Audience filter
        audienceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const audience = this.dataset.audience;
                
                // Update active state
                audienceBtns.forEach(b => b.classList.remove('blog-audience-active'));
                this.classList.add('blog-audience-active');
                
                // Update filters and apply
                currentFilters.audience = audience;
                applyFilters();
            });
        });

        // Content type filter
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Update active state
                filterBtns.forEach(b => b.classList.remove('blog-filter-active'));
                this.classList.add('blog-filter-active');
                
                // Update filters and apply
                currentFilters.type = type;
                applyFilters();
            });
        });

        // Sort select
        sortSelect.addEventListener('change', function() {
            currentFilters.sort = this.value;
            applyFilters();
        });

        // Search input (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = this.value.toLowerCase();
                applyFilters();
            }, 300);
        });

        // Load more button
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreArticles);
        }
    }

    function applyFilters() {
        let visibleCount = 0;
        const maxInitialDisplay = 6; // Show 6 articles initially

        articleCards.forEach((card, index) => {
            const cardAudience = card.dataset.audience;
            const cardType = card.dataset.type;
            const cardTitle = card.querySelector('.blog-card-title').textContent.toLowerCase();
            const cardExcerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
            
            // Check if card matches current filters
            const matchesAudience = currentFilters.audience === 'all' || 
                                  cardAudience.includes(currentFilters.audience);
            const matchesType = currentFilters.type === 'all' || 
                              cardType === currentFilters.type;
            const matchesSearch = !currentFilters.search || 
                                cardTitle.includes(currentFilters.search) ||
                                cardExcerpt.includes(currentFilters.search);

            if (matchesAudience && matchesType && matchesSearch) {
                card.style.display = 'block';
                visibleCount++;
                
                // Hide cards beyond initial display (for load more functionality)
                if (visibleCount > maxInitialDisplay) {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide load more button
        if (loadMoreBtn) {
            if (visibleCount > maxInitialDisplay) {
                loadMoreBtn.style.display = 'flex';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }

        // Show no results message if needed
        showNoResultsMessage(visibleCount === 0);
    }

    function showNoResultsMessage(show) {
        let noResults = document.querySelector('.blog-no-results');
        
        if (show && !noResults) {
            noResults = document.createElement('div');
            noResults.className = 'blog-no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No articles found</h3>
                <p>Try adjusting your filters or search terms</p>
            `;
            document.querySelector('.blog-content-grid').appendChild(noResults);
        } else if (!show && noResults) {
            noResults.remove();
        }
    }

    function loadMoreArticles() {
        const hiddenCards = Array.from(articleCards).filter(card => 
            card.style.display === 'none' && 
            window.getComputedStyle(card).display === 'none'
        );

        // Show next 3 hidden cards
        hiddenCards.slice(0, 3).forEach(card => {
            card.style.display = 'block';
        });

        // Hide load more button if no more cards
        if (hiddenCards.length <= 3) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Initial filter application
    applyFilters();
});