// static/js/form-service.js
// This contains ALL shared logic for BOTH forms
class FormService {
    constructor(formType) {
        this.formType = formType; // 'global' or 'modal'
        this.apiEndpoint = 'http://localhost:8001/api/forms/client-requirement/';
    }
    
    // === SHARED VALIDATION ===
    validateFormData(data) {
        const errors = [];
        
        // Required fields
        if (!data.firstName) errors.push('First name is required');
        if (!data.lastName) errors.push('Last name is required');
        if (!data.email) errors.push('Email is required');
        if (!data.projectDetails) errors.push('Project details are required');
        
        // Email format
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Services
        if (!data.services || data.services.length === 0) {
            errors.push('Please select at least one service');
        }
        
        // Other service
        if (data.services.includes('other') && !data.otherService) {
            errors.push('Please specify the "Other" service');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // === SHARED FILE HANDLING ===
    async processFiles(fileInput) {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            return [];
        }
        
        const files = Array.from(fileInput.files);
        const processedFiles = [];
        
        for (const file of files) {
            const base64 = await this.fileToBase64(file);
            processedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64.split(',')[1],
                extension: '.' + file.name.split('.').pop().toLowerCase()
            });
        }
        
        return processedFiles;
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    
    // === SHARED DATA COLLECTION ===
    collectFormData(formElement, phoneInputManager = null, fileInput = null) {
        const formData = new FormData(formElement);
        const data = {
            firstName: formData.get('firstName') || '',
            lastName: formData.get('lastName') || '',
            email: formData.get('email') || '',
            phone: phoneInputManager ? phoneInputManager.getNumber() : (formData.get('phone') || ''),
            company: formData.get('company') || '',
            projectDetails: formData.get('projectDetails') || '',
            services: formData.getAll('services') || [],
            otherService: formData.get('otherService') || '',
            source: this.formType === 'global' ? 'website' : 'website-modal'
        };
        
        return data;
    }
    
    // === SHARED API SUBMISSION ===
    async submitToAPI(formData, files = []) {
        const payload = {
            ...formData,
            files: files
        };
        
        console.log(`Submitting ${this.formType} form:`, payload);
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error(`${this.formType} form submission error:`, error);
            throw error;
        }
    }
    
    // === SHARED UI HELPERS ===
    showError(formElement, message) {
        // Remove existing errors
        const existingError = formElement.querySelector('.form-error-message');
        if (existingError) existingError.remove();
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.style.cssText = `
            background-color: #fee;
            color: #c00;
            padding: 12px 15px;
            margin: 15px 0;
            border-radius: 4px;
            border-left: 4px solid #c00;
        `;
        errorDiv.textContent = message;
        
        // Insert at top of form
        formElement.insertBefore(errorDiv, formElement.firstChild);
    }
    
    resetSubmitButton(button, originalText) {
        if (button.querySelector('span')) {
            button.querySelector('span').textContent = originalText;
        } else {
            button.textContent = originalText;
        }
        button.disabled = false;
    }
}

// Make it globally available
window.FormService = FormService;