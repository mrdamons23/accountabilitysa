/**
 * Accountability SA - Authentication Module
 * Handles user authentication, registration, and session management
 */

// Constants
const AUTH_TOKEN_KEY = 'accountabilitySAToken';
const USER_DATA_KEY = 'accountabilitySAUser';
const SESSION_USER_DATA_KEY = 'accountabilitySAUser';
const REGISTERED_USERS_KEY = 'accountabilitySARegisteredUsers';

// Auth service class
class AuthService {
    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    static isAuthenticated() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        // Also check sessionStorage in case session-only login was used
        const sessionUser = sessionStorage.getItem(SESSION_USER_DATA_KEY);
        return !!token || !!sessionUser;
    }

    /**
     * Get current user information
     * @returns {Object|null} User object or null if not logged in
     */
    static getCurrentUser() {
        // Try to get user data from localStorage (persistent) or sessionStorage (temporary)
        const userData = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(SESSION_USER_DATA_KEY);
        if (!userData) return null;
        
        try {
            const user = JSON.parse(userData);
            
            // Handle avatar data from both potential sources
            if (!user.avatar && user.avatarData) {
                // If avatar is missing but avatarData exists, use avatarData
                user.avatar = user.avatarData;
                console.log('Using avatarData for avatar display');
            }
            
            // Ensure avatar is set, default to the SA flag avatar if missing
            if (!user.avatar) {
                user.avatar = 'images/avatars/sa-flag-default.jpg';
                console.log('Avatar not found, using default SA flag avatar');
            }
            
            // Log successful retrieval
            console.log('Retrieved user data successfully:', user.name);
            return user;
        } catch (e) {
            console.error('Error parsing user data', e);
            return null;
        }
    }

    /**
     * Login user
     * @param {string} email User email
     * @param {string} password User password
     * @param {boolean} rememberMe Whether to remember the user session
     * @returns {Promise} Promise resolving to user data or rejection with error
     */
    static login(email, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            // Set a loading flag in sessionStorage to prevent redirect loops
            sessionStorage.setItem('authLoading', 'true');
            
            // Simulate API call delay
            setTimeout(() => {
                try {
                    // Clear the loading flag regardless of outcome
                    sessionStorage.removeItem('authLoading');
                
                    // First, check for the hardcoded demo user
                    if (email === 'demo@accountabilitysa.org' && password === 'password123') {
                        const user = {
                            id: '12345',
                            name: 'Demo User',
                            email: email,
                            role: 'citizen',
                            avatar: 'images/avatars/sa-flag-default.jpg',
                            lastLogin: new Date().toISOString()
                        };
                        this.storeSession(user, rememberMe);
                        
                        // Update UI immediately after login
                        this.updateAuthUI();
                        
                        // If ProfileUtils exists, initialize profile images
                        if (typeof ProfileUtils !== 'undefined') {
                            ProfileUtils.initProfileImages();
                        }
                        
                        resolve(user);
                        return; // Exit if demo user found
                    }

                    // If not demo user, look for user created via registration (in localStorage)
                    let registeredUsers = {};
                    const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
                     if(usersJson) {
                        try {
                            registeredUsers = JSON.parse(usersJson);
                        } catch (e) {
                            console.error("Error parsing registered users data during login", e);
                            // If parsing fails, can't log in registered users
                        }
                    }
                    
                    const registeredUser = registeredUsers[email];

                    // Check if user exists and password matches (for demo, plain text check)
                    // !! IMPORTANT: In a real app, compare hashed passwords!
                    if (registeredUser && registeredUser.password === password) {
                        console.log('Login successful for registered user:', registeredUser.email);
                        registeredUser.lastLogin = new Date().toISOString(); // Update last login
                        
                        // Ensure user has an avatar
                        if (!registeredUser.avatar) {
                            registeredUser.avatar = 'images/avatars/sa-flag-default.jpg';
                        }
                        
                        // Update the user record in the main list (to save lastLogin)
                        registeredUsers[email] = registeredUser;
                        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
                        
                        this.storeSession(registeredUser, rememberMe);
                        
                        // Update UI immediately after login
                        this.updateAuthUI();
                        
                        // If ProfileUtils exists, initialize profile images
                        if (typeof ProfileUtils !== 'undefined') {
                            ProfileUtils.initProfileImages();
                        }
                        
                        resolve(registeredUser);
                    } else {
                        // If no matching user found or password incorrect
                        reject(new Error('Invalid email or password'));
                    }
                } catch (e) {
                    reject(new Error('Login failed: ' + e.message));
                }
            }, 1000); // Simulate network delay
        });
    }

    // Helper function to store session data
    static storeSession(user, rememberMe) {
        // Ensure required user properties are set
        if (!user.avatar) {
            user.avatar = 'images/avatars/sa-flag-default.jpg';
        }
        
        // If avatarData exists but avatar doesn't, sync them
        if (user.avatarData && !user.avatar) {
            user.avatar = user.avatarData;
        } else if (user.avatar && !user.avatarData) {
            // Also keep avatarData in sync with avatar for backwards compatibility
            user.avatarData = user.avatar;
        }
        
        // Make sure avatar path is absolute if it's relative
        if (user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('/')) {
            // Keep the relative path as is, since it's relative to the root
            console.log('Using avatar path:', user.avatar);
        }
        
        const userDataJson = JSON.stringify(user);
        const token = 'demo-token-' + Math.random().toString(36).substring(2);

        console.log('Storing user session with rememberMe:', rememberMe);
        
        // Clear any loading flags
        sessionStorage.removeItem('authLoading');
        
        if (rememberMe) {
            localStorage.setItem(USER_DATA_KEY, userDataJson);
            localStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
            sessionStorage.setItem(SESSION_USER_DATA_KEY, userDataJson);
            // Store token in localStorage anyway for simplicity in demo, or use sessionStorage
            localStorage.setItem(AUTH_TOKEN_KEY, token); 
        }
        
        // Update the UI immediately after storing the session
        this.updateAuthUI();
    }

    /**
     * Register new user
     * @param {Object} userData User registration data
     * @returns {Promise} Promise resolving to user data or rejection with error
     */
    static register(userData) {
        return new Promise((resolve, reject) => {
            // In a real implementation, this would be an API call
            // For demo purposes, we simulate a successful registration
            setTimeout(() => {
                try {
                    // Check if email is already in use (in a real app, this would be server validation)
                    if (userData.email === 'demo@accountabilitysa.org') {
                        reject(new Error('This email is already registered'));
                        return;
                    }
                    
                    // Create new user object
                    const user = {
                        id: 'new-' + Math.random().toString(36).substring(2),
                        name: userData.name,
                        email: userData.email,
                        // !! IMPORTANT: Store password securely in a real app (e.g., hashed)
                        // For demo, we store it plain, which is insecure. Only for frontend demo purposes.
                        password: userData.password, 
                        role: 'citizen',
                        province: userData.province,
                        newsletter: userData.newsletter || false,
                        avatar: 'images/avatars/default.jpg',
                        registrationDate: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    };
                    
                    // Get existing users or initialize empty object
                    let registeredUsers = {};
                    const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
                    if (usersJson) {
                        try {
                            registeredUsers = JSON.parse(usersJson);
                        } catch (e) {
                            console.error("Error parsing registered users data during registration", e);
                            // Potentially corrupted data, start fresh
                            registeredUsers = {};
                        }
                    }

                    // Check if email is already registered (double check)
                    if (registeredUsers[user.email]) {
                         reject(new Error('This email is already registered.'));
                         return;
                    }

                    // Add new user to the list
                    registeredUsers[user.email] = user;
                    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
                    
                    // Store current user in session storage for immediate login
                    sessionStorage.setItem(SESSION_USER_DATA_KEY, JSON.stringify(user));
                    
                    // Generate token and store it (for demo)
                    const token = 'demo-token-' + Math.random().toString(36).substring(2);
                    localStorage.setItem(AUTH_TOKEN_KEY, token);
                    
                    resolve(user);
                } catch (e) {
                    reject(new Error('Registration failed: ' + e.message));
                }
            }, 1000);
        });
    }

    /**
     * Update user profile
     * @param {Object} userData Updated user data
     * @returns {Promise} Promise resolving to updated user data
     */
    static updateProfile(userData) {
        return new Promise((resolve, reject) => {
            // In a real implementation, this would be an API call
            setTimeout(() => {
                try {
                    // Get the existing user data
                    const currentUser = this.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('No user logged in'));
                        return;
                    }
                    
                    // Merge updated data with existing user data
                    const updatedUser = { ...currentUser, ...userData };
                    
                    // Update the stored user data
                    if (localStorage.getItem(USER_DATA_KEY)) {
                        localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
                    } else {
                        sessionStorage.setItem(SESSION_USER_DATA_KEY, JSON.stringify(updatedUser));
                    }
                    
                    resolve(updatedUser);
                } catch (e) {
                    reject(new Error('Profile update failed: ' + e.message));
                }
            }, 500);
        });
    }

    /**
     * Change user password
     * @param {string} currentPassword Current password
     * @param {string} newPassword New password
     * @returns {Promise} Promise resolving on success or rejecting with error
     */
    static changePassword(currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            // In a real implementation, this would be an API call to verify current password and update
            setTimeout(() => {
                // For demo, simulate successful password change
                // In a real app, we would verify the current password against stored hash
                if (currentPassword === 'password123' || currentPassword === 'demo') {
                    resolve(true);
                } else {
                    reject(new Error('Current password is incorrect'));
                }
            }, 500);
        });
    }

    /**
     * Request password reset
     * @param {string} email User email
     * @returns {Promise} Promise resolving on success or rejecting with error
     */
    static requestPasswordReset(email) {
        return new Promise((resolve, reject) => {
            // In a real implementation, this would be an API call
            setTimeout(() => {
                // For demo, simulate successful password reset request for any email
                resolve(true);
            }, 500);
        });
    }

    /**
     * Logout user
     */
    static logout() {
        // Clear auth data
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        sessionStorage.removeItem(SESSION_USER_DATA_KEY);
    }

    /**
     * Check authentication status and redirect if needed
     * @param {boolean} requiresAuth Whether the current page requires authentication
     * @param {string} redirectUrl URL to redirect to based on authentication status
     */
    static checkAuthAndRedirect(requiresAuth, redirectUrl) {
        // Skip redirection if we're on the login page and it's explicitly flagged
        if (sessionStorage.getItem('onLoginPage') === 'true') {
            console.log('On login page with flag, skipping redirects');
            return;
        }
        
        // Check if we're currently in an authentication process to prevent flashing
        if (sessionStorage.getItem('authLoading') === 'true') {
            console.log('Authentication in progress, skipping redirect');
            return;
        }
        
        const isAuthenticated = this.isAuthenticated();
        
        // If auth is required but user is not authenticated, redirect to login
        if (requiresAuth && !isAuthenticated) {
            console.log('Authentication required but user not logged in. Redirecting to:', redirectUrl || 'login.html');
            window.location.href = redirectUrl || 'login.html';
            return;
        }
        
        // If user is authenticated but on a page meant for non-authenticated users (like login page)
        if (isAuthenticated && !requiresAuth) {
            console.log('User already logged in but on non-auth page. Redirecting to:', redirectUrl || 'account.html');
            window.location.href = redirectUrl || 'account.html';
            return;
        }
        
        // Otherwise, no redirect needed
        console.log('No redirect needed. Auth status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
        
        // Update UI to match auth state
        this.updateAuthUI();
    }

    /**
     * Update UI elements based on authentication status
     */
    static updateAuthUI() {
        console.log('Updating auth UI elements');
        const user = this.getCurrentUser();
        const isAuthed = this.isAuthenticated();
        
        // Update login/account links
        const accountNavItems = document.querySelectorAll('.account-nav-item');
        if (accountNavItems.length) {
            accountNavItems.forEach(item => {
                if (isAuthed && user) {
                    console.log('Updating UI for authenticated user:', user.name);
                    
                    // Ensure avatar path is correct
                    const avatarPath = user.avatar || 'images/avatars/sa-flag-default.jpg';
                    console.log('Using avatar path:', avatarPath);
                    
                    // Show account dropdown for logged in users
                    item.innerHTML = `
                        <a href="#" class="account-dropdown-toggle">
                            <img src="${avatarPath}" alt="${user.name}" width="24" height="24" style="border-radius: 50%; margin-right: 5px; object-fit: cover;">
                            ${user.name.split(' ')[0]}
                            <i class="fas fa-chevron-down"></i>
                        </a>
                        <div class="account-dropdown">
                            <div class="account-dropdown-header">
                                <div class="user-info">
                                    <h4>${user.name}</h4>
                                    <p>${user.email}</p>
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
                            // Use the global helper function
                            window.accountabilityLogout();
                        });
                    }
                } else {
                    console.log('Updating UI for non-authenticated user');
                    // Show login link for logged out users
                    item.innerHTML = '<a href="login.html"><i class="fas fa-user-circle"></i> <span class="login-text">Login</span></a>';
                }
            });
        } else {
            console.warn('No account navigation items found');
        }
        
        // If ProfileUtils is available, use it to update all profile images
        if (typeof ProfileUtils !== 'undefined' && typeof ProfileUtils.initProfileImages === 'function') {
            console.log('Using ProfileUtils to update profile images');
            ProfileUtils.initProfileImages();
        }
    }
}

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update authentication UI
    AuthService.updateAuthUI();
    
    // Check current page type
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop();
    
    // Handle redirects based on page type
    if (pageName === 'login.html' || pageName === 'signup.html' || pageName === 'forgot-password.html') {
        // Auth pages - redirect to account if already logged in
        AuthService.checkAuthAndRedirect(false, 'account.html');
    } else if (pageName === 'account.html') {
        // Protected pages - redirect to login if not authenticated
        AuthService.checkAuthAndRedirect(true, 'login.html');
    } else if (pageName === 'petition-detail.html') {
        // Check if trying to sign a petition
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'sign') {
            // Redirect to login if not authenticated
            AuthService.checkAuthAndRedirect(true, 'login.html?redirect=' + encodeURIComponent(window.location.href));
        }
    }
    
    // Check for auth-required elements
    const authRequiredElements = document.querySelectorAll('[data-auth-required="true"]');
    if (authRequiredElements.length) {
        authRequiredElements.forEach(element => {
            element.addEventListener('click', function(e) {
                // If user is not authenticated, show auth modal or redirect
                if (!AuthService.isAuthenticated()) {
                    e.preventDefault();
                    
                    // If we have an auth modal, show it
                    const authModal = document.getElementById('auth-modal');
                    if (authModal) {
                        authModal.classList.add('show');
                    } else {
                        // Otherwise redirect to login
                        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                    }
                }
            });
        });
    }
    
    // Handle redirect from login page
    const isAuthed = AuthService.isAuthenticated();
    if (isAuthed && (pageName === 'login.html' || pageName === 'signup.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }
});

// Export the auth service for use in other files
window.AuthService = AuthService; 

// Add a global helper function for logging out
window.accountabilityLogout = function() {
    console.log('Global logout function called');
    AuthService.logout();
    window.location.href = 'index.html';
};