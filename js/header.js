/**
 * Accountability SA - Header Module
 * Manages the header UI across all pages, including user authentication state
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Header script loaded');
    initializeHeader();
    setupMobileMenu();
});

function setupMobileMenu() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuIcon && mainNav) {
        mobileMenuIcon.addEventListener('click', function() {
            mainNav.classList.toggle('show-mobile');
            mobileMenuIcon.classList.toggle('active');
        });
    }
}

function initializeHeader() {
    // First check if AuthService is available
    if (typeof AuthService === 'undefined') {
        console.error('AuthService not available. Loading auth.js dynamically.');
        
        // Dynamically load auth.js if not already loaded
        const authScript = document.createElement('script');
        authScript.src = 'js/auth.js';
        authScript.onload = function() {
            console.log('AuthService loaded dynamically');
            updateHeaderUI();
        };
        document.head.appendChild(authScript);
    } else {
        console.log('AuthService already available');
        updateHeaderUI();
    }
}

function updateHeaderUI() {
    // Get current authentication state
    const isLoggedIn = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    
    console.log('Authentication state:', { isLoggedIn, currentUser });
    
    // Update the account navigation item
    const accountNavItems = document.querySelectorAll('.account-nav-item');
    
    if (accountNavItems.length === 0) {
        console.warn('No account navigation items found in the page');
        return;
    }
    
    accountNavItems.forEach(item => {
        if (isLoggedIn && currentUser) {
            console.log('Updating UI for logged in user:', currentUser.name);
            
            // Ensure avatar path is correct
            const avatarPath = currentUser.avatar || 'images/avatars/default.jpg';
            console.log('Using avatar:', avatarPath);
            
            // Show user profile with dropdown
            item.innerHTML = `
                <a href="#" class="account-dropdown-toggle">
                    <img src="${avatarPath}" alt="${currentUser.name}" width="24" height="24" style="border-radius: 50%; margin-right: 5px; object-fit: cover;">
                    ${currentUser.name.split(' ')[0]}
                    <i class="fas fa-chevron-down"></i>
                </a>
                <div class="account-dropdown">
                    <div class="account-dropdown-header">
                        <div class="user-info">
                            <h4>${currentUser.name}</h4>
                            <p>${currentUser.email}</p>
                        </div>
                    </div>
                    <div class="account-dropdown-links">
                        <a href="account.html"><i class="fas fa-user-circle"></i> My Account</a>
                        <a href="account.html?tab=contributions"><i class="fas fa-file-signature"></i> My Contributions</a>
                        <a href="account.html?tab=settings"><i class="fas fa-cog"></i> Settings</a>
                        <a href="#" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
                    </div>
                </div>
            `;
            
            // Add click event for dropdown toggle
            const toggle = item.querySelector('.account-dropdown-toggle');
            const dropdown = item.querySelector('.account-dropdown');
            
            if (toggle && dropdown) {
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('show');
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function(e) {
                    if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.remove('show');
                    }
                });
            }
            
            // Add logout event
            const logoutLink = item.querySelector('.logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Logout clicked');
                    if (typeof accountabilityLogout === 'function') {
                        accountabilityLogout();
                    } else if (typeof AuthService.logout === 'function') {
                        AuthService.logout();
                        window.location.href = 'index.html';
                    }
                });
            }
        } else {
            // Show login link for logged out users
            item.innerHTML = '<a href="login.html"><i class="fas fa-user-circle"></i> <span class="login-text">Login</span></a>';
        }
    });
    
    // Mark active nav item based on current page
    markActiveNavItem();
}

function markActiveNavItem() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
} 