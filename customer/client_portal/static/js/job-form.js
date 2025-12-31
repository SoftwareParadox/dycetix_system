// job-application-form.js - Complete and independent job application form handler
(function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    const JobApplicationConfig = {
        formClass: 'job-application-form',
        apiUrl: 'http://localhost:8001/api/forms/job-application/',
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1, // Only one resume allowed
        styles: {
            successMessage: `
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
                text-align: center;
            `,
            errorMessage: `
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
            `
        }
    };
    
    // ==================== UTILITY FUNCTIONS ====================
    const JobFormUtils = {
        validateEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        },
        
        createMessageContainer: function(form) {
            const container = document.createElement('div');
            container.className = 'job-form-message';
            container.setAttribute('data-job-form', 'message-container');
            
            // Insert after submit button or at end of form
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.parentNode.insertBefore(container, submitBtn.nextSibling);
            } else {
                form.appendChild(container);
            }
            
            return container;
        },
        
        showMessage: function(message, type, container) {
            if (!container) return;
            
            container.innerHTML = '';
            container.style.cssText = type === 'success' 
                ? JobApplicationConfig.styles.successMessage 
                : JobApplicationConfig.styles.errorMessage;
            
            const icon = type === 'success' 
                ? '<i class="fas fa-check-circle" style="margin-right: 10px;"></i>'
                : '<i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>';
            
            container.innerHTML = `${icon}${message}`;
            
            if (type === 'error') {
                container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    container.innerHTML = '';
                    container.style.cssText = '';
                }, 5000);
            }
        },
        
        clearMessage: function(container) {
            if (container) {
                container.innerHTML = '';
                container.style.cssText = '';
            }
        },
        
        fileToBase64: function(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
    };
    
    // ==================== FORM HANDLER CLASS ====================
    class JobApplicationFormHandler {
        
        constructor(formElement) {
            // Check if it's actually a form
            if (formElement.tagName !== 'FORM') {
                // Try to find the form inside
                this.form = formElement.querySelector('form.job-application-form');
                if (!this.form) {
                    throw new Error('No form element found');
                }
            } else {
                this.form = formElement;
            }
            this.form = formElement;
            this.form.id = this.form.id || 'job-application-form-' + Date.now();
            
            // Get form elements
            this.submitBtn = this.form.querySelector('button[type="submit"]');
            this.messageContainer = this.form.querySelector('.job-form-message') || 
                                   JobFormUtils.createMessageContainer(this.form);
            
            // Initialize components
            this.phoneInputManager = null;
            this.fileUploadManager = null;
            this.resumeFile = null; // Store the resume file
            
            this.init();
        }
        
        async init() {
            console.log('Initializing Job Application Form:', this.form.id);
            
            // Initialize phone input if library is available
            this.initPhoneInput();
            
            // Initialize file upload
            this.initFileUpload();
            
            // Initialize "Other" position functionality
            this.initPositionSelection();
            
            // Add form submission handler
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            console.log('Job Application Form initialized successfully');
        }
        
        initPhoneInput() {
            if (window.FormComponents && window.FormComponents.PhoneInput) {
                const phoneInput = this.form.querySelector('#job-phone');
                if (phoneInput) {
                    try {
                        this.phoneInputManager = new FormComponents.PhoneInput('job-phone');
                        console.log('Phone input initialized for job form');
                    } catch (error) {
                        console.warn('Failed to initialize phone input:', error);
                    }
                }
            }
        }
        
        initFileUpload() {
            const fileInput = this.form.querySelector('#job-fileUpload');
            const previewContainer = this.form.querySelector('#job-uploadPreview');
            const countElement = this.form.querySelector('#job-fileCount');
            const sizeElement = this.form.querySelector('#job-totalSize');
            
            if (!fileInput || !previewContainer) {
                console.warn('File upload elements not found in job form');
                return;
            }
            
            // Create custom file upload handler
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
            
            // Add drag and drop
            const uploadBox = this.form.querySelector('.index-quote-upload-box');
            if (uploadBox) {
                uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e, uploadBox));
                uploadBox.addEventListener('dragleave', (e) => this.handleDragLeave(e, uploadBox));
                uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
            }
            
            // Add remove file functionality
            previewContainer.addEventListener('click', (e) => {
                if (e.target.closest('.remove-file')) {
                    this.removeResume();
                }
            });
        }
        
        initPositionSelection() {
            const showOtherBtn = this.form.querySelector('#job-show-other');
            const otherContainer = this.form.querySelector('#job-other-position-container');
            const otherPositionInput = this.form.querySelector('#job-other-position-input');
            const positionRadios = this.form.querySelectorAll('input[name="position"]');
            
            if (showOtherBtn && otherContainer) {
                showOtherBtn.addEventListener('click', () => {
                    otherContainer.style.display = 'block';
                    showOtherBtn.style.display = 'none';
                    const otherRadio = this.form.querySelector('#job-position-other');
                    if (otherRadio) otherRadio.checked = true;
                    if (otherPositionInput) otherPositionInput.required = true;
                });
            }
            
            // Handle position radio changes
            positionRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'other') {
                        if (otherContainer) otherContainer.style.display = 'block';
                        if (showOtherBtn) showOtherBtn.style.display = 'none';
                        if (otherPositionInput) otherPositionInput.required = true;
                    } else {
                        if (otherContainer) otherContainer.style.display = 'none';
                        if (showOtherBtn) showOtherBtn.style.display = 'block';
                        if (otherPositionInput) {
                            otherPositionInput.required = false;
                            otherPositionInput.value = '';
                        }
                    }
                });
            });
        }
        
        handleFileSelect(e) {
            const fileInput = e.target;
            const files = Array.from(fileInput.files);
            
            if (files.length === 0) return;
            
            // Validate file count (only 1 resume allowed)
            if (files.length > 1) {
                alert('Only one resume file is allowed. Please select only one file.');
                fileInput.value = '';
                return;
            }
            
            const file = files[0];
            
            // Validate file size
            if (file.size > JobApplicationConfig.maxFileSize) {
                alert(`File "${file.name}" exceeds 10MB limit. Please upload a smaller file.`);
                fileInput.value = '';
                return;
            }
            
            // Validate file type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!JobApplicationConfig.allowedFileTypes.includes(fileExtension)) {
                alert(`File type "${fileExtension}" not allowed. Allowed types: ${JobApplicationConfig.allowedFileTypes.join(', ')}`);
                fileInput.value = '';
                return;
            }
            
            // Store the file
            this.resumeFile = file;
            
            // Update preview
            this.updateFilePreview(file);
            
            // Update stats
            this.updateFileStats();
            
            // Clear input to allow re-selection
            fileInput.value = '';
        }
        
        handleDragOver(e, uploadBox) {
            e.preventDefault();
            e.stopPropagation();
            uploadBox.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            uploadBox.style.borderColor = 'var(--section-hero-color)';
        }
        
        handleDragLeave(e, uploadBox) {
            e.preventDefault();
            e.stopPropagation();
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
                // Create a fake change event
                const fileInput = this.form.querySelector('#job-fileUpload');
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]); // Only take first file
                fileInput.files = dataTransfer.files;
                
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        }
        
        updateFilePreview(file) {
            const preview = this.form.querySelector('#job-uploadPreview');
            if (!preview) return;
            
            const fileSize = this.formatFileSize(file.size);
            
            preview.innerHTML = `
                <div class="uploaded-file" style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                    <div style="display: flex; align-items: center;">
                        <i class="fas fa-file-pdf" style="color: #e74c3c; margin-right: 10px; font-size: 1.2em;"></i>
                        <div>
                            <div style="font-weight: 500;">${file.name}</div>
                            <div style="font-size: 0.8em; color: #666;">${fileSize}</div>
                        </div>
                    </div>
                    <button type="button" class="remove-file" style="background: none; border: none; color: #999; cursor: pointer; padding: 5px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
        
        updateFileStats() {
            const countElement = this.form.querySelector('#job-fileCount');
            const sizeElement = this.form.querySelector('#job-totalSize');
            
            if (countElement) {
                countElement.textContent = this.resumeFile ? '1' : '0';
            }
            
            if (sizeElement && this.resumeFile) {
                sizeElement.textContent = this.formatFileSize(this.resumeFile.size);
            }
        }
        
        removeResume() {
            this.resumeFile = null;
            
            const preview = this.form.querySelector('#job-uploadPreview');
            if (preview) {
                preview.innerHTML = '<div class="no-files">No file selected</div>';
            }
            
            this.updateFileStats();
        }
        
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        async handleSubmit(e) {
            e.preventDefault();
            
            console.log('Job application submission started');
            
            // Show loading state
            const originalText = this.submitBtn.textContent;
            this.submitBtn.textContent = 'Submitting...';
            this.submitBtn.disabled = true;
            
            // Clear previous messages
            JobFormUtils.clearMessage(this.messageContainer);
            
            try {
                // Get form data
                const formData = await this.getFormData();
                
                // Validate form
                const validation = this.validateForm(formData);
                if (!validation.isValid) {
                    JobFormUtils.showMessage(validation.errors[0], 'error', this.messageContainer);
                    this.resetSubmitButton(originalText);
                    return;
                }
                
                // Submit to API
                const response = await fetch(JobApplicationConfig.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('API Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('API Response data:', result);
                
                if (result.success) {
                    // Success
                    JobFormUtils.showMessage(
                        result.message || 'Thank you! Your job application has been submitted successfully.',
                        'success',
                        this.messageContainer
                    );
                    
                    // Reset form
                    this.form.reset();
                    this.removeResume();
                    
                    // Reset "Other" position UI
                    const otherContainer = this.form.querySelector('#job-other-position-container');
                    const showOtherBtn = this.form.querySelector('#job-show-other');
                    if (otherContainer) otherContainer.style.display = 'none';
                    if (showOtherBtn) showOtherBtn.style.display = 'block';
                    
                } else {
                    // API returned error
                    JobFormUtils.showMessage(
                        result.error || 'There was an error submitting your application.',
                        'error',
                        this.messageContainer
                    );
                }
                
            } catch (error) {
                console.error('Job form submission error:', error);
                JobFormUtils.showMessage(
                    'Network error. Please check your connection and try again.',
                    'error',
                    this.messageContainer
                );
            } finally {
                this.resetSubmitButton(originalText);
            }
        }
        
        async getFormData() {
            const getValue = (id) => {
                const el = this.form.querySelector(`#${id}`);
                return el ? el.value?.trim() || '' : '';
            };
            
            // Get position
            const positionRadio = this.form.querySelector('input[name="position"]:checked');
            const position = positionRadio ? positionRadio.value : '';
            const otherPosition = position === 'other' ? getValue('job-other-position-input') : '';
            
            // Get phone number
            let phoneNumber = '';
            if (this.phoneInputManager && this.phoneInputManager.getNumber) {
                phoneNumber = this.phoneInputManager.getNumber();
            } else {
                phoneNumber = getValue('job-phone');
            }
            
            // Process resume file
            let resumeBase64 = '';
            if (this.resumeFile) {
                try {
                    const base64 = await JobFormUtils.fileToBase64(this.resumeFile);
                    resumeBase64 = base64.split(',')[1]; // Remove data URL prefix
                } catch (error) {
                    console.error('Error converting resume to base64:', error);
                }
            }
            
            return {
                firstName: getValue('job-firstName'),
                lastName: getValue('job-lastName'),
                email: getValue('job-email'),
                phone: phoneNumber,
                position: position,
                otherPosition: otherPosition,
                resume: this.resumeFile ? {
                    name: this.resumeFile.name,
                    type: this.resumeFile.type,
                    size: this.resumeFile.size,
                    data: resumeBase64,
                    extension: '.' + this.resumeFile.name.split('.').pop().toLowerCase()
                } : null,
                source: 'job-application-page'
            };
        }
        
        validateForm(data) {
            const errors = [];
            
            // Required fields
            if (!data.firstName) errors.push('First name is required');
            if (!data.lastName) errors.push('Last name is required');
            if (!data.email) errors.push('Email is required');
            if (!data.position) errors.push('Please select a position');
            
            // Email format
            if (data.email && !JobFormUtils.validateEmail(data.email)) {
                errors.push('Please enter a valid email address');
            }
            
            // Phone validation (basic)
            if (!data.phone) {
                errors.push('Phone number is required');
            }
            
            // Resume validation
            if (!data.resume) {
                errors.push('Please upload your resume');
            }
            
            // "Other" position validation
            if (data.position === 'other' && !data.otherPosition) {
                errors.push('Please specify the position');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
        
        resetSubmitButton(originalText) {
            this.submitBtn.textContent = originalText;
            this.submitBtn.disabled = false;
        }
    }
    
    // ==================== INITIALIZATION ====================
    function initJobApplicationForms() {
        console.log('Initializing Job Application Forms...');
        
        // Find all job application forms
        const forms = document.querySelectorAll('form.job-application-form');
        
        if (forms.length === 0) {
            console.log('No job application forms found on this page');
            return;
        }
        
        // Initialize each form
        forms.forEach((form, index) => {
            try {
                new JobApplicationFormHandler(form);
                console.log(`Job Application Form ${index + 1} initialized`);
            } catch (error) {
                console.error(`Failed to initialize Job Application Form ${index + 1}:`, error);
            }
        });
    }
    
    // ==================== GLOBAL EXPORT ====================
    window.DycetixJobApplication = {
        init: initJobApplicationForms,
        version: '1.0.0'
    };
    
    // ==================== AUTO-INITIALIZE ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initJobApplicationForms);
    } else {
        initJobApplicationForms();
    }
    
})();