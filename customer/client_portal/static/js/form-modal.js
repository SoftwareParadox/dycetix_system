// // form-modal.js - Simplified version without FormManager
// class FormModal {
//     constructor() {
//         this.modal = document.getElementById('form-modal');
//         this.modalContent = this.modal?.querySelector('.form-modal-content');
//         this.closeButton = this.modal?.querySelector('.form-modal-close');
//         this.overlay = this.modal?.querySelector('.form-modal-overlay');
        
//         if (!this.modal || !this.modalContent) {
//             console.warn('Form modal elements not found');
//             return;
//         }
        
//         this.isOpen = false;
//         this.init();
//     }
    
//     init() {
//         // Close modal events
//         this.closeButton?.addEventListener('click', () => this.close());
//         this.overlay?.addEventListener('click', () => this.close());
        
//         // Close on Escape key
//         document.addEventListener('keydown', (e) => {
//             if (e.key === 'Escape' && this.isOpen) {
//                 this.close();
//             }
//         });
        
//         // Handle form trigger clicks
//         this.handleFormTriggers();
//     }
    
//     handleFormTriggers() {
//         // Add click event to all form trigger buttons
//         document.addEventListener('click', (e) => {
//             const trigger = e.target.closest('.form-trigger');
//             if (trigger) {
//                 if (window.innerWidth <= 820) {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     this.open();
//                 } else {
//                     // Desktop - navigate to get-in-touch page
//                     window.location.href = '/get-in-touch/';
//                 }
//             }
//         });
//     }
    
//     open() {
//         // Check if global form exists
//         const originalFormContainer = document.querySelector('#global-quote-form .index-quote-form-panel');
//         if (!originalFormContainer) {
//             console.error('Global form container not found');
//             return;
//         }
        
//         // Get the actual form
//         const originalForm = originalFormContainer.querySelector('.index-quote-quote-form');
//         if (!originalForm) {
//             console.error('Global form not found');
//             return;
//         }
        
//         // Clone the form for the modal (don't move original)
//         const clonedForm = originalForm.cloneNode(true);
        
//         // Clear modal content and add cloned form
//         this.modalContent.innerHTML = '';
        
//         // Create a wrapper for the form in modal
//         const modalWrapper = document.createElement('div');
//         modalWrapper.className = 'modal-form-wrapper';
//         modalWrapper.appendChild(clonedForm);
//         this.modalContent.appendChild(modalWrapper);
        
//         // Show modal
//         this.modal.classList.add('active');
//         document.body.classList.add('body-no-scroll');
//         this.isOpen = true;
        
//         // Initialize the modal form (simple version)
//         this.initializeModalForm(clonedForm);
        
//         // Adjust form styling for modal
//         this.adjustFormForModal();
//     }
    
//     initializeModalForm(formElement) {
//         console.log("Initializing modal form");
        
//         // Update all IDs in the cloned form to avoid conflicts
//         this.updateClonedFormIds(formElement);
        
//         // Get form elements
//         const submitBtn = formElement.querySelector('button[type="submit"]');
//         if (!submitBtn) {
//             console.error('Submit button not found in modal form');
//             return;
//         }
        
//         // Initialize phone input if available
//         let phoneInputManager = null;
//         if (window.FormComponents?.PhoneInput) {
//             try {
//                 const phoneInput = formElement.querySelector('#modal-phone');
//                 if (phoneInput) {
//                     phoneInputManager = new FormComponents.PhoneInput('modal-phone');
//                     console.log("PhoneInput component initialized for modal");
//                 }
//             } catch (error) {
//                 console.warn("PhoneInput initialization failed in modal:", error);
//             }
//         }
        
//         // Initialize file upload if available
//         let fileUploadManager = null;
//         if (window.FormComponents?.FileUpload) {
//             try {
//                 fileUploadManager = new FormComponents.FileUpload({
//                     inputId: 'modal-fileUpload',
//                     previewId: 'modal-uploadPreview',
//                     countId: 'modal-fileCount',
//                     sizeId: 'modal-totalSize',
//                     maxFiles: 5,
//                     maxSize: 25 * 1024 * 1024, // 25MB
//                     allowedTypes: ['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.txt']
//                 });
//                 console.log("FileUpload component initialized for modal");
//             } catch (error) {
//                 console.error("FileUpload initialization failed in modal:", error);
//             }
//         }
        
//         // Add form submission handler
//         formElement.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             console.log("Modal form submission started");
            
//             // Show loading state
//             const originalBtnText = submitBtn.textContent || 'Submit';
//             if (submitBtn.querySelector('span')) {
//                 submitBtn.querySelector('span').textContent = 'Submitting...';
//             } else {
//                 submitBtn.textContent = 'Submitting...';
//             }
//             submitBtn.disabled = true;
            
//             try {
//                 // Get form data (INCLUDING FILES)
//                 const formData = await this.collectFormData(formElement, phoneInputManager, fileUploadManager);
                
//                 // Validate form
//                 const validation = this.validateFormData(formData);
//                 if (!validation.isValid) {
//                     this.showModalError(validation.errors[0], formElement);
//                     this.resetSubmitButton(originalBtnText, submitBtn);
//                     return;
//                 }
                
//                 // Submit to API
//                 const response = await fetch('http://localhost:8001/api/forms/client-requirement/', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(formData)
//                 });
                
//                 console.log("Modal API Response status:", response.status);
                
//                 if (!response.ok) {
//                     throw new Error(`API responded with status: ${response.status}`);
//                 }
                
//                 const result = await response.json();
//                 console.log("Modal API Response data:", result);
                
//                 if (result.success) {
//                     // Success
//                     alert('Thank you! Your request has been submitted successfully.');
                    
//                     // Close modal
//                     this.close();
                    
//                 } else {
//                     // API returned error
//                     this.showModalError(result.error || 'There was an error submitting your request.', formElement);
//                 }
                
//             } catch (error) {
//                 console.error('Modal form submission error:', error);
//                 this.showModalError('Network error. Please check your connection and try again.', formElement);
//             } finally {
//                 this.resetSubmitButton(originalBtnText, submitBtn);
//             }
//         });
//     }
    
//     async collectFormData(formElement, phoneInputManager, fileUploadManager) {
//         // Helper function to get element value
//         const getValue = (id) => {
//             const el = formElement.querySelector(`#${id}`);
//             return el ? el.value?.trim() || '' : '';
//         };
        
//         // Get phone number
//         let phoneNumber = '';
//         if (phoneInputManager && phoneInputManager.getNumber) {
//             phoneNumber = phoneInputManager.getNumber();
//         } else {
//             phoneNumber = getValue('modal-phone');
//         }
        
//         // Get services
//         const services = [];
//         const checkboxes = formElement.querySelectorAll('.service-option input[type="checkbox"]:checked');
//         checkboxes.forEach(cb => {
//             if (cb.value) services.push(cb.value);
//         });
        
//         // Get files
//         const files = await this.handleFileUploads(fileUploadManager);
        
//         // Prepare basic form data
//         const formData = {
//             firstName: getValue('modal-firstName'),
//             lastName: getValue('modal-lastName'),
//             email: getValue('modal-email'),
//             phone: phoneNumber,
//             company: getValue('modal-company'),
//             projectDetails: getValue('modal-projectDetails'),
//             services: services,
//             otherService: getValue('modal-other-service-input'),
//             source: 'website-modal',
//             files: files
//         };
        
//         console.log("Modal form data collected:", { 
//             ...formData, 
//             services: formData.services.length,
//             files: formData.files.length 
//         });
        
//         return formData;
//     }
    
//     async handleFileUploads(fileUploadManager) {
//         try {
//             // Use FileUpload component if available
//             if (fileUploadManager && fileUploadManager.getFiles) {
//                 const files = fileUploadManager.getFiles();
//                 if (files.length === 0) return [];
                
//                 const processedFiles = [];
//                 for (const file of files) {
//                     const base64 = await this.fileToBase64(file);
//                     processedFiles.push({
//                         name: file.name,
//                         type: file.type,
//                         size: file.size,
//                         data: base64.split(',')[1], // Remove data URL prefix
//                         extension: '.' + file.name.split('.').pop().toLowerCase()
//                     });
//                 }
//                 return processedFiles;
//             }
//             return [];
//         } catch (error) {
//             console.error("Modal file upload error:", error);
//             return [];
//         }
//     }
    
//     fileToBase64(file) {
//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.readAsDataURL(file);
//             reader.onload = () => resolve(reader.result);
//             reader.onerror = error => reject(error);
//         });
//     }
    
//     validateFormData(data) {
//         const errors = [];
        
//         // Required field validation
//         if (!data.firstName) errors.push('First name is required');
//         if (!data.lastName) errors.push('Last name is required');
//         if (!data.email) errors.push('Email is required');
//         if (!data.projectDetails) errors.push('Project details are required');
        
//         // Email format validation
//         if (data.email && !this.isValidEmail(data.email)) {
//             errors.push('Please enter a valid email address');
//         }
        
//         // Service selection validation
//         if (!data.services || data.services.length === 0) {
//             errors.push('Please select at least one service');
//         }
        
//         // "Other" service validation
//         if (data.services.includes('other') && !data.otherService) {
//             errors.push('Please specify the "Other" service');
//         }
        
//         return {
//             isValid: errors.length === 0,
//             errors: errors
//         };
//     }
    
//     isValidEmail(email) {
//         const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return re.test(email);
//     }
    
//     showModalError(message, formElement) {
//         // Remove any existing error messages
//         const existingError = formElement.querySelector('.form-error-message');
//         if (existingError) existingError.remove();
        
//         // Create error message element
//         const errorDiv = document.createElement('div');
//         errorDiv.className = 'form-error-message';
//         errorDiv.style.cssText = `
//             background-color: #fee;
//             color: #c00;
//             padding: 10px 15px;
//             margin: 15px 0;
//             border-radius: 4px;
//             border-left: 4px solid #c00;
//         `;
//         errorDiv.textContent = message;
        
//         // Insert at top of form
//         formElement.insertBefore(errorDiv, formElement.firstChild);
//     }
    
//     resetSubmitButton(originalText, button) {
//         if (button.querySelector('span')) {
//             button.querySelector('span').textContent = originalText;
//         } else {
//             button.textContent = originalText;
//         }
//         button.disabled = false;
//     }
    
//     updateClonedFormIds(formElement) {
//         // Update all IDs in the cloned form to use "modal-" prefix
//         const idMap = {
//             'global-': 'modal-'
//         };
        
//         // Update input IDs
//         const inputs = formElement.querySelectorAll('[id]');
//         inputs.forEach(input => {
//             for (const [oldPrefix, newPrefix] of Object.entries(idMap)) {
//                 if (input.id.startsWith(oldPrefix)) {
//                     input.id = input.id.replace(oldPrefix, newPrefix);
//                     break;
//                 }
//             }
//         });
        
//         // Update label "for" attributes
//         const labels = formElement.querySelectorAll('label[for]');
//         labels.forEach(label => {
//             for (const [oldPrefix, newPrefix] of Object.entries(idMap)) {
//                 if (label.getAttribute('for').startsWith(oldPrefix)) {
//                     label.setAttribute('for', label.getAttribute('for').replace(oldPrefix, newPrefix));
//                     break;
//                 }
//             }
//         });
//     }
    
//     close() {
//         // Close modal
//         this.modal.classList.remove('active');
//         document.body.classList.remove('body-no-scroll');
//         this.isOpen = false;
        
//         // Clear modal content after animation
//         setTimeout(() => {
//             if (!this.isOpen) {
//                 this.modalContent.innerHTML = '';
//             }
//         }, 300);
//     }
    
//     adjustFormForModal() {
//         // Add specific modal styling
//         const form = this.modalContent.querySelector('form');
//         if (form) {
//             form.style.maxWidth = '100%';
//             form.style.padding = '20px';
//             form.style.boxSizing = 'border-box';
            
//             // Adjust service options for mobile
//             const serviceOptions = form.querySelectorAll('.service-option');
//             serviceOptions.forEach(option => {
//                 option.style.padding = '12px 10px';
//                 option.style.marginBottom = '8px';
//             });
//         }
//     }
// }

// // Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     new FormModal();
// });