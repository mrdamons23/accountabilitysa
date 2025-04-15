/**
 * Small Businesses Page JavaScript
 * Accountability SA
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all small businesses page components
    initSmallBusinessesPage();
    
    // Animate the total businesses counter
    animateTotalBusinesses();
    
    // Set up event listeners for business form
    setupBusinessForm();
    
    // Set up business listing interactions
    setupBusinessListings();
});

/**
 * Initialize all components for the small businesses page
 */
function initSmallBusinessesPage() {
    // Show appropriate sections based on URL hash
    handleSectionVisibility();
    
    // Set up the navigation between sections
    setupSectionNavigation();
    
    // Load business listings data
    loadBusinessListings();
    
    // Set up search and filter functionality
    setupSearchAndFilters();
}

/**
 * Show appropriate sections based on URL hash
 */
function handleSectionVisibility() {
    const hash = window.location.hash;
    const createSection = document.getElementById('createBusiness');
    const listingsSection = document.getElementById('businessListings');
    const previewSection = document.getElementById('businessPreview');
    const successSection = document.getElementById('submissionSuccess');
    
    // Hide all sections initially
    if (createSection) createSection.classList.add('hidden');
    if (previewSection) previewSection.classList.add('hidden');
    if (successSection) successSection.classList.add('hidden');
    
    // Show appropriate section based on hash
    if (hash === '#create') {
        if (createSection) createSection.classList.remove('hidden');
        if (listingsSection) listingsSection.classList.add('hidden');
    } else if (hash === '#preview') {
        if (previewSection) previewSection.classList.remove('hidden');
        if (createSection) createSection.classList.remove('hidden');
    } else if (hash === '#success') {
        if (successSection) successSection.classList.remove('hidden');
        if (listingsSection) listingsSection.classList.add('hidden');
    } else {
        // Default to listings
        if (listingsSection) listingsSection.classList.remove('hidden');
    }
}

/**
 * Set up navigation between sections
 */
function setupSectionNavigation() {
    // Create Listing button
    const createListingBtn = document.getElementById('createListingBtn');
    if (createListingBtn) {
        createListingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'create';
            handleSectionVisibility();
            window.scrollTo(0, 0);
        });
    }
    
    // Browse Listings button
    const browseListingsBtn = document.getElementById('browseListingsBtn');
    if (browseListingsBtn) {
        browseListingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = '';
            handleSectionVisibility();
            const listingsSection = document.getElementById('businessListings');
            if (listingsSection) {
                listingsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleSectionVisibility);
}

/**
 * Set up event listeners for the business submission form
 */
function setupBusinessForm() {
    const businessForm = document.getElementById('businessForm');
    if (!businessForm) return;
    
    // Handle form submission
    businessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateBusinessForm()) {
            return;
        }
        
        // Generate preview
        generateBusinessPreview();
        
        // Show preview section
        window.location.hash = 'preview';
        handleSectionVisibility();
        
        // Scroll to preview
        const previewSection = document.getElementById('businessPreview');
        if (previewSection) {
            previewSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Add event listener to the submit button in the preview section
        const finalSubmitBtn = document.querySelector('#previewContainer .btn-primary');
        if (finalSubmitBtn) {
            finalSubmitBtn.addEventListener('click', function() {
                // Here you would typically send the form data to a server
                // For now, just show the success message
                window.location.hash = 'success';
                handleSectionVisibility();
                window.scrollTo(0, 0);
            });
        }
    });
    
    // Handle file inputs and previews
    setupFileInputs();
}

/**
 * Validate the business submission form
 */
function validateBusinessForm() {
    const businessForm = document.getElementById('businessForm');
    if (!businessForm) return false;
    
    // Get form fields
    const businessName = document.getElementById('businessName');
    const businessCategory = document.getElementById('businessCategory');
    const businessProvince = document.getElementById('businessProvince');
    const businessDescription = document.getElementById('businessDescription');
    const businessUnique = document.getElementById('businessUnique');
    const businessEmail = document.getElementById('businessEmail');
    
    // Validate required fields
    let isValid = true;
    
    if (!businessName.value.trim()) {
        highlightInvalidField(businessName, 'Business name is required');
        isValid = false;
    } else {
        resetFieldValidation(businessName);
    }
    
    if (!businessCategory.value) {
        highlightInvalidField(businessCategory, 'Please select a category');
        isValid = false;
    } else {
        resetFieldValidation(businessCategory);
    }
    
    if (!businessProvince.value) {
        highlightInvalidField(businessProvince, 'Please select a province');
        isValid = false;
    } else {
        resetFieldValidation(businessProvince);
    }
    
    if (!businessDescription.value.trim()) {
        highlightInvalidField(businessDescription, 'Business description is required');
        isValid = false;
    } else {
        resetFieldValidation(businessDescription);
    }
    
    if (!businessUnique.value.trim()) {
        highlightInvalidField(businessUnique, 'Please describe what makes your business unique');
        isValid = false;
    } else {
        resetFieldValidation(businessUnique);
    }
    
    if (!businessEmail.value.trim()) {
        highlightInvalidField(businessEmail, 'Contact email is required');
        isValid = false;
    } else if (!isValidEmail(businessEmail.value.trim())) {
        highlightInvalidField(businessEmail, 'Please enter a valid email address');
        isValid = false;
    } else {
        resetFieldValidation(businessEmail);
    }
    
    return isValid;
}

/**
 * Highlight an invalid form field
 */
function highlightInvalidField(field, message) {
    field.classList.add('invalid');
    
    // Check if error message already exists
    let errorMsg = field.parentNode.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        field.parentNode.appendChild(errorMsg);
    }
    
    errorMsg.textContent = message;
}

/**
 * Reset field validation styling
 */
function resetFieldValidation(field) {
    field.classList.remove('invalid');
    
    // Remove error message if it exists
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Set up file input handling
 */
function setupFileInputs() {
    const logoInput = document.getElementById('businessLogo');
    const bannerInput = document.getElementById('businessBanner');
    
    if (logoInput) {
        logoInput.addEventListener('change', function() {
            handleFilePreview(this, 'logo');
        });
    }
    
    if (bannerInput) {
        bannerInput.addEventListener('change', function() {
            handleFilePreview(this, 'banner');
        });
    }
}

/**
 * Handle file input preview
 */
function handleFilePreview(input, type) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Store the image data in a data attribute for later use
            input.setAttribute('data-preview-url', e.target.result);
            
            // Create preview element if it doesn't exist
            let previewContainer = input.parentNode.querySelector('.file-preview');
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'file-preview';
                input.parentNode.appendChild(previewContainer);
            }
            
            // Update preview
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="${type} preview" class="${type}-preview">
                <button type="button" class="remove-file" data-type="${type}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add click event to remove button
            const removeBtn = previewContainer.querySelector('.remove-file');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    input.value = '';
                    input.removeAttribute('data-preview-url');
                    previewContainer.remove();
                });
            }
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Generate business preview based on form data
 */
function generateBusinessPreview() {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;
    
    // Get form data
    const businessName = document.getElementById('businessName').value;
    const businessCategory = document.getElementById('businessCategory').value;
    const businessProvince = document.getElementById('businessProvince').value;
    const businessDescription = document.getElementById('businessDescription').value;
    const businessUnique = document.getElementById('businessUnique').value;
    const businessWebsite = document.getElementById('businessWebsite').value;
    const businessEmail = document.getElementById('businessEmail').value;
    
    // Get logo and banner URLs if selected
    const logoInput = document.getElementById('businessLogo');
    const bannerInput = document.getElementById('businessBanner');
    
    const logoUrl = logoInput && logoInput.getAttribute('data-preview-url') ? 
        logoInput.getAttribute('data-preview-url') : '';
    
    const bannerUrl = bannerInput && bannerInput.getAttribute('data-preview-url') ? 
        bannerInput.getAttribute('data-preview-url') : '';
    
    // Create preview card
    previewContainer.innerHTML = `
        <div class="business-card">
            <div class="business-banner" style="${bannerUrl ? `background-image: url('${bannerUrl}')` : `background-color: var(--business-primary)`}">
                <span class="business-category ${businessCategory.toLowerCase().replace(/\s+/g, '-')}">${businessCategory}</span>
            </div>
            <div class="business-content">
                <h3 class="business-name">${businessName}</h3>
                <div class="business-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${businessProvince}</span>
                </div>
                <p class="business-description">${businessDescription}</p>
                <div class="business-unique">
                    <h4>What Makes Us Unique:</h4>
                    <p>${businessUnique}</p>
                </div>
                <div class="business-contact">
                    ${businessWebsite ? `
                        <a href="${businessWebsite}" class="business-website" target="_blank">
                            <i class="fas fa-globe"></i> Visit Website
                        </a>
                    ` : ''}
                    <a href="mailto:${businessEmail}" class="business-email">
                        <i class="fas fa-envelope"></i> Contact
                    </a>
                </div>
            </div>
        </div>
        <div class="preview-actions">
            <button type="button" class="btn btn-secondary" onclick="window.location.hash = 'create';">Edit Listing</button>
            <button type="button" class="btn btn-primary">Submit Listing</button>
        </div>
    `;
}

/**
 * Set up business listings functionality
 */
function setupBusinessListings() {
    // TODO: Implement once backend/API is available
    // For now, we'll use placeholder data
}

/**
 * Load business listings from API or fallback to sample data
 */
function loadBusinessListings() {
    const businessesGrid = document.getElementById('businessesGrid');
    if (!businessesGrid) return;
    
    // In a real implementation, this would fetch from an API
    // For now, use sample data
    const sampleBusinesses = getSampleBusinessData();
    
    // Render sample businesses
    renderBusinessListings(sampleBusinesses);
}

/**
 * Set up search and filter functionality
 */
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchBusinesses');
    const searchButton = document.getElementById('searchButton');
    const provinceFilter = document.getElementById('provinceFilter');
    const suburbFilter = document.getElementById('suburbFilter');
    
    // Search button click
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            filterBusinesses();
        });
        
        // Search input enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterBusinesses();
            }
        });
    }
    
    // Set up category filters
    setupCategoryFilters();
    
    // Set up suburb filter that changes based on province selection
    if (provinceFilter && suburbFilter) {
        // Initial suburb population
        populateSuburbsForProvince(provinceFilter.value);
        
        // Province filter change event
        provinceFilter.addEventListener('change', function() {
            populateSuburbsForProvince(this.value);
            filterBusinesses();
        });
        
        // Suburb filter change event
        suburbFilter.addEventListener('change', filterBusinesses);
    }
    
    // Load More button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreBusinesses();
        });
    }
}

/**
 * Set up category filter functionality
 */
function setupCategoryFilters() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            categoryItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Filter businesses
            filterBusinesses();
        });
    });
}

/**
 * Populate suburbs dropdown based on selected province
 */
function populateSuburbsForProvince(province) {
    const suburbFilter = document.getElementById('suburbFilter');
    if (!suburbFilter) return;
    
    // Store current selection if any
    const currentSelection = suburbFilter.value;
    
    // Clear current options except the first one
    while (suburbFilter.options.length > 1) {
        suburbFilter.remove(1);
    }
    
    // If "All Provinces" is selected, just leave the "All Suburbs" option
    if (province === 'all') {
        suburbFilter.value = 'all';
        return;
    }
    
    // Get suburbs for the selected province
    const suburbs = getSuburbsForProvince(province);
    
    // Add suburbs to dropdown
    suburbs.forEach(suburb => {
        const option = document.createElement('option');
        option.value = suburb;
        option.textContent = suburb;
        suburbFilter.appendChild(option);
    });
    
    // Try to restore previous selection if it exists in the new list
    if (currentSelection !== 'all' && suburbs.includes(currentSelection)) {
        suburbFilter.value = currentSelection;
    } else {
        suburbFilter.value = 'all';
    }
}

/**
 * Get suburbs for a specific province
 */
function getSuburbsForProvince(province) {
    // Define suburbs for each province
    const provinceSuburbs = {
        'Eastern Cape': ['East London', 'Port Elizabeth', 'Mthatha', 'Grahamstown', 'Uitenhage', 'Bhisho'],
        'Free State': ['Bloemfontein', 'Welkom', 'Bethlehem', 'Kroonstad', 'Sasolburg', 'Parys'],
        'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Midrand', 'Centurion', 'Randburg', 'Roodepoort'],
        'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle', 'Ballito', 'Umhlanga'],
        'Limpopo': ['Polokwane', 'Tzaneen', 'Mokopane', 'Thohoyandou', 'Lebowakgomo', 'Phalaborwa'],
        'Mpumalanga': ['Nelspruit', 'Witbank', 'Secunda', 'Middelburg', 'Ermelo', 'Barberton'],
        'Northern Cape': ['Kimberley', 'Upington', 'Springbok', 'De Aar', 'Kuruman', 'Kathu'],
        'North West': ['Rustenburg', 'Potchefstroom', 'Klerksdorp', 'Mahikeng', 'Brits', 'Vryburg'],
        'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Hermanus', 'Worcester', 'Knysna']
    };
    
    // Return suburbs for the selected province or an empty array if province not found
    return provinceSuburbs[province] || [];
}

/**
 * Filter businesses based on search term and filters
 */
function filterBusinesses() {
    const searchTerm = document.getElementById('searchBusinesses').value.toLowerCase();
    const activeCategory = document.querySelector('.category-item.active');
    const category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
    const province = document.getElementById('provinceFilter').value;
    const suburb = document.getElementById('suburbFilter').value;
    
    // In a real implementation, this could fetch from an API with filter params
    // For now, filter the sample data
    const sampleBusinesses = getSampleBusinessData();
    
    let filteredBusinesses = sampleBusinesses.filter(business => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
            business.name.toLowerCase().includes(searchTerm) || 
            business.description.toLowerCase().includes(searchTerm);
        
        // Filter by category
        const matchesCategory = category === 'all' || business.category === category;
        
        // Filter by province
        const matchesProvince = province === 'all' || business.province === province;
        
        // Filter by suburb
        const matchesSuburb = suburb === 'all' || 
            (business.suburb && business.suburb.toLowerCase() === suburb.toLowerCase());
        
        return matchesSearch && matchesCategory && matchesProvince && matchesSuburb;
    });
    
    // Sort the filtered businesses by name (default)
    filteredBusinesses.sort((a, b) => a.name.localeCompare(b.name));
    
    // Render the filtered businesses
    renderBusinessListings(filteredBusinesses);
    
    // Update load more button visibility
    updateLoadMoreButton(filteredBusinesses.length);
    
    // Apply animation to the selected category
    animateSelectedCategory();
}

/**
 * Apply animation to the selected category
 */
function animateSelectedCategory() {
    const activeCategory = document.querySelector('.category-item.active');
    if (!activeCategory) return;
    
    // Apply a pulse animation
    activeCategory.style.animation = 'none';
    setTimeout(() => {
        activeCategory.style.animation = 'pulse 0.6s';
    }, 10);
}

// Add a keyframes animation for the pulse effect
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}`;
document.head.appendChild(styleSheet);

/**
 * Sort businesses based on selected sort option
 */
function sortBusinesses(businesses, sortBy) {
    let sortedBusinesses = [...businesses];
    
    switch (sortBy) {
        case 'name-asc':
            sortedBusinesses.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedBusinesses.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Default sort (name ASC)
            sortedBusinesses.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return sortedBusinesses;
}

/**
 * Render business listings to the grid
 */
function renderBusinessListings(businesses) {
    const businessesGrid = document.getElementById('businessesGrid');
    if (!businessesGrid) return;
    
    businessesGrid.innerHTML = '';
    
    if (businesses.length === 0) {
        businessesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No businesses found</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        
        // Hide load more button when no results
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        
        return;
    }
    
    // Animate business cards appearing with staggered delay
    businesses.forEach((business, index) => {
        const businessCard = document.createElement('div');
        businessCard.className = 'business-card';
        
        // Add animation delay based on index
        businessCard.style.opacity = '0';
        businessCard.style.transform = 'translateY(20px)';
        businessCard.style.transition = 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
        
        // Map category names to their primary icon colors for business card banners
        const categoryColors = {
            'Agriculture': ['#4CAF50', '#388E3C'],
            'Technology': ['#03A9F4', '#0288D1'],
            'Creative Arts': ['#F44336', '#D32F2F'],
            'Health & Wellness': ['#E91E63', '#C2185B'],
            'Education': ['#9C27B0', '#7B1FA2'],
            'Food & Beverage': ['#FF9800', '#F57C00'],
            'Construction': ['#795548', '#5D4037'],
            'Transportation': ['#607D8B', '#455A64'],
            'Retail': ['#00BCD4', '#0097A7'],
            'Professional Services': ['#3F51B5', '#303F9F'],
            'Tourism & Hospitality': ['#FFCA28', '#FFA000'],
            'Manufacturing': ['#FF5722', '#E64A19'],
            'Mining': ['#8D6E63', '#6D4C41'],
            'Financial Services': ['#FFC107', '#FFA000'],
            'Beauty & Cosmetics': ['#F06292', '#EC407A'],
            'Media & Entertainment': ['#7E57C2', '#5E35B1'],
            'Home & Garden': ['#66BB6A', '#43A047'],
            'Other': ['#9E9E9E', '#757575']
        };
        
        // Get colors for gradient or use default green
        const colorPair = categoryColors[business.category] || ['#007a4d', '#009260'];
        
        // Use logo if available
        const logoHtml = business.logoImage ? 
            `<div class="business-logo"><img src="${business.logoImage}" alt="${business.name} logo"></div>` : '';
        
        // Use banner image or gradient based on category
        const bannerStyle = business.bannerImage ? 
            `background-image: url('${business.bannerImage}')` : 
            `background-image: linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`;
        
        // Create category badge
        const categorySlug = business.category.toLowerCase().replace(/\s+/g, '-');
        const categoryBadge = `<span class="business-category ${categorySlug}">${business.category}</span>`;
        
        // Format website URL for display
        const websiteDisplay = business.website ? business.website.replace(/^https?:\/\/(www\.)?/, '') : '';
        
        businessCard.innerHTML = `
            <div class="business-banner" style="${bannerStyle}">
                ${categoryBadge}
                ${logoHtml}
            </div>
            <div class="business-content">
                <h3 class="business-name">${business.name}</h3>
                <div class="business-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${business.province}</span>
                </div>
                <p class="business-description">${business.description}</p>
                <div class="business-unique">
                    <h4>What Makes Us Unique:</h4>
                    <p>${business.uniqueValue}</p>
                </div>
                <div class="business-contact">
                    ${business.website ? `
                        <a href="${business.website}" class="business-website" target="_blank" rel="noopener">
                            <i class="fas fa-globe"></i> Website
                        </a>
                    ` : ''}
                    <a href="mailto:${business.email}" class="business-email">
                        <i class="fas fa-envelope"></i> Contact
                    </a>
                </div>
            </div>
        `;
        
        businessesGrid.appendChild(businessCard);
        
        // Trigger animation with staggered delay
        setTimeout(() => {
            businessCard.style.opacity = '1';
            businessCard.style.transform = 'translateY(0)';
        }, 100 * index); // Stagger the animations
    });
    
    // Update load more button
    updateLoadMoreButton(businesses.length);
}

/**
 * Update load more button visibility based on results
 */
function updateLoadMoreButton(resultsCount) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    // In a real implementation, this would check if there are more results to load
    // For demo purposes, hide the button if there are less than 6 results
    if (resultsCount < 6) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

/**
 * Load more businesses (pagination simulation)
 */
function loadMoreBusinesses() {
    // In a real implementation, this would load the next page of results
    // For demo purposes, we'll just add more sample data
    const businessesGrid = document.getElementById('businessesGrid');
    if (!businessesGrid) return;
    
    // Show loading state on button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loadMoreBtn.disabled = true;
    }
    
    // Simulate server delay
    setTimeout(() => {
        const sampleBusinesses = getSampleBusinessData();
        let additionalBusinesses = sampleBusinesses.slice(0, 3); // Add 3 more
        
        // Modify names to make them different
        additionalBusinesses = additionalBusinesses.map(business => {
            return {
                ...business,
                name: business.name + ' Plus',
                uniqueValue: 'Additional listing: ' + business.uniqueValue
            };
        });
        
        // Get current business count
        const currentCount = businessesGrid.querySelectorAll('.business-card').length;
        
        // Append to grid with animations
        additionalBusinesses.forEach((business, index) => {
            const businessCard = document.createElement('div');
            businessCard.className = 'business-card';
            
            // Map category names to their primary icon colors for business card banners
            const categoryColors = {
                'Agriculture': ['#4CAF50', '#388E3C'],
                'Technology': ['#03A9F4', '#0288D1'],
                'Creative Arts': ['#F44336', '#D32F2F'],
                'Health & Wellness': ['#E91E63', '#C2185B'],
                'Education': ['#9C27B0', '#7B1FA2'],
                'Food & Beverage': ['#FF9800', '#F57C00'],
                'Construction': ['#795548', '#5D4037'],
                'Transportation': ['#607D8B', '#455A64'],
                'Retail': ['#00BCD4', '#0097A7'],
                'Professional Services': ['#3F51B5', '#303F9F'],
                'Tourism & Hospitality': ['#FFCA28', '#FFA000'],
                'Manufacturing': ['#FF5722', '#E64A19'],
                'Mining': ['#8D6E63', '#6D4C41'],
                'Financial Services': ['#FFC107', '#FFA000'],
                'Beauty & Cosmetics': ['#F06292', '#EC407A'],
                'Media & Entertainment': ['#7E57C2', '#5E35B1'],
                'Home & Garden': ['#66BB6A', '#43A047'],
                'Other': ['#9E9E9E', '#757575']
            };
            
            // Get colors for gradient or use default green
            const colorPair = categoryColors[business.category] || ['#007a4d', '#009260'];
            
            // Use banner image or gradient based on category
            const bannerStyle = business.bannerImage ? 
                `background-image: url('${business.bannerImage}')` : 
                `background-image: linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`;
            
            // Create category badge
            const categorySlug = business.category.toLowerCase().replace(/\s+/g, '-');
            const categoryBadge = `<span class="business-category ${categorySlug}">${business.category}</span>`;
            
            // Add animation
            businessCard.style.opacity = '0';
            businessCard.style.transform = 'translateY(20px)';
            businessCard.style.transition = 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
            
            businessCard.innerHTML = `
                <div class="business-banner" style="${bannerStyle}">
                    ${categoryBadge}
                </div>
                <div class="business-content">
                    <h3 class="business-name">${business.name}</h3>
                    <div class="business-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${business.province}</span>
                    </div>
                    <p class="business-description">${business.description}</p>
                    <div class="business-unique">
                        <h4>What Makes Us Unique:</h4>
                        <p>${business.uniqueValue}</p>
                    </div>
                    <div class="business-contact">
                        ${business.website ? `
                            <a href="${business.website}" class="business-website" target="_blank" rel="noopener">
                                <i class="fas fa-globe"></i> Website
                            </a>
                        ` : ''}
                        <a href="mailto:${business.email}" class="business-email">
                            <i class="fas fa-envelope"></i> Contact
                        </a>
                    </div>
                </div>
            `;
            
            businessesGrid.appendChild(businessCard);
            
            // Trigger animation with staggered delay
            setTimeout(() => {
                businessCard.style.opacity = '1';
                businessCard.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        
        // Reset load more button
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = 'Load More';
            loadMoreBtn.disabled = false;
            
            // Hide load more button after loading all demo data
            if (currentCount + additionalBusinesses.length >= 9) {
                loadMoreBtn.style.display = 'none';
            }
        }
    }, 800); // Simulate server delay of 800ms
}

/**
 * Get sample business data for demonstration
 */
function getSampleBusinessData() {
    return [
        {
            name: "Green Harvest Farms",
            category: "Agriculture",
            province: "Western Cape",
            suburb: "Stellenbosch",
            description: "We are a sustainable farming operation focusing on organic vegetables and fruits that are sold to local markets and restaurants.",
            uniqueValue: "We use regenerative agricultural practices that improve soil health and biodiversity while producing nutrient-dense food.",
            email: "info@greenharvestfarms.co.za",
            website: "https://www.greenharvestfarms.co.za",
            color: "#8BC34A" // Light green
        },
        {
            name: "TechSolutions SA",
            category: "Technology",
            province: "Gauteng",
            suburb: "Sandton",
            description: "We provide affordable IT services and digital solutions to small businesses and nonprofits across South Africa.",
            uniqueValue: "We offer discounted services to community organizations and provide free digital literacy workshops in underserved areas.",
            email: "support@techsolutionssa.co.za",
            website: "https://www.techsolutionssa.co.za",
            color: "#2196F3" // Blue
        },
        {
            name: "Creative Canvas Studio",
            category: "Creative Arts",
            province: "KwaZulu-Natal",
            suburb: "Umhlanga",
            description: "A collective of artists creating contemporary African art, crafts, and digital design services that celebrate South African culture.",
            uniqueValue: "We collaborate with traditional artisans to create modern pieces that preserve cultural heritage while providing sustainable income to rural communities.",
            email: "create@creativecanvasstudio.co.za",
            website: "https://www.creativecanvasstudio.co.za",
            color: "#F44336" // Red
        },
        {
            name: "Wellness Roots",
            category: "Health & Wellness",
            province: "Eastern Cape",
            suburb: "East London",
            description: "We offer traditional and modern wellness services, including herbal remedies, nutrition counseling, and holistic health programs.",
            uniqueValue: "We integrate indigenous knowledge with modern health science, creating accessible healthcare options that honor South African healing traditions.",
            email: "care@wellnessroots.co.za",
            website: "",
            color: "#E91E63" // Pink
        },
        {
            name: "Future Leaders Academy",
            category: "Education",
            province: "Free State",
            suburb: "Bloemfontein",
            description: "An after-school education center providing supplementary learning, coding classes, and leadership development for youth aged 8-18.",
            uniqueValue: "Our curriculum emphasizes practical skills, ethical leadership, and social entrepreneurship to prepare young South Africans to address community challenges.",
            email: "learn@futureleadersacademy.co.za",
            website: "https://www.futureleadersacademy.co.za",
            color: "#9C27B0" // Purple
        },
        {
            name: "Flavor Fusion Café",
            category: "Food & Beverage",
            province: "Gauteng",
            suburb: "Johannesburg",
            description: "A local café serving South African fusion cuisine with ingredients sourced from small-scale farmers and food producers.",
            uniqueValue: "We create employment opportunities for youth from disadvantaged backgrounds through our culinary apprenticeship program.",
            email: "hello@flavorfusioncafe.co.za",
            website: "https://www.flavorfusioncafe.co.za",
            color: "#FF9800" // Orange
        }
    ];
}

/**
 * Animate the total businesses counter
 */
function animateTotalBusinesses() {
    const totalBusinessesEl = document.getElementById('totalBusinesses');
    if (!totalBusinessesEl) return;
    
    const finalCount = parseInt(totalBusinessesEl.textContent);
    let startCount = 0;
    const duration = 2000; // 2 seconds
    const interval = 20; // Update every 20ms
    const steps = duration / interval;
    const increment = finalCount / steps;
    
    // Reset the display to 0
    totalBusinessesEl.textContent = '0';
    
    const counter = setInterval(function() {
        startCount += increment;
        if (startCount >= finalCount) {
            totalBusinessesEl.textContent = finalCount;
            clearInterval(counter);
        } else {
            totalBusinessesEl.textContent = Math.floor(startCount);
        }
    }, interval);
} 