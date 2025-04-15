/**
 * Multi-Step Form Logic for Small Business Listing
 * Accountability SA
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('businessForm');
    // Ensure this script only runs if the multi-step form exists on the page
    if (!form || !form.classList.contains('multi-step-form')) {
        // console.log('Multi-step form not found, exiting script.');
        return;
    }

    const steps = Array.from(form.querySelectorAll('.form-step'));
    const nextBtn = form.querySelector('.btn-next');
    const prevBtn = form.querySelector('.btn-prev');
    const submitBtn = form.querySelector('.btn-submit');
    const stepIndicator = form.querySelector('#stepIndicator');
    const totalSteps = steps.length;
    let currentStep = 1;

    const serviceAreaRadios = form.querySelectorAll('input[name="serviceAreaType"]');
    const singleLocationFields = form.querySelector('#singleLocationFields');
    const multipleLocationFields = form.querySelector('#multipleLocationFields');
    const nationalServiceFields = form.querySelector('#nationalServiceFields');

    // --- File Input Handling ---
    const fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileInputWrapper = this.closest('.file-input-wrapper');
            const fileNameDisplay = fileInputWrapper ? fileInputWrapper.querySelector('.file-name') : null;
            const previewContainer = this.closest('.file-upload-group').querySelector('.file-preview');
            const file = this.files[0];

            if (file) {
                if (fileNameDisplay) fileNameDisplay.textContent = file.name;
                // Display image preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (previewContainer) {
                        previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    }
                    // Store URL for review step
                    input.setAttribute('data-preview-url', e.target.result);
                }
                reader.readAsDataURL(file);
            } else {
                if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
                if (previewContainer) previewContainer.innerHTML = '';
                input.removeAttribute('data-preview-url');
            }
        });
    });

    // --- Navigation Logic ---
    function showStep(stepNumber) {
        steps.forEach((step) => {
            step.classList.remove('active');
        });
        const activeStep = form.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if(activeStep) {
            activeStep.classList.add('active');
        }
        currentStep = stepNumber;
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        if (!prevBtn || !nextBtn || !submitBtn || !stepIndicator) return; // Defensive check

        prevBtn.disabled = currentStep === 1;
        nextBtn.classList.toggle('hidden', currentStep === totalSteps);
        submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
        stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    if (currentStep === totalSteps - 1) { // Just before the final review step
                        generateReviewSummary();
                    }
                    showStep(currentStep + 1);
                } else {
                    // Should not happen if next is hidden, but defensive
                    console.log("Already on last step, use Submit");
                }
            } else {
                console.log(`Validation failed for step ${currentStep}`);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        });
    }

    // --- Service Area Logic ---
    function updateLocationFields() {
        const selectedType = form.querySelector('input[name="serviceAreaType"]:checked').value;
        
        // Hide all location sections first
        singleLocationFields.classList.add('hidden');
        multipleLocationFields.classList.add('hidden');
        nationalServiceFields.classList.add('hidden');

        // Disable required fields in hidden sections
        toggleRequired(singleLocationFields, false);
        toggleRequired(multipleLocationFields, false);

        // Show the relevant section and enable required fields
        if (selectedType === 'single') {
            singleLocationFields.classList.remove('hidden');
            toggleRequired(singleLocationFields, true);
        } else if (selectedType === 'multiple') {
            multipleLocationFields.classList.remove('hidden');
            toggleRequired(multipleLocationFields, true);
        } else if (selectedType === 'national') {
            nationalServiceFields.classList.remove('hidden');
            // No required fields in this section
        }
    }

    // Helper function to toggle required attribute and aria-required
    function toggleRequired(container, isRequired) {
        if (!container) return;
        container.querySelectorAll('input, select, textarea').forEach(field => {
            // Only toggle if it originally had the required attribute
            if (field.hasAttribute('data-original-required')) { 
                 field.required = isRequired;
                 field.setAttribute('aria-required', isRequired.toString());
            } 
        });
    }

    // Store original required status and add event listeners
    serviceAreaRadios.forEach(radio => {
        // Mark fields within conditional sections with their original required status
        // This assumes the initial state in HTML has the correct required attributes
        singleLocationFields.querySelectorAll('[required]').forEach(f => f.setAttribute('data-original-required', 'true'));
        multipleLocationFields.querySelectorAll('[required]').forEach(f => f.setAttribute('data-original-required', 'true'));
        
        radio.addEventListener('change', updateLocationFields);
    });

    // Initial call to set the correct fields visible
    updateLocationFields();

    // --- Validation Logic ---
    function validateStep(stepNumber) {
        const currentStepElement = form.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (!currentStepElement) return true; // Step not found?

        const currentStepFields = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        currentStepFields.forEach(field => {
            // Skip validation if the field is inside a hidden location container
            const locationContainer = field.closest('.location-fields');
            if (locationContainer && locationContainer.classList.contains('hidden')) {
                return; // Skip validation for hidden fields
            } 

            let fieldValid = true;
            const formGroup = field.closest('.form-group') || field.parentNode;
            resetFieldValidation(field, formGroup); // Reset previous errors first

            if (field.type === 'checkbox') {
                fieldValid = field.checked;
                if (!fieldValid) {
                   highlightInvalidField(field, 'Please agree to the terms.', formGroup);
                }
            } else if (field.type === 'email') {
                fieldValid = field.value.trim() !== '' && isValidEmail(field.value.trim());
                if (!fieldValid) {
                    highlightInvalidField(field, 'Please enter a valid email address.', formGroup);
                }
            } else if (field.value.trim() === '') {
                 fieldValid = false;
                 highlightInvalidField(field, 'This field is required.', formGroup);
            }

            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Using slightly modified validation functions from small-businesses.js for consistency
    function highlightInvalidField(field, message, formGroup) {
        if (!formGroup) return;
        field.classList.add('invalid');
        // Find or create error message element
        let errorMsg = formGroup.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            // Insert after the input/select/textarea or its relevant wrapper
            const fieldWrapper = field.closest('.file-input-wrapper') || field;
            // Checkbox has label sibling typically
            const insertAfter = field.type === 'checkbox' ? field.nextElementSibling : fieldWrapper;
            if (insertAfter && insertAfter.parentNode === formGroup) {
                 formGroup.insertBefore(errorMsg, insertAfter.nextSibling);
            } else {
                 formGroup.appendChild(errorMsg); // Fallback
            }
        }
        errorMsg.textContent = message;
        errorMsg.style.display = 'block'; // Ensure it's visible
    }

    function resetFieldValidation(field, formGroup) {
         if (!formGroup) return;
        field.classList.remove('invalid');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.style.display = 'none'; // Hide instead of remove, might be reused
            errorMsg.textContent = ''; // Clear text
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // --- Review Summary Generation ---
    function generateReviewSummary() {
        const summaryContainer = document.getElementById('reviewSummary');
        if (!summaryContainer) return;

        const formData = new FormData(form);
        let summaryHtml = '<h4>Review Your Listing Details:</h4>';

        // Define fields to show in summary (Map ID to Label)
        const summaryFields = {
            'businessName': 'Business Name',
            'businessCategory': 'Category',
            'serviceAreaType': 'Service Area Type',
            'businessProvince': 'Province (Single Loc.)',
            'businessSuburb': 'Suburb/Area (Single Loc.)',
            'multipleLocations': 'Areas Served (Multiple Loc.)',
            'businessDescription': 'Description',
            'businessUnique': 'Unique Value',
            'businessPhone': 'Phone',
            'businessEmail': 'Email',
            'businessWebsite': 'Website',
            'businessSocialMedia': 'Social Media'
        };

        for (const [key, label] of Object.entries(summaryFields)) {
            const element = document.getElementById(key);
            let value;
            if(key === 'serviceAreaType') {
                const checkedRadio = form.querySelector('input[name="serviceAreaType"]:checked');
                value = checkedRadio ? checkedRadio.labels[0].textContent.trim() : 'N/A';
            } else {
                 value = element ? element.value.trim() : formData.get(key); 
            }
            
            // Only show relevant location fields based on selection
            const serviceType = form.querySelector('input[name="serviceAreaType"]:checked').value;
            let showField = true;
            if (key === 'businessProvince' || key === 'businessSuburb') {
                showField = (serviceType === 'single');
            }
            if (key === 'multipleLocations') {
                showField = (serviceType === 'multiple');
            }
            
            if (value && showField) { // Only show fields with values AND if they should be shown
                const sanitizedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                summaryHtml += `<p><strong>${label}:</strong> ${sanitizedValue}</p>`;
            }
        }

        // Add National Service notice if selected
        if(form.querySelector('input[name="serviceAreaType"]:checked').value === 'national') {
            summaryHtml += `<p><strong>Service Area:</strong> Nationwide</p>`;
        }
        
        // Add image previews (if they exist)
        const logoInput = form.querySelector('#businessLogo');
        const logoUrl = logoInput ? logoInput.getAttribute('data-preview-url') : null;
        if (logoUrl) {
            summaryHtml += `<p><strong>Logo Preview:</strong></p><img src="${logoUrl}" alt="Logo Preview" style="max-width: 100px; margin-top: 5px; border: 1px solid #eee; border-radius: 4px;">`;
        }
        const bannerInput = form.querySelector('#businessBanner');
        const bannerUrl = bannerInput ? bannerInput.getAttribute('data-preview-url') : null;
        if (bannerUrl) {
            summaryHtml += `<p style="margin-top: 10px;"><strong>Banner Preview:</strong></p><img src="${bannerUrl}" alt="Banner Preview" style="max-width: 200px; margin-top: 5px; border: 1px solid #eee; border-radius: 4px;">`;
        }

        summaryHtml += '<p style="margin-top: 1rem; font-style: italic;">Please review the information above carefully before proceeding to payment.</p>';
        summaryContainer.innerHTML = summaryHtml;
    }

    // --- Form Submission ---
    if (submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Validate the final step (especially the terms checkbox)
            if (validateStep(currentStep)) {
                // Redirect to the Paystack payment link
                window.location.href = "https://paystack.com/pay/accountabilitysa";
                console.log("Form is valid. Redirecting to Paystack payment page...");
            } else {
                console.error("Form validation failed on the final step.");
                // Ensure the error for the terms checkbox is visible
                const termsCheckbox = form.querySelector('#termsAgree');
                if (termsCheckbox && !termsCheckbox.checked) {
                     const formGroup = termsCheckbox.closest('.terms-agreement') || termsCheckbox.parentNode; // Target correct group
                     highlightInvalidField(termsCheckbox, 'You must agree to the terms and conditions.', formGroup);
                }
                alert('Please review the form and correct any errors, including agreeing to the terms.');
            }
        });
    } else {
        console.error('Submit button not found for multi-step form.');
    }

    // Initialize the form view - Show the first step
    showStep(currentStep);
}); 