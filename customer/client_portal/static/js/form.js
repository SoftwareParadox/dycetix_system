// static/js/form.js - UPDATED to use shared service
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.index-quote-quote-form');
    if (!form) return; // Exit if no form on this page
    
    console.log('Initializing main form...');
    
    const formService = new FormService('global');
    let phoneInputManager = null;
    let fileUploadManager = null;
    
    // Initialize phone input
    if (window.FormComponents?.PhoneInput) {
        try {
            phoneInputManager = new FormComponents.PhoneInput('global-phone');
            console.log('PhoneInput initialized for main form');
        } catch (error) {
            console.warn('PhoneInput initialization failed:', error);
        }
    }
    
    // Initialize file upload
    if (window.FormComponents?.FileUpload) {
        try {
            fileUploadManager = new FormComponents.FileUpload({
                inputId: 'global-fileUpload',
                previewId: 'global-uploadPreview',
                countId: 'global-fileCount',
                sizeId: 'global-totalSize',
                maxFiles: 5,
                maxSize: 25 * 1024 * 1024,
                allowedTypes: ['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.txt']
            });
            console.log('FileUpload initialized for main form');
        } catch (error) {
            console.error('FileUpload initialization failed:', error);
        }
    }
    
    // Other service toggle
    const otherCheckbox = document.getElementById('global-service-other');
    const otherContainer = document.getElementById('global-other-service-container');
    if (otherCheckbox && otherContainer) {
        otherCheckbox.addEventListener('change', (e) => {
            otherContainer.style.display = e.target.checked ? 'block' : 'none';
        });
    }
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Show loading
        if (submitBtn.querySelector('span')) {
            submitBtn.querySelector('span').textContent = 'Submitting...';
        } else {
            submitBtn.textContent = 'Submitting...';
        }
        submitBtn.disabled = true;
        
        try {
            // Collect data using shared service
            const formData = formService.collectFormData(form, phoneInputManager);
            
            // Validate using shared service
            const validation = formService.validateFormData(formData);
            if (!validation.isValid) {
                formService.showError(form, validation.errors[0]);
                formService.resetSubmitButton(submitBtn, originalBtnText);
                return;
            }
            
            // Process files
            const files = await formService.processFiles(
                document.getElementById('global-fileUpload')
            );
            
            // Submit using shared service
            const result = await formService.submitToAPI(formData, files);
            
            if (result.success) {
                alert('Thank you! Your request has been submitted successfully.');
                form.reset();
                // Reset other service container
                if (otherContainer) otherContainer.style.display = 'none';
            } else {
                formService.showError(form, result.error || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            formService.showError(form, 'Network error. Please try again.');
        } finally {
            formService.resetSubmitButton(submitBtn, originalBtnText);
        }
    });
    
    console.log('Main form initialized successfully');
});