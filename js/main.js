/**
 * AccountabilitySA Basic System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all page components
    initPage();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize newsletter form
    initNewsletterForm();
    
    // Update days active
    calculateDaysActive();
    
    // Check if auth scripts are loaded, if not load them dynamically
    ensureAuthScriptsLoaded();
});

/**
 * Initialize all page components based on current page
 */
function initPage() {
    // Detect current page
    const pathname = window.location.pathname.toLowerCase();
    const currentPage = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    // Initialize page-specific components
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'index') {
        console.log('Initializing Home Page');
        
        // Initialize counters animation for metrics
        const metricNumbers = document.querySelectorAll('.metric-number');
        if (metricNumbers.length > 0) {
            animateCounters(metricNumbers);
        }
    }
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuIcon && mainNav) {
        mobileMenuIcon.addEventListener('click', function() {
            mainNav.classList.toggle('show');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }
}

/**
 * Initialize newsletter form
 */
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                // Here you would typically send this to a server
                // For now, we'll just show a simple alert
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Capitalize first letter of a string
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to animate the counters
function animateCounters(elements) {
    elements.forEach(counter => {
        const target = parseFloat(counter.textContent.replace(/[^\d.-]/g, ''));
        const prefix = counter.textContent.match(/^[^\d]*/)[0] || '';
        const suffix = counter.textContent.match(/[^\d]*$/)[0] || '';
        const isDecimal = counter.textContent.includes('.');
        const decimalPlaces = isDecimal ? 
            counter.textContent.split('.')[1].replace(/[^\d]/g, '').length : 0;
        
        let count = 0;
        const duration = 2000; // 2 seconds
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);
        const increment = target / totalFrames;
        
        const animate = () => {
            count += increment;
            if (count < target) {
                counter.textContent = prefix + formatNumber(count, decimalPlaces) + suffix;
                requestAnimationFrame(animate);
            } else {
                counter.textContent = prefix + formatNumber(target, decimalPlaces) + suffix;
            }
        };
        
        animate();
    });
}

// Helper function to format numbers
function formatNumber(number, decimalPlaces) {
    return number.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Helper function to animate counter
function animateCounter(element, start, end) {
    const duration = 1000; // 1 second
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    const increment = (end - start) / totalFrames;
    
    let currentFrame = 0;
    let currentValue = start;
    
    const animate = () => {
        currentFrame++;
        currentValue += increment;
        
        if (currentFrame <= totalFrames) {
            element.textContent = Math.floor(currentValue).toLocaleString();
            requestAnimationFrame(animate);
        } else {
            element.textContent = end.toLocaleString();
        }
    };
    
    animate();
}

// Budget News Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load Budget News from API or fallback to local content
    loadBudgetNewsFromAPI();
    
    // Budget News filtering
    setupBudgetNewsFilters();
    
    // Budget News search functionality
    setupBudgetNewsSearch();
    
    // Budget News subscription form
    setupBudgetNewsSubscription();
    
    // Budget News pagination
    setupBudgetNewsPagination();
});

// Function to load budget news from API
function loadBudgetNewsFromAPI() {
    const newsContainer = document.querySelector('.budget-news-grid');
    if (!newsContainer) return;
    
    // API endpoint (this would be your actual API endpoint)
    const apiUrl = 'https://api.accountability-sa.co.za/budget-news';
    
    // Show loading state
    showBudgetNewsLoadingState(newsContainer);
    
    // Attempt to fetch news from API
    fetch(apiUrl)
        .then(response => {
            // Check if response is ok (status in the range 200-299)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Process the API data and render news cards
            renderBudgetNewsFromAPI(data, newsContainer);
        })
        .catch(error => {
            console.log('Error fetching budget news:', error);
            // If API fails, we already have local content as fallback
            // Remove loading state
            const loadingElement = document.querySelector('.budget-news-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
        });
}

// Function to show loading state while fetching news
function showBudgetNewsLoadingState(container) {
    // Create loading element
    const loadingElement = document.createElement('div');
    loadingElement.className = 'budget-news-loading';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading latest budget news...</p>
    `;
    
    // Style the loading element
    Object.assign(loadingElement.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        color: 'var(--primary-color)',
        fontSize: '1.2rem',
        width: '100%',
        textAlign: 'center'
    });
    
    // Insert before the container to not interfere with existing cards
    container.parentNode.insertBefore(loadingElement, container);
}

// Function to render news cards from API data
function renderBudgetNewsFromAPI(data, container) {
    // Remove loading state
    const loadingElement = document.querySelector('.budget-news-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // If API returns no data, use existing local content
    if (!data || !data.articles || data.articles.length === 0) {
        console.log('No news data returned from API, using local content');
        return;
    }
    
    // Clear existing news cards to replace with API data
    container.innerHTML = '';
    
    // Render each news article
    data.articles.forEach(article => {
        const newsCard = document.createElement('div');
        newsCard.className = 'budget-news-card';
        newsCard.dataset.category = article.categories.join(' ');
        
        newsCard.innerHTML = `
            <div class="news-card-header">
                <span class="news-date"><i class="far fa-calendar-alt"></i> ${formatNewsDate(article.publishedDate)}</span>
                <span class="news-source">${article.source}</span>
            </div>
            <div class="news-card-body">
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <div class="news-tags">
                    ${article.categories.map(category => 
                        `<span class="news-tag">${formatCategoryName(category)}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="news-card-footer">
                <a href="${article.url}" target="_blank" class="read-more-btn">Read Full Article <i class="fas fa-arrow-right"></i></a>
                <div class="news-share">
                    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}" 
                       target="_blank" title="Share on Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}" 
                       target="_blank" title="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}" 
                       target="_blank" title="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        `;
        
        container.appendChild(newsCard);
    });
    
    // Update pagination for the new content
    updateBudgetNewsPagination(data.totalPages || 4);
    
    // Initialize the first page
    const firstPageButton = document.querySelector('.page-number');
    if (firstPageButton) {
        firstPageButton.click();
    }
}

// Helper function to format the news date
function formatNewsDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', options);
}

// Helper function to format category name for display
function formatCategoryName(category) {
    switch(category) {
        case 'policy':
            return 'Policy Changes';
        case 'allocations':
            return 'Budget Allocations';
        case 'spending':
            return 'Spending Reviews';
        case 'analysis':
            return 'Expert Analysis';
        default:
            return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Function to update pagination based on API data
function updateBudgetNewsPagination(totalPages) {
    const paginationNumbers = document.querySelector('.pagination-numbers');
    if (!paginationNumbers) return;
    
    // Clear existing page numbers
    paginationNumbers.innerHTML = '';
    
    // Add new page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = i === 1 ? 'page-number active' : 'page-number';
        pageButton.textContent = i;
        paginationNumbers.appendChild(pageButton);
    }
    
    // Reinitialize pagination
    setupBudgetNewsPagination();
}

// Function to handle budget news filtering
function setupBudgetNewsFilters() {
    const filterButtons = document.querySelectorAll('.news-filter-btn');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                filterBudgetNews(filter, document.getElementById('news-search-input')?.value || '');
            });
        });
    }
}

// Function to handle budget news search
function setupBudgetNewsSearch() {
    const searchInput = document.getElementById('news-search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const activeFilter = document.querySelector('.news-filter-btn.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';
            filterBudgetNews(filter, this.value);
        });
    }
}

// Function to filter budget news based on category and search term
function filterBudgetNews(category, searchTerm) {
    const newsCards = document.querySelectorAll('.budget-news-card');
    let visibleCount = 0;
    
    searchTerm = searchTerm.toLowerCase().trim();
    
    newsCards.forEach(card => {
        const categories = card.dataset.category?.split(' ') || [];
        const cardContent = card.textContent.toLowerCase();
        
        // Check if card matches the category filter
        const matchesCategory = (category === 'all') || categories.includes(category);
        
        // Check if card matches the search term
        const matchesSearch = !searchTerm || cardContent.includes(searchTerm);
        
        // Show or hide the card
        if (matchesCategory && matchesSearch) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update the empty state message if no results
    updateEmptyBudgetNewsState(visibleCount);
    
    return visibleCount;
}

// Function to display empty state message when no news matches filters
function updateEmptyBudgetNewsState(visibleCount) {
    let emptyState = document.querySelector('.budget-news-empty-state');
    
    if (visibleCount === 0) {
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'budget-news-empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <i class="fas fa-newspaper"></i>
                    <h3>No matching news articles found</h3>
                    <p>Try adjusting your search criteria or filter selection</p>
                    <button class="reset-filters-btn">Reset Filters</button>
                </div>
            `;
            
            const newsGrid = document.querySelector('.budget-news-grid');
            if (newsGrid) {
                newsGrid.after(emptyState);
                
                // Add event listener to reset button
                emptyState.querySelector('.reset-filters-btn').addEventListener('click', function() {
                    // Reset the filter buttons
                    const allFilter = document.querySelector('.news-filter-btn[data-filter="all"]');
                    if (allFilter) {
                        allFilter.click();
                    }
                    
                    // Clear the search input
                    const searchInput = document.getElementById('news-search-input');
                    if (searchInput) {
                        searchInput.value = '';
                        // Trigger the input event to update the results
                        searchInput.dispatchEvent(new Event('input'));
                    }
                });
            }
        }
        
        emptyState.style.display = 'block';
    } else if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Function to handle budget news subscription
function setupBudgetNewsSubscription() {
    const subscriptionForm = document.querySelector('.news-subscribe-form');
    
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // Here you would typically send this to a server
                // For demonstration, show a success message
                
                // Create a success message element if it doesn't exist
                let successMessage = document.querySelector('.subscription-success');
                
                if (!successMessage) {
                    successMessage = document.createElement('div');
                    successMessage.className = 'subscription-success';
                    successMessage.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <p>Thank you for subscribing to budget news updates!</p>
                    `;
                    
                    // Style the success message
                    successMessage.style.display = 'flex';
                    successMessage.style.alignItems = 'center';
                    successMessage.style.gap = '0.5rem';
                    successMessage.style.marginTop = '1rem';
                    successMessage.style.padding = '0.8rem 1.2rem';
                    successMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    successMessage.style.borderRadius = 'var(--border-radius)';
                    successMessage.style.color = 'var(--primary-color)';
                    
                    successMessage.querySelector('i').style.color = 'var(--primary-color)';
                    successMessage.querySelector('i').style.fontSize = '1.2rem';
                    
                    this.after(successMessage);
                } else {
                    successMessage.style.display = 'flex';
                }
                
                // Clear the input
                emailInput.value = '';
                
                // Hide the success message after a few seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 4000);
            }
        });
    }
}

// Function to handle pagination
function setupBudgetNewsPagination() {
    const paginationButtons = document.querySelectorAll('.page-number');
    const prevButton = document.querySelector('.pagination-btn:first-child');
    const nextButton = document.querySelector('.pagination-btn:last-child');
    
    if (paginationButtons.length > 0) {
        paginationButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all pagination buttons
                paginationButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get the page number
                const page = parseInt(this.textContent);
                
                // Update pagination state
                updatePaginationState(page, paginationButtons.length);
                
                // Load the page content (for demonstration, we'll just hide/show the existing cards)
                loadBudgetNewsPage(page);
            });
        });
        
        // Previous button functionality
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (!this.disabled) {
                    const activePage = document.querySelector('.page-number.active');
                    const currentPage = parseInt(activePage.textContent);
                    
                    if (currentPage > 1) {
                        paginationButtons[currentPage - 2].click();
                    }
                }
            });
        }
        
        // Next button functionality
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                if (!this.disabled) {
                    const activePage = document.querySelector('.page-number.active');
                    const currentPage = parseInt(activePage.textContent);
                    const totalPages = paginationButtons.length;
                    
                    if (currentPage < totalPages) {
                        paginationButtons[currentPage].click();
                    }
                }
            });
        }
        
        // Initialize pagination
        updatePaginationState(1, paginationButtons.length);
        loadBudgetNewsPage(1);
    }
}

// Function to update pagination state
function updatePaginationState(currentPage, totalPages) {
    const prevButton = document.querySelector('.pagination-btn:first-child');
    const nextButton = document.querySelector('.pagination-btn:last-child');
    
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
    }
}

// Function to load budget news page (pagination simulation)
function loadBudgetNewsPage(page) {
    const newsCards = document.querySelectorAll('.budget-news-card');
    const cardsPerPage = 6; // Show 6 cards per page
    
    if (newsCards.length > 0) {
        // Calculate start and end indices
        const startIndex = (page - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage - 1;
        
        // Hide all cards first
        newsCards.forEach((card, index) => {
            if (index >= startIndex && index <= endIndex) {
                card.style.display = 'flex'; // Show cards for current page
            } else {
                card.style.display = 'none'; // Hide cards for other pages
            }
        });
        
        // Scroll to the top of the news section
        const newsSection = document.querySelector('.budget-news');
        if (newsSection) {
            newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Function to handle corruption case filter
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('case-search');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                filterCorruptionCases(filter, searchInput ? searchInput.value : '');
            });
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.dataset.filter : 'all';
            filterCorruptionCases(filter, this.value);
        });
    }
});

// Function to filter corruption cases
function filterCorruptionCases(category, searchTerm) {
    const cases = document.querySelectorAll('.corruption-case');
    
    cases.forEach(caseItem => {
        let matchesCategory = (category === 'all') || caseItem.classList.contains(category);
        
        let matchesSearch = true;
        if (searchTerm) {
            const caseText = caseItem.textContent.toLowerCase();
            matchesSearch = caseText.includes(searchTerm.toLowerCase());
        }
        
        if (matchesCategory && matchesSearch) {
            caseItem.style.display = 'block';
        } else {
            caseItem.style.display = 'none';
        }
    });
    
    // Update count of visible cases
    updateVisibleCaseCount();
}

// Function to update visible case count
function updateVisibleCaseCount() {
    const visibleCases = document.querySelectorAll('.corruption-case[style="display: block"]').length;
    const countElement = document.getElementById('case-count');
    
    if (countElement) {
        countElement.textContent = visibleCases;
    }
}

// Function to handle department search and filter
document.addEventListener('DOMContentLoaded', function() {
    const departmentSearch = document.getElementById('department-search');
    
    if (departmentSearch) {
        departmentSearch.addEventListener('input', function() {
            filterDepartments(this.value);
        });
    }
});

// Function to filter departments
function filterDepartments(searchTerm) {
    const departments = document.querySelectorAll('.department-card');
    
    departments.forEach(dept => {
        if (!searchTerm) {
            dept.style.display = 'block';
            return;
        }
        
        const deptName = dept.querySelector('h3').textContent.toLowerCase();
        
        if (deptName.includes(searchTerm.toLowerCase())) {
            dept.style.display = 'block';
        } else {
            dept.style.display = 'none';
        }
    });
}

// Budget visualization functionality
document.addEventListener('DOMContentLoaded', function() {
    const budgetCharts = document.querySelectorAll('.budget-chart');
    
    if (budgetCharts.length > 0) {
        budgetCharts.forEach(chart => {
            const canvas = chart.querySelector('canvas');
            if (canvas) {
                renderBudgetChart(canvas);
            }
        });
    }
});

// Function to render budget charts (placeholder - would use a real chart library in production)
function renderBudgetChart(canvas) {
    // This is just a placeholder
    // In a real app, you would use Chart.js or D3.js to render actual charts
    const ctx = canvas.getContext('2d');
    
    // Mock data setup
    const data = [15, 25, 20, 30, 10];
    const labels = ['Education', 'Health', 'Infrastructure', 'Security', 'Other'];
    const colors = [
        'rgba(0, 122, 77, 0.8)',
        'rgba(0, 35, 149, 0.8)',
        'rgba(255, 182, 18, 0.8)',
        'rgba(222, 56, 49, 0.8)',
        'rgba(100, 100, 100, 0.8)'
    ];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple bar chart
    const barWidth = (canvas.width - 40) / data.length;
    const maxValue = Math.max(...data);
    const scaleFactor = (canvas.height - 60) / maxValue;
    
    // Draw bars
    for (let i = 0; i < data.length; i++) {
        const barHeight = data[i] * scaleFactor;
        const x = 20 + i * barWidth;
        const y = canvas.height - 40 - barHeight;
        
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + (barWidth - 10) / 2, canvas.height - 25);
        
        // Draw value
        ctx.fillText(data[i] + '%', x + (barWidth - 10) / 2, y - 5);
    }
}

// Calculate days active (for organization founding days)
function calculateDaysActive() {
    const daysActiveElement = document.getElementById('days-active');
    if (!daysActiveElement) return;
    
    // Example founding date: January 1, 2022
    const foundingDate = new Date('2022-01-01');
    const currentDate = new Date();
    
    // Calculate the difference in days
    const diffTime = Math.abs(currentDate - foundingDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    daysActiveElement.textContent = diffDays.toLocaleString();
}

/**
 * Ensure auth scripts are loaded and initialize profile
 */
function ensureAuthScriptsLoaded() {
    // Check if AuthService is available
    if (typeof AuthService === 'undefined') {
        console.log('Auth scripts not detected, loading dynamically');
        
        // Load auth.js
        const authScript = document.createElement('script');
        authScript.src = 'js/auth.js';
        authScript.onload = function() {
            console.log('Auth script loaded dynamically');
            
            // Load header.js after auth.js
            const headerScript = document.createElement('script');
            headerScript.src = 'js/header.js';
            headerScript.onload = function() {
                console.log('Header script loaded dynamically');
                
                // Load profile-utils.js after header.js
                const profileScript = document.createElement('script');
                profileScript.src = 'js/profile-utils.js';
                profileScript.onload = function() {
                    console.log('Profile utils loaded dynamically');
                    
                    // Initialize profile images
                    if (typeof ProfileUtils !== 'undefined') {
                        ProfileUtils.initProfileImages();
                    }
                };
                document.head.appendChild(profileScript);
            };
            document.head.appendChild(headerScript);
        };
        document.head.appendChild(authScript);
    } else {
        console.log('Auth scripts already loaded');
        
        // Initialize profile images if ProfileUtils is available
        if (typeof ProfileUtils !== 'undefined') {
            ProfileUtils.initProfileImages();
        } else if (typeof AuthService !== 'undefined') {
            // If just AuthService is available, update auth UI
            AuthService.updateAuthUI();
        }
    }
} 