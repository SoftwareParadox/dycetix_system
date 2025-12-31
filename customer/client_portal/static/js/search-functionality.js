// search-functionality.js - Fixed version
document.addEventListener('DOMContentLoaded', function() {
    const searchToggle = document.getElementById('dycetix-search-toggle');
    const searchDropdown = document.getElementById('dycetix-search-dropdown');
    const searchInput = document.getElementById('dycetix-search-input');
    const searchResults = document.getElementById('dycetix-search-results');
    const searchTags = document.querySelectorAll('.dycetix-search-tag');
    // Add to your existing code after the existing event listeners

    // Get the secondary search elements
    const secondarySearchInput = document.getElementById('dycetix-secondary-search-input');
    const secondarySearchButton = document.getElementById('dycetix-secondary-search-button');

    // Function to handle secondary search
    function handleSecondarySearch() {
        const searchTerm = secondarySearchInput.value.trim();
        
        if (!searchTerm) {
            return; // Don't search if empty
        }
        
        // For the secondary search, we want to behave like an Enter key search
        isEnterKeySearch = true;
        
        // First, open the dropdown to show the user we're searching
        if (!searchDropdown.classList.contains('active')) {
            searchDropdown.classList.add('active');
            searchToggle.classList.add('active');
        }
        
        // Set the value in the dropdown search input
        searchInput.value = searchTerm;
        
        // Perform the search (this will use the existing performSearch function)
        performSearch(searchTerm);
    }

    // Add click event to the secondary search button
    if (secondarySearchButton) {
        secondarySearchButton.addEventListener('click', handleSecondarySearch);
    }

    // Add Enter key support to the secondary search input
    if (secondarySearchInput) {
        secondarySearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSecondarySearch();
            }
        });
    }

    let currentSearchResults = [];
    let isEnterKeySearch = false;

    // Handle URL anchors on page load
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1); 
        setTimeout(() => {
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 500);
    }
    
    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Toggle search dropdown
    searchToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isActive = searchDropdown.classList.toggle('active');
        searchToggle.classList.toggle('active', isActive);
        
        if (isActive) {
            searchInput.focus();
            showInitialSuggestions();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchDropdown.contains(e.target) && !searchToggle.contains(e.target)) {
            closeSearch();
        }
    });

    function closeSearch() {
        searchDropdown.classList.remove('active');
        searchToggle.classList.remove('active');
        searchInput.value = '';
    }

    // Handle search input with debouncing
    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            showInitialSuggestions();
            return;
        }
        
        performSearch(searchTerm);
    }, 300));

    // Handle Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if any
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                isEnterKeySearch = true; // Set flag for Enter key search
                performSearch(searchTerm);
            }
        }
    });

    // Handle popular search tags
    searchTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            searchInput.value = searchTerm;
            performSearch(searchTerm);
            searchInput.focus();
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Perform search against database
    async function performSearch(searchTerm) {
    if (searchTerm.length < 2) {
        showInitialSuggestions();
        return;
    }

    // Show loading state
    searchResults.innerHTML = `
        <div class="search-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching for "${escapeHtml(searchTerm)}"...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/search/?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        console.log('Search results:', data);
        
        // Store results for potential Enter key navigation
        currentSearchResults = data.results || [];
        
        if (data.error) {
            showError(data.error);
        } else if (currentSearchResults.length > 0) {
            displaySearchResults(currentSearchResults, searchTerm);
            
            // AUTO-NAVIGATE if this was an Enter key search
            if (isEnterKeySearch) {
                autoNavigateToBestResult(currentSearchResults, searchTerm);
            }
        } else {
            showNoResults(searchTerm);
        }
        
        // Reset the flag
        isEnterKeySearch = false;
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Search temporarily unavailable');
        isEnterKeySearch = false;
    }
}

// the current autoNavigateToBestResult function with this smarter version
function autoNavigateToBestResult(results, searchTerm) {
    if (results.length === 0) return;
    
    // Define page-specific searches that should go directly to pages
    const pageDirectSearches = {
        // Service pages
        'web development': '/web-development/',
        'web dev': '/web-development/',
        'website development': '/web-development/',
        'mobile development': '/mobile-development/',
        'mobile app': '/mobile-development/',
        'mobile apps': '/mobile-development/',
        'custom software': '/custom-software-development/',
        'desktop development': '/desktop-development/',
        'database development': '/database-development/',
        'it support': '/it-maintenance/',
        'it maintenance': '/it-maintenance/',
        'graphic design': '/graphic-design/',
        'photography': '/video-photo/',
        'videography': '/video-photo/',
        'photo video': '/video-photo/',
        
        // Other pages
        'about us': '/about-us/',
        // 'about': '/about-us/',
        'technologies': '/technologies/',
        'tech stack': '/technologies/',
        'industries': '/industries/',
        'blog': '/blog/',
        'pricing': '/pricing/',
        'get in touch': '/get-in-touch/',
        'contact': '/get-in-touch/',
        'contact us': '/get-in-touch/'
    };
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    // Strategy 1: Check if this is a direct page search
    if (pageDirectSearches[lowerSearchTerm]) {
        const targetPage = pageDirectSearches[lowerSearchTerm];
        console.log('Direct page navigation for:', lowerSearchTerm, '->', targetPage);
        navigateToSection(targetPage, '');
        return;
    }
    
    // Strategy 2: Check for partial matches in page searches
    for (const [key, page] of Object.entries(pageDirectSearches)) {
        if (lowerSearchTerm.includes(key)) {
            console.log('Partial match navigation:', lowerSearchTerm, '->', page);
            navigateToSection(page, '');
            return;
        }
    }
    
    // Strategy 3: Check if the search is clearly page-oriented (contains "page", "go to", etc.)
    const pageOrientedTerms = ['page', 'go to', 'navigate to', 'take me to', 'show me the'];
    const isPageOrientedSearch = pageOrientedTerms.some(term => lowerSearchTerm.includes(term));
    
    if (isPageOrientedSearch) {
        // Try to extract the page name and match it
        for (const [key, page] of Object.entries(pageDirectSearches)) {
            if (lowerSearchTerm.includes(key)) {
                console.log('Page-oriented search navigation:', lowerSearchTerm, '->', page);
                navigateToSection(page, '');
                return;
            }
        }
    }
    
    // Strategy 4: For content/info searches, DON'T auto-navigate - let user choose from results
    const contentOrientedTerms = ['how', 'what', 'why', 'when', 'where', 'can i', 'does', 'is there', 'help with', 'information about'];
    const isContentSearch = contentOrientedTerms.some(term => lowerSearchTerm.includes(term));
    
    if (isContentSearch) {
        console.log('Content search - not auto-navigating, showing results');
        // Don't auto-navigate for content searches
        return;
    }
    
    // Strategy 5: If it's a very short, specific search, consider it page-oriented
    const words = lowerSearchTerm.split(' ').filter(word => word.length > 2);
    if (words.length <= 2 && !isContentSearch) {
        // Short, specific search - use the top result
        const bestResult = results[0];
        console.log('Short specific search - auto-navigating to top result:', bestResult.section_title);
        navigateToSection(bestResult.page_url, bestResult.section_name);
        return;
    }
    
    // Strategy 6: Default - don't auto-navigate for ambiguous searches
    console.log('Ambiguous search - showing results without auto-navigation');
    // The search results are already displayed, so we do nothing
}

// Also update the performSearch function to handle the case where we don't auto-navigate
async function performSearch(searchTerm) {
    if (searchTerm.length < 2) {
        showInitialSuggestions();
        return;
    }

    // Show loading state
    searchResults.innerHTML = `
        <div class="search-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching for "${escapeHtml(searchTerm)}"...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/search/?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        console.log('Search results:', data);
        
        currentSearchResults = data.results || [];
        
        if (data.error) {
            showError(data.error);
        } else if (currentSearchResults.length > 0) {
            displaySearchResults(currentSearchResults, searchTerm);
            
            // Only auto-navigate if this was an Enter key search AND the function decides to
            if (isEnterKeySearch) {
                autoNavigateToBestResult(currentSearchResults, searchTerm);
            }
        } else {
            showNoResults(searchTerm);
        }
        
        isEnterKeySearch = false;
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Search temporarily unavailable');
        isEnterKeySearch = false;
    }
}

    // Display search results from database
    function displaySearchResults(results, searchTerm) {
    let resultsHTML = '';
    
    if (results.length === 0) {
        showNoResults(searchTerm);
        return;
    }
    
    // Add a visual indicator for the top result (helpful for users)
    results.forEach((result, index) => {
        const highlightedTitle = highlightText(result.section_title, searchTerm);
        const highlightedDesc = highlightText(result.section_description || result.content.substring(0, 150), searchTerm);
        
        const pageUrl = result.page_url.startsWith('/') ? result.page_url : `/${result.page_url}`;
        const isTopResult = index === 0;
        
        resultsHTML += `
            <div class="search-result-item ${isTopResult ? 'top-result' : ''}" 
                 data-page="${pageUrl}" 
                 data-section="${result.section_name}">
                ${isTopResult ? '<div class="top-result-badge">Top Result</div>' : ''}
                <h4 class="body-sub-header">${highlightedTitle}</h4>
                <p class="body-paragraph">${highlightedDesc}</p>
            </div>
        `;
    });

    searchResults.innerHTML = resultsHTML;
    
    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            const section = this.getAttribute('data-section');
            console.log('Clicked:', { page, section });
            navigateToSection(page, section);
        });
    });
}

    // Show initial suggestions
    function showInitialSuggestions() {
    searchResults.innerHTML = `
        <div class="search-initial-state">
            <div class="initial-suggestions">
                <h4>Quick Access</h4>
                <div class="suggestion-tags">
                    <span class="suggestion-tag" data-search="software development" data-page="/software-solutions/" data-section="software-services">Software Development</span>
                    <span class="suggestion-tag" data-search="graphic design" data-page="/graphic-design/" data-section="design-services">Graphic Design</span>
                    <span class="suggestion-tag" data-search="it support" data-page="/it-maintenance/" data-section="support-services">IT Support & Maintenance</span>
                    <span class="suggestion-tag" data-search="photography" data-page="/video-photo/" data-section="photo-services">Photography & Videography</span>
                </div>
            </div>
        </div>
    `;

    // Add click handlers for suggestion tags
    document.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            const page = this.getAttribute('data-page');
            const section = this.getAttribute('data-section');
            
            if (page && section) {
                // Navigate directly to the page/section
                navigateToSection(page, section);
            } else {
                // Fallback to search behavior
                searchInput.value = searchTerm;
                performSearch(searchTerm);
            }
        });
    });
}


    // Show no results message
    function showNoResults(searchTerm) {
    searchResults.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h4>No results found for "${escapeHtml(searchTerm)}"</h4>
            <p>Try different keywords or explore our popular searches</p>
            <div class="suggestion-tags">
                <span class="suggestion-tag" data-search="web development" data-page="/web-development/" data-section="web-services">Web Development</span>
                <span class="suggestion-tag" data-search="mobile apps" data-page="/mobile-development/" data-section="mobile-services">Mobile Apps</span>
                <span class="suggestion-tag" data-search="cloud solutions" data-page="/desktop-development/" data-section="cloud-services">Desktop apps</span>
            </div>
        </div>
    `;

    // Add the same click handlers
    document.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            const page = this.getAttribute('data-page');
            const section = this.getAttribute('data-section');
            
            if (page && section) {
                navigateToSection(page, section);
            } else {
                searchInput.value = searchTerm;
                performSearch(searchTerm);
            }
        });
    });
}
    // Show error message
    function showError(error) {
        searchResults.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Search Error</h4>
                <p>${escapeHtml(error)}</p>
                <p>Please try again later or contact support.</p>
            </div>
        `;
    }

    // Navigate to specific section
function navigateToSection(page, section) {
    console.log('Navigating to:', page, 'Section:', section);
    
    closeSearch();
    
    // Handle empty page (current page) and global components
    if (page === '' || page === 'global') {
        setTimeout(() => {
            const targetElement = document.getElementById(section);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                // Use replaceState to avoid changing the actual page
                history.replaceState(null, null, `#${section}`);
            } else {
                console.warn('Section not found:', section);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
        return;
    }
    
    // Rest of your existing logic for regular pages...
    if (window.location.pathname === page || (page === '/' && window.location.pathname === '/')) {
        setTimeout(() => {
            const targetElement = document.getElementById(section);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, `#${section}`);
            } else {
                console.warn('Section not found:', section);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    } else {
        if (section) {
            window.location.href = `${page}#${section}`;
        } else {
            window.location.href = page;
        }
    }
}
    // Utility function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Highlight search term in text
    function highlightText(text, searchTerm) {
        if (!searchTerm) return escapeHtml(text);
        
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        return escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    // Escape regex special characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});

