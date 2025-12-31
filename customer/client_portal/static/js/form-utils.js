// form-utils.js - Reusable form components
// This file contains reusable logic for ALL forms

// ==================== REUSABLE PHONE INPUT ====================
class PhoneInput {
    constructor(inputId, config = {}) {
        this.input = document.getElementById(inputId);
        this.config = {
            required: config.required || true,
            format: config.format || 'intl',
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            ...config
        };
        
        if (!this.input) {
            console.error(`Phone input with ID "${inputId}" not found`);
            return;
        }
        
        this.init();
    }
    
    init() {
        // Initialize intl-tel-input
        this.iti = window.intlTelInput(this.input, {
            initialCountry: "auto",
            geoIpLookup: (callback) => {
                fetch('https://ipapi.co/json/')
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("us"));
            },
            utilsScript: this.config.utilsScript,
            preferredCountries: ['us', 'gb', 'ca', 'au', 'in'],
            separateDialCode: false,
            nationalMode: false,
            autoPlaceholder: "polite",
            formatOnDisplay: false,
            customPlaceholder: (selectedCountryPlaceholder, selectedCountryData) => {
                const example = selectedCountryPlaceholder.replace(/[^\d]/g, '');
                return example.substring(0, 10);
            }
        });
        
        // Store instance on input element
        this.input.iti = this.iti;
        
        this.setupEvents();
    }
    
    setupEvents() {
        // Restrict input to only numbers
        this.input.addEventListener('input', (e) => {
            const cursorPosition = this.input.selectionStart;
            let value = this.input.value.replace(/\D/g, '');
            
            const countryData = this.iti.getSelectedCountryData();
            const dialCode = countryData.dialCode;
            
            if (value.startsWith(dialCode)) {
                let nationalNumber = value.substring(dialCode.length);
                
                if (nationalNumber.length > 10) {
                    nationalNumber = nationalNumber.substring(0, 10);
                    value = dialCode + nationalNumber;
                }
                
                const formattedValue = '+' + value;
                this.input.value = formattedValue;
                
                const newCursorPos = cursorPosition - (this.input.value.length - formattedValue.length);
                this.input.setSelectionRange(newCursorPos, newCursorPos);
            } else {
                if (value.length > 10) {
                    value = value.substring(0, 10);
                    this.input.value = '+' + dialCode + value;
                }
            }
            
            // Validate and update UI
            if (this.iti.isValidNumber()) {
                this.input.parentElement.classList.remove('error');
            }
        });
        
        // Prevent non-numeric characters
        this.input.addEventListener('keydown', (e) => {
            if ([46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
                (e.keyCode == 65 && e.ctrlKey === true) ||
                (e.keyCode == 67 && e.ctrlKey === true) ||
                (e.keyCode == 86 && e.ctrlKey === true) ||
                (e.keyCode == 88 && e.ctrlKey === true) ||
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                (e.keyCode < 96 || e.keyCode > 105) &&
                e.keyCode !== 107 && e.keyCode !== 109 && e.keyCode !== 189) {
                e.preventDefault();
            }
        });
    }
    
    getNumber() {
        return this.iti ? this.iti.getNumber() : this.input.value;
    }
    
    isValid() {
        return this.iti ? this.iti.isValidNumber() : false;
    }
    
    destroy() {
        if (this.iti) {
            this.iti.destroy();
        }
    }
}

// ==================== REUSABLE FILE UPLOAD ====================
class FileUpload {
    constructor(config = {}) {
        this.config = {
            inputId: config.inputId || '',
            previewId: config.previewId || '',
            countId: config.countId || '',
            sizeId: config.sizeId || '',
            maxFiles: config.maxFiles || 5,
            maxSize: config.maxSize || 25 * 1024 * 1024, // 25MB
            allowedTypes: config.allowedTypes || ['.pdf', '.docx', '.zip', '.png', '.jpg', '.jpeg'],
            ...config
        };
        
        this.files = [];
        this.init();
    }
    
    init() {
        this.input = document.getElementById(this.config.inputId);
        this.preview = document.getElementById(this.config.previewId);
        
        if (!this.input || !this.preview) {
            console.error(`File upload elements not found for IDs: ${this.config.inputId}, ${this.config.previewId}`);
            return;
        }
        
        this.setupEvents();
        this.updatePreview();
    }
    
    setupEvents() {
        // Handle file selection
        this.input.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Add drag and drop functionality
        const uploadBox = this.input.parentElement.querySelector('.index-quote-upload-box') || 
                         document.querySelector(`label[for="${this.config.inputId}"]`);
        
        if (uploadBox) {
            uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadBox.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        }
        
        // Event delegation for remove buttons
        this.preview.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-file');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0 && index < this.files.length) {
                    this.removeFile(index);
                }
            }
        });
    }
    
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Validate files
        const validFiles = files.filter(file => {
            if (file.size > this.config.maxSize) {
                alert(`File "${file.name}" exceeds ${this.formatFileSize(this.config.maxSize)} limit`);
                return false;
            }
            
            // Check file type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!this.config.allowedTypes.includes(fileExtension)) {
                alert(`File type "${fileExtension}" not allowed. Allowed types: ${this.config.allowedTypes.join(', ')}`);
                return false;
            }
            
            return true;
        });
        
        // Check max files
        if (this.files.length + validFiles.length > this.config.maxFiles) {
            alert(`Maximum ${this.config.maxFiles} files allowed. You already have ${this.files.length} files.`);
            e.target.value = '';
            return;
        }
        
        // Add new files
        validFiles.forEach(file => {
            const fileExists = this.files.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );
            
            if (!fileExists) {
                this.files.push(file);
            }
        });
        
        this.updatePreview();
        e.target.value = '';
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = e.currentTarget;
        uploadBox.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        uploadBox.style.borderColor = 'var(--section-hero-color)';
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = e.currentTarget;
        uploadBox.style.backgroundColor = '';
        uploadBox.style.borderColor = '';
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = e.currentTarget;
        uploadBox.style.backgroundColor = '';
        uploadBox.style.borderColor = '';
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            this.input.files = dataTransfer.files;
            
            const event = new Event('change', { bubbles: true });
            this.input.dispatchEvent(event);
        }
    }
    
    updatePreview() {
        if (this.files.length === 0) {
            this.preview.innerHTML = '<div class="no-files">No files selected</div>';
        } else {
            this.preview.innerHTML = this.files.map((file, index) => `
                <div class="uploaded-file">
                    <i class="fas fa-file"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                    <button type="button" class="remove-file" data-index="${index}" title="Remove this file">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
        
        // Update stats
        this.updateStats();
    }
    
    updateStats() {
        const countElement = document.getElementById(this.config.countId);
        const sizeElement = document.getElementById(this.config.sizeId);
        
        if (countElement) {
            countElement.textContent = this.files.length;
        }
        
        if (sizeElement) {
            const totalSize = this.files.reduce((total, file) => total + file.size, 0);
            sizeElement.textContent = this.formatFileSize(totalSize);
        }
    }
    
    removeFile(index) {
        if (index >= 0 && index < this.files.length) {
            this.files.splice(index, 1);
            this.updatePreview();
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getFiles() {
        return this.files;
    }
    
    clearFiles() {
        this.files = [];
        this.updatePreview();
    }
    
    getFormData() {
        const formData = new FormData();
        this.files.forEach((file, index) => {
            formData.append(`file_${index}`, file);
        });
        return formData;
    }
}

// ==================== REUSABLE FORM VALIDATOR ====================
class FormValidator {
    constructor(formId, config = {}) {
        this.form = document.getElementById(formId);
        this.config = config;
        
        if (!this.form) {
            console.error(`Form with ID "${formId}" not found`);
            return;
        }
    }
    
    validate() {
        let isValid = true;
        const errors = [];
        
        // Validate required fields
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                const fieldName = field.name || field.id || 'Field';
                errors.push(`${fieldName} is required`);
                field.parentElement.classList.add('error');
                isValid = false;
            } else {
                field.parentElement.classList.remove('error');
            }
        });
        
        // Validate email format
        const emailFields = this.form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                errors.push(`${field.name || field.id} must be a valid email address`);
                field.parentElement.classList.add('error');
                isValid = false;
            }
        });
        
        // Custom validation callbacks
        if (this.config.customValidation) {
            const customResult = this.config.customValidation(this.form);
            if (!customResult.isValid) {
                errors.push(...customResult.errors);
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }
    
    isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    showErrors(errors) {
        // You can customize how errors are displayed
        if (errors.length > 0) {
            alert(errors.join('\n'));
        }
    }
    
    resetValidation() {
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
    }
}

// ==================== FORM MANAGER (Main Entry Point) ====================
class FormManager {
    constructor(formConfig) {
        this.config = formConfig;
        this.phoneInput = null;
        this.fileUpload = null;
        this.validator = null;
        this.init();
    }
    
    init() {
        // Initialize phone input if config provided
        if (this.config.phoneInputId) {
            this.phoneInput = new PhoneInput(this.config.phoneInputId, this.config.phoneConfig);
        }
        
        // Initialize file upload if config provided
        if (this.config.fileUploadConfig) {
            this.fileUpload = new FileUpload(this.config.fileUploadConfig);
        }
        
        // Initialize validator if form ID provided
        if (this.config.formId) {
            this.validator = new FormValidator(this.config.formId, this.config.validationConfig);
        }
        
        // Set up form submission
        if (this.config.formId) {
            this.setupSubmission();
        }
    }
    
    setupSubmission() {
        const form = document.getElementById(this.config.formId);
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate form
            if (this.validator) {
                const validation = this.validator.validate();
                if (!validation.isValid) {
                    this.validator.showErrors(validation.errors);
                    return;
                }
            }
            
            // Validate phone
            if (this.phoneInput && this.config.validatePhone !== false) {
                if (!this.phoneInput.isValid()) {
                    alert('Please enter a valid phone number');
                    return;
                }
            }
            
            // Validate files
            if (this.fileUpload) {
                const totalSize = this.fileUpload.files.reduce((total, file) => total + file.size, 0);
                if (totalSize > (this.config.fileUploadConfig?.maxSize || 25 * 1024 * 1024) * 
                    (this.config.fileUploadConfig?.maxFiles || 5)) {
                    alert('Total file size exceeds maximum allowed');
                    return;
                }
            }
            
            // Submit form
            this.submit();
        });
    }
    
    async submit() {
        try {
            // Show loading state
            const submitBtn = document.querySelector(`#${this.config.formId} button[type="submit"]`);
            const originalText = submitBtn?.querySelector('span')?.textContent || submitBtn?.textContent;
            
            if (submitBtn) {
                if (submitBtn.querySelector('span')) {
                    submitBtn.querySelector('span').textContent = 'Submitting...';
                } else {
                    submitBtn.textContent = 'Submitting...';
                }
                submitBtn.disabled = true;
            }
            
            // Prepare form data
            const formData = new FormData();
            
            // Add form type
            formData.append('form_type', this.config.formType || 'unknown');
            
            // Add all form fields
            const form = document.getElementById(this.config.formId);
            const formFields = form.querySelectorAll('input, textarea, select');
            formFields.forEach(field => {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    if (field.checked) {
                        formData.append(field.name, field.value);
                    }
                } else if (field.type !== 'file') {
                    formData.append(field.name, field.value);
                }
            });
            
            // Add phone number
            if (this.phoneInput) {
                formData.append('phone', this.phoneInput.getNumber());
            }
            
            // Add files
            if (this.fileUpload) {
                this.fileUpload.files.forEach((file, index) => {
                    formData.append(`file_${index}`, file);
                });
            }
            
            // Submit to backend (customize URL per form type)
            const response = await fetch(this.config.submitUrl || '/api/submit-form', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Show success message
                alert(this.config.successMessage || 'Form submitted successfully!');
                
                // Reset form
                this.reset();
                
                // Call success callback if provided
                if (this.config.onSuccess) {
                    this.config.onSuccess(result);
                }
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert(this.config.errorMessage || 'There was an error submitting the form. Please try again.');
        } finally {
            // Restore button state
            const submitBtn = document.querySelector(`#${this.config.formId} button[type="submit"]`);
            if (submitBtn) {
                if (submitBtn.querySelector('span')) {
                    submitBtn.querySelector('span').textContent = this.config.submitText || 'Submit';
                } else {
                    submitBtn.textContent = this.config.submitText || 'Submit';
                }
                submitBtn.disabled = false;
            }
        }
    }
    
    reset() {
        const form = document.getElementById(this.config.formId);
        if (form) {
            form.reset();
        }
        
        if (this.phoneInput) {
            this.phoneInput.input.value = '';
            if (this.phoneInput.iti) {
                this.phoneInput.iti.setNumber('');
            }
        }
        
        if (this.fileUpload) {
            this.fileUpload.clearFiles();
        }
        
        if (this.validator) {
            this.validator.resetValidation();
        }
    }
}

// ==================== EXPORT FOR USE ====================
window.FormComponents = {
    PhoneInput,
    FileUpload,
    FormValidator,
    FormManager
};

// Auto-initialize forms with data attributes
document.addEventListener('DOMContentLoaded', function() {
    // Find all forms with data-form-manager attribute
    const forms = document.querySelectorAll('[data-form-manager]');
    
    forms.forEach(form => {
        const formId = form.id;
        const formType = form.getAttribute('data-form-type');
        
        // Get config from data attributes or use defaults
        const config = {
            formId: formId,
            formType: formType,
            phoneInputId: form.getAttribute('data-phone-input'),
            submitUrl: form.getAttribute('data-submit-url'),
            // Add more config from data attributes as needed
        };
        
        // Initialize form manager
        new FormManager(config);
    });
});