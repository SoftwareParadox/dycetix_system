// referral-form.js - STANDALONE VERSION
(function() {
    'use strict';
    
    console.log("=== REFERRAL FORM JS LOADED ===");
    
    // Configuration
    const CONFIG = {
        API_URL: 'http://localhost:8001/api/forms/referral/',
        FORM_SELECTOR: '#referral-form',
        SUCCESS_MESSAGE: 'Thank you for the referral! We\'ll reach out to the client within 48 hours and keep you updated on the status.',
        ERROR_MESSAGE: 'There was an error submitting your referral. Please try again or email us directly at referrals@dycetix.com.'
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM loaded, initializing referral form...");
        initReferralForm();
    });
    
    function initReferralForm() {
        const form = document.querySelector(CONFIG.FORM_SELECTOR);
        
        if (!form) {
            console.log("Referral form not found with selector:", CONFIG.FORM_SELECTOR);
            return;
        }
        
        console.log("Referral form found, setting up event listeners...");
        
        // Remove any existing submit handlers
        form.removeEventListener('submit', handleSubmit);
        form.addEventListener('submit', handleSubmit);
        
        // Initialize phone inputs
        initPhoneInputs();
        
        // Add relationship selection styling removal
        const relationshipRadios = document.querySelectorAll('input[name="relationship"]');
        relationshipRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const relationshipGroup = document.querySelector('.job-position-container');
                if (relationshipGroup) {
                    relationshipGroup.style.border = '';
                    relationshipGroup.style.borderRadius = '';
                    relationshipGroup.style.padding = '';
                }
            });
        });
        
        console.log("Referral form initialized successfully");
    }
    
    function initPhoneInputs() {
        // If you have a phone input library, initialize it here
        const referrerPhone = document.querySelector('#referral-referrer-phone');
        const referredPhone = document.querySelector('#referral-referred-phone');
        
        if (referrerPhone) console.log("Referrer phone input found");
        if (referredPhone) console.log("Referred phone input found");
        
        // Initialize your phone input library here if needed
        // Example: if (window.FormComponents && window.FormComponents.PhoneInput) { ... }
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log("Referral form submission started");
        
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
                    gtag('event', 'client_referral', {
                        'event_category': 'referrals',
                        'event_label': 'Client Referral Submitted'
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
        const referrerName = form.querySelector('#referral-referrer-name')?.value.trim();
        const referrerEmail = form.querySelector('#referral-referrer-email')?.value.trim();
        const referrerPhone = form.querySelector('#referral-referrer-phone')?.value.trim();
        const referredName = form.querySelector('#referral-referred-name')?.value.trim();
        const referredEmail = form.querySelector('#referral-referred-email')?.value.trim();
        const referredPhone = form.querySelector('#referral-referred-phone')?.value.trim();
        const relationship = form.querySelector('input[name="relationship"]:checked')?.value;
        
        // Required field validation
        if (!referrerName) errors.push('Your full name is required');
        if (!referrerEmail) errors.push('Your email address is required');
        if (!referrerPhone) errors.push('Your phone number is required');
        if (!referredName) errors.push('Client/business name is required');
        if (!referredEmail) errors.push('Client email is required');
        if (!referredPhone) errors.push('Client phone number is required');
        if (!relationship) errors.push('Please select how you know this client');
        
        // Email validation
        if (referrerEmail && !isValidEmail(referrerEmail)) {
            errors.push('Please enter a valid email address for yourself');
        }
        
        if (referredEmail && !isValidEmail(referredEmail)) {
            errors.push('Please enter a valid email address for the client');
        }
        
        // Check emails are different
        if (referrerEmail && referredEmail && referrerEmail.toLowerCase() === referredEmail.toLowerCase()) {
            errors.push('Client email cannot be the same as your email');
        }
        
        // URL validation if provided
        const website = form.querySelector('#referral-website')?.value.trim();
        if (website && !isValidUrl(website)) {
            errors.push('Please enter a valid website URL (include http:// or https://)');
        }
        
        // Phone validation (basic)
        if (referrerPhone && referrerPhone.length < 8) {
            errors.push('Please enter a valid phone number for yourself');
        }
        
        if (referredPhone && referredPhone.length < 8) {
            errors.push('Please enter a valid phone number for the client');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    function getFormData(form) {
        return {
            referrer_name: form.querySelector('#referral-referrer-name')?.value.trim() || '',
            referrer_email: form.querySelector('#referral-referrer-email')?.value.trim() || '',
            referrer_phone: form.querySelector('#referral-referrer-phone')?.value.trim() || '',
            referrer_company: form.querySelector('#referral-referrer-company')?.value.trim() || '',
            
            referred_name: form.querySelector('#referral-referred-name')?.value.trim() || '',
            contact_person: form.querySelector('#referral-contact-person')?.value.trim() || '',
            referred_email: form.querySelector('#referral-referred-email')?.value.trim() || '',
            referred_phone: form.querySelector('#referral-referred-phone')?.value.trim() || '',
            referred_company: form.querySelector('#referral-referred-company')?.value.trim() || '',
            website: form.querySelector('#referral-website')?.value.trim() || '',
            industry: form.querySelector('#referral-industry')?.value.trim() || '',
            
            relationship: form.querySelector('input[name="relationship"]:checked')?.value || '',
            context: form.querySelector('#referral-context')?.value.trim() || '',
            
            source: 'referral-page'
        };
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    function showMessage(message, type) {
        // Remove any existing message
        const existing = document.querySelector('.referral-message');
        if (existing) existing.remove();
        
        // Create message container
        const container = document.createElement('div');
        container.className = 'referral-message';
        
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
        const messages = document.querySelectorAll('.referral-message');
        messages.forEach(msg => msg.remove());
    }
    
    function resetButton(button, originalText) {
        if (button && originalText) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
    
    // Make init function available globally if needed
    window.initReferralForm = initReferralForm;
    
})();