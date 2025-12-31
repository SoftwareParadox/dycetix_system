// partnership-form.js - COMPLETELY STANDALONE
(function() {
    'use strict';
    
    console.log("=== PARTNERSHIP FORM JS LOADED ===");
    
    // Configuration
    const CONFIG = {
        API_URL: 'http://localhost:8001/api/forms/partnership-proposal/',
        FORM_SELECTOR: '#partnership-form',
        SUCCESS_MESSAGE: 'Thank you! Your partnership proposal has been submitted. Our team will review it and get back to you within 7-10 business days.',
        ERROR_MESSAGE: 'There was an error submitting your proposal. Please try again or email us directly at partnerships@dycetix.com.'
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM loaded, initializing partnership form...");
        initPartnershipForm();
    });
    
    function initPartnershipForm() {
        const form = document.querySelector(CONFIG.FORM_SELECTOR);
        
        if (!form) {
            console.log("Partnership form not found with selector:", CONFIG.FORM_SELECTOR);
            return;
        }
        
        console.log("Partnership form found, setting up event listeners...");
        
        // Remove any existing submit handlers
        form.removeEventListener('submit', handleSubmit);
        form.addEventListener('submit', handleSubmit);
        
        // Initialize phone input if available
        initPhoneInput();
        
        console.log("Partnership form initialized successfully");
    }
    
   // In partnership-form.js, replace the initPhoneInput() function:
    function initPhoneInput() {
        const phoneInput = document.querySelector('#partnership-phone');
        if (!phoneInput) return;
        
        // Use the new PhoneInput component
        this.phoneHandler = new PhoneInput('partnership-phone', {
            required: false,
            showCountryCode: true,
            defaultCountry: 'auto'
        });
        
        console.log("Phone input initialized with PhoneInput component");
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log("Partnership form submission started");
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        
        // Show loading state
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
        }
        
        // Clear previous messages
        clearMessages();
        
        try {
            // Validate form
            const validation = validateForm(form);
            if (!validation.isValid) {
                showMessage(validation.errors[0], 'error');
                resetButton(submitBtn, originalBtnText);
                return;
            }
            
            // Get form data
            const formData = getFormData(form);
            console.log("Form data to submit:", formData);
            
            // Submit to API
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            console.log("API response status:", response.status);
            
            const result = await response.json();
            console.log("API response data:", result);
            
            if (result.success) {
                // Success
                showMessage(result.message || CONFIG.SUCCESS_MESSAGE, 'success');
                
                // Reset form
                form.reset();
                
                // Track conversion if gtag exists
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'partnership_proposal', {
                        'event_category': 'partnerships',
                        'event_label': 'Partnership Proposal Submitted'
                    });
                }
            } else {
                // API returned error
                showMessage(result.error || CONFIG.ERROR_MESSAGE, 'error');
            }
            
        } catch (error) {
            console.error("Submission error:", error);
            showMessage(
                'Network error. Please check your connection and try again.',
                'error'
            );
        } finally {
            resetButton(submitBtn, originalBtnText);
        }
    }
    
    function validateForm(form) {
        const errors = [];
        
        // Get form values
        const email = form.querySelector('#partnership-email')?.value.trim();
        const skills = form.querySelector('#partnership-skills')?.value.trim();
        const portfolioUrls = form.querySelector('#partnership-portfolio')?.value.trim();
        
        // Email validation
        if (!email) {
            errors.push('Email is required');
        } else if (!isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Skills validation (minimum 50 characters)
        if (!skills) {
            errors.push('Skills/expertise description is required');
        } else if (skills.length < 50) {
            errors.push('Please provide more details about your skills/expertise (minimum 50 characters)');
        }
        
        // Portfolio URLs validation
        if (!portfolioUrls) {
            errors.push('Portfolio/website URLs are required');
        } else {
            // Check if at least one non-empty line
            const lines = portfolioUrls.split('\n').filter(line => line.trim().length > 0);
            if (lines.length === 0) {
                errors.push('Please provide at least one portfolio or website URL');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    function getFormData(form) {
        return {
            email: form.querySelector('#partnership-email')?.value.trim() || '',
            name: form.querySelector('#partnership-name')?.value.trim() || '',
            phone: form.querySelector('#partnership-phone')?.value.trim() || '',
            company: form.querySelector('#partnership-company')?.value.trim() || '',
            skills: form.querySelector('#partnership-skills')?.value.trim() || '',
            portfolioUrls: form.querySelector('#partnership-portfolio')?.value.trim() || '',
            proposalDetails: form.querySelector('#partnership-proposal')?.value.trim() || '',
            source: 'partnership-page'
        };
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showMessage(message, type) {
        // Remove any existing message
        const existing = document.querySelector('.partnership-message');
        if (existing) existing.remove();
        
        // Create message container
        const container = document.createElement('div');
        container.className = 'partnership-message';
        
        // Styling
        if (type === 'success') {
            container.style.cssText = `
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                text-align: center;
            `;
            container.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 10px;"></i>${message}`;
        } else {
            container.style.cssText = `
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
            `;
            container.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>${message}`;
            
            // Scroll to error
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Insert message after form header
        const form = document.querySelector(CONFIG.FORM_SELECTOR);
        if (form) {
            const header = form.querySelector('.index-quote-form-header');
            if (header) {
                header.parentNode.insertBefore(container, header.nextSibling);
            } else {
                form.prepend(container);
            }
        }
        
        // Auto-hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (container.parentNode) {
                    container.remove();
                }
            }, 10000);
        }
    }
    
    function clearMessages() {
        const messages = document.querySelectorAll('.partnership-message');
        messages.forEach(msg => msg.remove());
    }
    
    function resetButton(button, originalText) {
        if (button && originalText) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
    
    // Make init function available globally if needed
    window.initPartnershipForm = initPartnershipForm;
    
})();