/**
 * Enhanced corruption tracker sorting and filtering functionality
 */

function initializeCorruptionTracker() {
    const searchInput = document.getElementById('case-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const caseCountElement = document.getElementById('case-count');
    const totalCasesElement = document.getElementById('total-cases');
    const casesContainer = document.querySelector('.corruption-cases');
    
    // Set initial counts
    const corruptionCases = document.querySelectorAll('.corruption-case');
    totalCasesElement.textContent = corruptionCases.length;
    caseCountElement.textContent = corruptionCases.length;
    
    // Filter button click handlers
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply filters and update display
            applyFilters();
        });
    });
    
    // Search input handler
    searchInput.addEventListener('input', function() {
        applyFilters();
    });
    
    // Sort select handler
    sortSelect.addEventListener('change', function() {
        applyFilters();
    });
    
    // Apply filters and sorting function
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const sortOption = sortSelect.value;
        
        // Get fresh collection of cases
        const casesArray = Array.from(document.querySelectorAll('.corruption-case'));
        
        // Keep track of visible cases
        let visibleCount = 0;
        
        // First apply filters (show/hide)
        casesArray.forEach(caseElement => {
            const caseText = caseElement.textContent.toLowerCase();
            const hasSearchTerm = searchTerm === '' || caseText.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || caseElement.classList.contains(activeFilter);
            
            if (hasSearchTerm && matchesFilter) {
                caseElement.style.display = 'block';
                visibleCount++;
            } else {
                caseElement.style.display = 'none';
            }
        });
        
        // Update case count
        caseCountElement.textContent = visibleCount;
        
        // Then sort the visible cases
        const sortedCases = casesArray.slice().sort((a, b) => {
            if (sortOption === 'newest') {
                const dateA = getDateFromCase(a);
                const dateB = getDateFromCase(b);
                return dateB - dateA; // Newest first
            } else if (sortOption === 'oldest') {
                const dateA = getDateFromCase(a);
                const dateB = getDateFromCase(b);
                return dateA - dateB; // Oldest first
            } else if (sortOption === 'amount-high' || sortOption === 'amount-low') {
                const amountA = getAmountFromCase(a);
                const amountB = getAmountFromCase(b);
                return sortOption === 'amount-high' ? amountB - amountA : amountA - amountB;
            } else if (sortOption === 'alphabetical') {
                const titleA = a.querySelector('.case-title').textContent.toLowerCase();
                const titleB = b.querySelector('.case-title').textContent.toLowerCase();
                return titleA.localeCompare(titleB);
            }
            return 0;
        });
        
        // Detach all cases
        const tempCases = [];
        casesArray.forEach(caseElement => {
            tempCases.push(caseElement);
            if (caseElement.parentNode) {
                caseElement.parentNode.removeChild(caseElement);
            }
        });
        
        // Reattach in sorted order
        sortedCases.forEach(caseElement => {
            casesContainer.appendChild(caseElement);
        });
    }
    
    // Helper function to extract date from case element
    function getDateFromCase(caseElement) {
        const dateEl = caseElement.querySelector('.case-meta-item i.fa-calendar-alt');
        if (!dateEl || !dateEl.nextElementSibling) return new Date(0);
        
        const dateText = dateEl.nextElementSibling.textContent;
        
        // Extract date in format: "Reported: January 15, 2025" or "Resolved: December 5, 2024"
        const dateMatch = dateText.match(/:\s(.+)$/);
        if (dateMatch && dateMatch[1]) {
            const dateStr = dateMatch[1];
            
            // Parse date components manually for more consistent results
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            
            // Match components like: Month Day, Year (e.g., "April 1, 2025")
            const components = dateStr.match(/([A-Za-z]+)\s+(\d+),?\s+(\d{4})/);
            
            if (components) {
                const month = monthNames.indexOf(components[1]);
                const day = parseInt(components[2], 10);
                const year = parseInt(components[3], 10);
                
                if (month !== -1 && !isNaN(day) && !isNaN(year)) {
                    return new Date(year, month, day);
                }
            }
            
            // Fallback to standard Date constructor
            return new Date(dateStr);
        }
        
        return new Date(0); // Default to epoch if date not found
    }
    
    // Helper function to extract amount from case element
    function getAmountFromCase(caseElement) {
        const amountElement = caseElement.querySelector('.case-amount');
        if (!amountElement) return 0;
        
        const amountText = amountElement.textContent;
        
        // Handle different amount formats
        if (amountText.includes('Billion')) {
            const match = amountText.match(/(\d+\.?\d*)\s*Billion/i);
            return match ? parseFloat(match[1]) * 1000000000 : 0;
        } else if (amountText.includes('Million')) {
            const match = amountText.match(/(\d+\.?\d*)\s*Million/i);
            return match ? parseFloat(match[1]) * 1000000 : 0;
        } else if (amountText.match(/^R\d+/)) {
            // Handle Rand amounts
            const match = amountText.match(/R(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 0;
        } else if (amountText.match(/^\$\d+/)) {
            // Handle Dollar amounts
            const match = amountText.match(/\$(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 0;
        }
        
        return 0; // Default for unknown/unspecified amounts
    }
    
    // Initial filter application
    applyFilters();
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeCorruptionTracker();
}); 