// dycetix-subscription-form.js - Completely namespaced and conflict-free
(function() {
    'use strict';
    
    // ==================== NAMESPACED CONFIGURATION ====================
    const DycetixSubscriptionConfig = {
        // Unique class names (prefixed with dycetix-)
        formClass: 'dycetix-subscription-form',
        messageClass: 'dycetix-subscription-message',
        errorClass: 'dycetix-email-error',
        
        // API endpoint
        apiUrl: 'http://localhost:8001/api/forms/subscription/',
        
        // CSS styles (scoped to our classes)
        styles: {
            formInput: `
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
                transition: border-color 0.3s, box-shadow 0.3s;
            `,
            successMessage: `
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                padding: 10px;
                border-radius: 4px;
                font-size: 0.9em;
                margin-top: 10px;
            `,
            errorMessage: `
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                padding: 10px;
                border-radius: 4px;
                font-size: 0.9em;
                margin-top: 10px;
            `
        }
    };
    
    // ==================== UTILITY FUNCTIONS (Scoped) ====================
    const DycetixSubscriptionUtils = {
        // Unique validation function
        validateEmailDycetix: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        },
        
        // Create unique message container
        createMessageContainerDycetix: function(form) {
            const container = document.createElement('div');
            container.className = DycetixSubscriptionConfig.messageClass;
            container.setAttribute('data-dycetix-subscription', 'true');
            
            // Insert after submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.parentNode.insertBefore(container, submitBtn.nextSibling);
            } else {
                form.appendChild(container);
            }
            
            return container;
        },
        
        // Show message with unique styling
        showMessageDycetix: function(message, type, container) {
            if (!container) return;
            
            // Clear existing content
            container.innerHTML = '';
            container.className = DycetixSubscriptionConfig.messageClass;
            container.setAttribute('data-dycetix-message-type', type);
            
            // Apply styles
            if (type === 'success') {
                container.style.cssText = DycetixSubscriptionConfig.styles.successMessage;
            } else if (type === 'error') {
                container.style.cssText = DycetixSubscriptionConfig.styles.errorMessage;
            }
            
            // Add icon
            const iconMap = {
                success: '<i class="fas fa-check-circle" style="margin-right: 5px;"></i>',
                error: '<i class="fas fa-exclamation-circle" style="margin-right: 5px;"></i>',
                info: '<i class="fas fa-info-circle" style="margin-right: 5px;"></i>'
            };
            
            container.innerHTML = `${iconMap[type] || ''}${message}`;
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    if (container && container.getAttribute('data-dycetix-message-type') === 'success') {
                        container.innerHTML = '';
                        container.style.cssText = '';
                    }
                }, 5000);
            }
            
            // Scroll to error messages
            if (type === 'error') {
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        
        // Clear message container
        clearMessageDycetix: function(container) {
            if (container) {
                container.innerHTML = '';
                container.style.cssText = '';
                container.removeAttribute('data-dycetix-message-type');
            }
        },
        
        // Get form data
        getFormDataDycetix: function(form) {
            const data = {
                email: form.querySelector('input[name="email"]')?.value?.trim() || '',
                name: form.querySelector('input[name="name"]')?.value?.trim() || '',
                source: form.querySelector('input[name="source"]')?.value || 'website',
                agree_terms: form.querySelector('input[name="agree_terms"]')?.checked || false
            };
            
            // Get interests
            const interests = [];
            const checkboxes = form.querySelectorAll('input[name="interests"]:checked');
            checkboxes.forEach(cb => {
                if (cb.value) interests.push(cb.value);
            });
            
            if (interests.length > 0) {
                data.interests = interests;
            }
            
            return data;
        },
        
        // Validate form data
        validateFormDataDycetix: function(data) {
            const errors = [];
            
            if (!data.email) {
                errors.push('Email address is required');
            } else if (!this.validateEmailDycetix(data.email)) {
                errors.push('Please enter a valid email address');
            }
            
            if (!data.agree_terms) {
                errors.push('You must agree to receive emails');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
    };
    
    // ==================== FORM HANDLER CLASS (Scoped) ====================
    class DycetixSubscriptionFormHandler {
        constructor(formElement) {
            this.form = formElement;
            this.submitBtn = this.form.querySelector('button[type="submit"]');
            this.messageContainer = this.form.querySelector(`.${DycetixSubscriptionConfig.messageClass}`) || 
                                   DycetixSubscriptionUtils.createMessageContainerDycetix(this.form);
            this.originalBtnText = this.submitBtn?.textContent || 'Subscribe';
            
            this.init();
        }
        
        init() {
            // Add event listener for form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Add email validation on blur
            const emailInput = this.form.querySelector('input[name="email"]');
            if (emailInput) {
                emailInput.addEventListener('blur', (e) => this.validateEmailOnBlur(e));
                emailInput.addEventListener('input', (e) => this.clearEmailError(e));
            }
            
            // Toggle interests section on email focus
            this.setupInterestsToggle();
            
            console.log('Dycetix Subscription Form initialized:', this.form);
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            
            // Show loading state
            this.setButtonState('Subscribing...', true);
            
            // Clear previous messages
            DycetixSubscriptionUtils.clearMessageDycetix(this.messageContainer);
            
            try {
                // Get and validate form data
                const formData = DycetixSubscriptionUtils.getFormDataDycetix(this.form);
                const validation = DycetixSubscriptionUtils.validateFormDataDycetix(formData);
                
                if (!validation.isValid) {
                    DycetixSubscriptionUtils.showMessageDycetix(
                        validation.errors[0], 
                        'error', 
                        this.messageContainer
                    );
                    this.resetButton();
                    return;
                }
                
                // Submit to API
                const response = await fetch(DycetixSubscriptionConfig.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // Success
                    DycetixSubscriptionUtils.showMessageDycetix(
                        result.message || 'Thank you for subscribing!',
                        'success',
                        this.messageContainer
                    );
                    
                    // Reset form
                    this.form.reset();
                    
                    // Hide interests section
                    this.hideInterestsSection();
                    
                    // Track analytics
                    this.trackAnalytics();
                    
                } else {
                    // API returned error
                    DycetixSubscriptionUtils.showMessageDycetix(
                        result.error || 'Subscription failed. Please try again.',
                        'error',
                        this.messageContainer
                    );
                }
                
            } catch (error) {
                console.error('Dycetix Subscription error:', error);
                DycetixSubscriptionUtils.showMessageDycetix(
                    'Network error. Please try again.',
                    'error',
                    this.messageContainer
                );
            } finally {
                this.resetButton();
            }
        }
        
        validateEmailOnBlur(e) {
            const emailInput = e.target;
            if (emailInput.value && !DycetixSubscriptionUtils.validateEmailDycetix(emailInput.value)) {
                this.showInlineError(emailInput, 'Please enter a valid email address');
            } else {
                this.clearInlineError(emailInput);
            }
        }
        
        clearEmailError(e) {
            this.clearInlineError(e.target);
        }
        
        showInlineError(input, message) {
            input.classList.add('dycetix-input-error');
            input.style.borderColor = '#dc3545';
            input.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';
            
            // Add error message
            let errorSpan = input.parentNode.querySelector(`.${DycetixSubscriptionConfig.errorClass}`);
            if (!errorSpan) {
                errorSpan = document.createElement('span');
                errorSpan.className = DycetixSubscriptionConfig.errorClass;
                errorSpan.style.cssText = `
                    display: block;
                    color: #dc3545;
                    font-size: 0.8em;
                    margin-top: 5px;
                `;
                input.parentNode.appendChild(errorSpan);
            }
            errorSpan.textContent = message;
        }
        
        clearInlineError(input) {
            input.classList.remove('dycetix-input-error');
            input.style.borderColor = '';
            input.style.boxShadow = '';
            
            const errorSpan = input.parentNode.querySelector(`.${DycetixSubscriptionConfig.errorClass}`);
            if (errorSpan) {
                errorSpan.remove();
            }
        }
        
        setupInterestsToggle() {
            const emailInput = this.form.querySelector('input[name="email"]');
            const interestsSection = this.form.querySelector('#dycetix-service-interests');
            
            if (emailInput && interestsSection) {
                emailInput.addEventListener('focus', () => {
                    interestsSection.style.display = 'block';
                });
            }
        }
        
        hideInterestsSection() {
            const interestsSection = this.form.querySelector('#dycetix-service-interests');
            if (interestsSection) {
                interestsSection.style.display = 'none';
            }
        }
        
        setButtonState(text, disabled) {
            if (this.submitBtn) {
                this.submitBtn.textContent = text;
                this.submitBtn.disabled = disabled;
            }
        }
        
        resetButton() {
            this.setButtonState(this.originalBtnText, false);
        }
        
        trackAnalytics() {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'subscribe', {
                    'event_category': 'engagement',
                    'event_label': 'dycetix_newsletter'
                });
            }
            
            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Subscribe');
            }
        }
    }
    
    // ==================== MAIN INITIALIZATION ====================
    function initDycetixSubscriptionForms() {
        console.log('Initializing Dycetix Subscription Forms...');
        
        // Find all forms with our unique class
        const forms = document.querySelectorAll(`.${DycetixSubscriptionConfig.formClass}`);
        
        if (forms.length === 0) {
            console.log('No Dycetix subscription forms found on this page');
            return;
        }
        
        // Initialize each form
        forms.forEach((form, index) => {
            try {
                new DycetixSubscriptionFormHandler(form);
                console.log(`Dycetix Form ${index + 1} initialized`);
            } catch (error) {
                console.error(`Failed to initialize Dycetix Form ${index + 1}:`, error);
            }
        });
    }
    
    // ==================== GLOBAL EXPORT (Minimal) ====================
    // Only expose what's absolutely necessary
    window.DycetixSubscription = {
        init: initDycetixSubscriptionForms,
        version: '1.0.0'
    };
    
    // ==================== AUTO-INITIALIZE ON DOM READY ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDycetixSubscriptionForms);
    } else {
        initDycetixSubscriptionForms();
    }
    
})();