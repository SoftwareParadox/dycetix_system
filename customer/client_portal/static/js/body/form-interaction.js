// // Enhanced form functionality
// document.addEventListener('DOMContentLoaded', function() {
//     // Floating label enhancement
//     const formGroups = document.querySelectorAll('.index-quote-form-group.floating-label');
    
//     formGroups.forEach(group => {
//         const input = group.querySelector('input, textarea, select');
//         const label = group.querySelector('label');
        
//         // Check initial state
//         if (input.value) {
//             label.classList.add('active');
//         }
        
//         // Add event listeners
//         input.addEventListener('focus', () => {
//             label.classList.add('active');
//         });
        
//         input.addEventListener('blur', () => {
//             if (!input.value) {
//                 label.classList.remove('active');
//             }
//         });
        
//         input.addEventListener('input', () => {
//             if (input.value) {
//                 label.classList.add('active');
//             } else {
//                 label.classList.remove('active');
//             }
//         });
//     });
    
//     // File upload preview functionality
//     const fileInput = document.getElementById('fileUpload');
//     const uploadPreview = document.querySelector('.index-quote-upload-preview');
    
//     fileInput.addEventListener('change', function(e) {
//         uploadPreview.innerHTML = '';
        
//         if (this.files.length > 0) {
//             Array.from(this.files).forEach((file, index) => {
//                 if (index < 5) { // Max 5 files
//                     const fileItem = document.createElement('div');
//                     fileItem.className = 'file-preview-item';
//                     fileItem.innerHTML = `
//                         <span>${file.name}</span>
//                         <button type="button" class="remove-file" data-index="${index}">×</button>
//                     `;
//                     uploadPreview.appendChild(fileItem);
//                 }
//             });
//         }
//     });
    
//     // Remove file functionality
//     uploadPreview.addEventListener('click', function(e) {
//         if (e.target.classList.contains('remove-file')) {
//             e.target.parentElement.remove();
//         }
//     });
// });