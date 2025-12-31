// static/js/modal-form.js - Uses SAME logic as form.js
class ModalForm {
    constructor() {
        this.modal = document.getElementById('form-modal');
        this.form = document.getElementById('modal-quote-form');
        this.closeBtn = this.modal?.querySelector('.form-modal-close');
        this.overlay = this.modal?.querySelector('.form-modal-overlay');
        
        if (!this.modal || !this.form) {
            console.warn('Modal elements not found');
            return;
        }
        
        this.formService = new FormService('modal');
        this.isOpen = false;
        this.phoneInputManager = null;
        this.fileUploadManager = null;
        
        this.init();
    }
    
    init() {
        console.log('Initializing modal form...');
        
        // Event listeners for modal
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
        
        // Form triggers (mobile only)
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.form-trigger');
            if (trigger) {
                if (window.innerWidth <= 1800) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.open();
                } else {
                    window.location.href = '/get-in-touch/';
                }
            }
        });
        
        // Initialize form components
        this.initFormComponents();
        
        // Initialize form submission
        this.initFormSubmission();
        
        console.log('Modal form initialized');
    }
    
    initFormComponents() {
        // Phone input
        if (window.FormComponents?.PhoneInput) {
            try {
                this.phoneInputManager = new FormComponents.PhoneInput('modal-phone');
                console.log('PhoneInput initialized for modal');
            } catch (error) {
                console.warn('Modal PhoneInput initialization failed:', error);
            }
        }
        
        // File upload
        if (window.FormComponents?.FileUpload) {
            try {
                this.fileUploadManager = new FormComponents.FileUpload({
                    inputId: 'modal-fileUpload',
                    previewId: 'modal-uploadPreview',
                    countId: 'modal-fileCount',
                    sizeId: 'modal-totalSize',
                    maxFiles: 5,
                    maxSize: 25 * 1024 * 1024,
                    allowedTypes: ['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.txt']
                });
                console.log('FileUpload initialized for modal');
            } catch (error) {
                console.error('Modal FileUpload initialization failed:', error);
            }
        }
        
        // Other service toggle
        const otherCheckbox = document.getElementById('modal-service-other');
        const otherContainer = document.getElementById('modal-other-service-container');
        if (otherCheckbox && otherContainer) {
            otherCheckbox.addEventListener('change', (e) => {
                otherContainer.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }
    
    initFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = this.form.querySelector('#modal-submitBtn');
            const originalBtnText = submitBtn.textContent;
            
            // Show loading
            if (submitBtn.querySelector('span')) {
                submitBtn.querySelector('span').textContent = 'Submitting...';
            } else {
                submitBtn.textContent = 'Submitting...';
            }
            submitBtn.disabled = true;
            
            try {
                // Collect data using SHARED service
                const formData = this.formService.collectFormData(
                    this.form, 
                    this.phoneInputManager
                );
                
                // Validate using SHARED service
                const validation = this.formService.validateFormData(formData);
                if (!validation.isValid) {
                    this.formService.showError(this.form, validation.errors[0]);
                    this.formService.resetSubmitButton(submitBtn, originalBtnText);
                    return;
                }
                
                // Process files using SHARED service
                const files = await this.formService.processFiles(
                    document.getElementById('modal-fileUpload')
                );
                
                // Submit using SHARED service
                const result = await this.formService.submitToAPI(formData, files);
                
                if (result.success) {
                    alert('Thank you! Your request has been submitted successfully.');
                    this.close();
                    this.form.reset();
                    // Reset other service container
                    const otherContainer = document.getElementById('modal-other-service-container');
                    if (otherContainer) otherContainer.style.display = 'none';
                } else {
                    this.formService.showError(this.form, result.error || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Modal form submission error:', error);
                this.formService.showError(this.form, 'Network error. Please try again.');
            } finally {
                this.formService.resetSubmitButton(submitBtn, originalBtnText);
            }
        });
    }
    
    open() {
        this.modal.classList.add('active');
        document.body.classList.add('body-no-scroll');
        this.isOpen = true;
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.form.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.classList.remove('body-no-scroll');
        this.isOpen = false;
    }
}

// Initialize modal
document.addEventListener('DOMContentLoaded', function() {
    new ModalForm();
});