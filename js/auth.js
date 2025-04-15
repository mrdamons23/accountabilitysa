/**
 * Accountability SA - Authentication Module
 * Handles user authentication, registration, and session management
 * Now with Firebase integration for permanent account storage
 */

// Constants
const AUTH_TOKEN_KEY = 'accountabilitySAToken';
const USER_DATA_KEY = 'accountabilitySAUser';
const SESSION_USER_DATA_KEY = 'accountabilitySAUser';
const REGISTERED_USERS_KEY = 'accountabilitySARegisteredUsers';
const COOKIE_TOKEN_NAME = 'accountabilitySA_auth';
const COOKIE_EXPIRY_DAYS = 30; // Default to 30 days
const USE_FIREBASE = true; // Set to true to use Firebase, false to use local storage only

// Helper functions for cookie management
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
}

// Initialize account recovery check
document.addEventListener('DOMContentLoaded', function() {
    // If not using Firebase, try to recover user session from cookies
    if (!USE_FIREBASE) {
        AuthService.attemptSessionRecovery();
    }
});

// Auth service class
class AuthService {
    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    static isAuthenticated() {
        if (USE_FIREBASE && typeof firebase !== 'undefined') {
            return firebase.auth().currentUser !== null;
        }
        
        // Fallback to local storage method
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const sessionUser = sessionStorage.getItem(SESSION_USER_DATA_KEY);
        const cookieToken = getCookie(COOKIE_TOKEN_NAME);
        
        return !!token || !!sessionUser || !!cookieToken;
    }

    /**
     * Get current user information
     * @returns {Object|null} User object or null if not logged in
     */
    static getCurrentUser() {
        // Check Firebase first if enabled
        if (USE_FIREBASE && typeof firebase !== 'undefined') {
            const firebaseUser = firebase.auth().currentUser;
            if (firebaseUser) {
                // Create a user object in the format expected by the app
                return {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    email: firebaseUser.email,
                    role: 'citizen', // Default role
                    avatar: firebaseUser.photoURL || 'images/avatars/sa-flag-default.jpg',
                    lastLogin: new Date().toISOString(),
                    isFirebaseUser: true
                };
            }
        }
        
        // Fallback to local storage method if Firebase not available or not enabled
        const userData = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(SESSION_USER_DATA_KEY);
        
        // If no user data in storage, attempt recovery from cookie
        if (!userData && this.isAuthenticated()) {
            this.attemptSessionRecovery();
            // Try again after recovery attempt
            const recoveredData = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(SESSION_USER_DATA_KEY);
            if (recoveredData) {
                return JSON.parse(recoveredData);
            }
        }
        
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
     * Handle Firebase authentication state changes
     * @param {Object} firebaseUser Firebase user object
     */
    static handleFirebaseAuthChange(firebaseUser) {
        if (firebaseUser) {
            // User is signed in, create local user object for compatibility
            const user = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
                role: 'citizen', // Default role
                avatar: firebaseUser.photoURL || 'images/avatars/sa-flag-default.jpg',
                lastLogin: new Date().toISOString(),
                isFirebaseUser: true
            };
            
            // Store in local storage for offline functionality
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
            localStorage.setItem(AUTH_TOKEN_KEY, 'firebase-token');
            
            // Also store in cookies for backup
            setCookie(COOKIE_TOKEN_NAME, `${user.email}:firebase-auth`, COOKIE_EXPIRY_DAYS);
            
            // Update UI
            this.updateAuthUI();
        } else {
            // User is signed out, clear local storage
            localStorage.removeItem(USER_DATA_KEY);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            sessionStorage.removeItem(SESSION_USER_DATA_KEY);
            eraseCookie(COOKIE_TOKEN_NAME);
            
            // Update UI
            this.updateAuthUI();
        }
    }

    /**
     * Attempt to recover user session if localStorage was cleared but cookie exists
     * @returns {boolean} True if session was recovered, false otherwise
     */
    static attemptSessionRecovery() {
        console.log('Attempting session recovery...');
        const cookieToken = getCookie(COOKIE_TOKEN_NAME);
        
        if (!cookieToken) {
            console.log('No auth cookie found for recovery');
            return false;
        }
        
        // Parse the token to extract user email (tokens are in format "email:random-string")
        const tokenParts = cookieToken.split(':');
        if (tokenParts.length < 2) {
            console.log('Invalid auth cookie format');
            return false;
        }
        
        const userEmail = tokenParts[0];
        
        // Check if user exists in registered users
        const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
        if (!usersJson) {
            console.log('No registered users found for recovery');
            return false;
        }
        
        try {
            const registeredUsers = JSON.parse(usersJson);
            const user = registeredUsers[userEmail];
            
            if (!user) {
                console.log('User not found in registered users');
                return false;
            }
            
            // Restore user session
            console.log('Recovering session for:', userEmail);
            this.storeSession(user, true); // Always store as persistent
            return true;
            
        } catch (e) {
            console.error('Error during session recovery:', e);
            return false;
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
            
            // If Firebase is enabled, use Firebase Authentication
            if (USE_FIREBASE && typeof firebase !== 'undefined') {
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Clear loading flag
                        sessionStorage.removeItem('authLoading');
                        
                        // Get the user
                        const firebaseUser = userCredential.user;
                        
                        // Create local user object for compatibility
                        const user = {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            email: firebaseUser.email,
                            role: 'citizen',
                            avatar: firebaseUser.photoURL || 'images/avatars/sa-flag-default.jpg',
                            lastLogin: new Date().toISOString(),
                            isFirebaseUser: true
                        };
                        
                        // Update Firestore with last login
                        firebase.firestore().collection('users').doc(firebaseUser.uid).update({
                            lastLogin: new Date().toISOString()
                        }).catch(err => console.warn('Could not update last login:', err));
                        
                        // Store in local storage for offline functionality
                        this.storeSession(user, rememberMe);
                        
                        // Update UI
                        this.updateAuthUI();
                        
                        resolve(user);
                    })
                    .catch((error) => {
                        // Clear loading flag
                        sessionStorage.removeItem('authLoading');
                        
                        // Handle errors
                        const errorMessage = error.message;
                        reject(new Error(errorMessage));
                    });
                
                return;
            }
            
            // Fallback to local storage method if Firebase not available
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

    /**
     * Register new user
     * @param {Object} userData User registration data
     * @returns {Promise} Promise resolving to user data or rejection with error
     */
    static register(userData) {
        return new Promise((resolve, reject) => {
            // If Firebase is enabled, use Firebase Authentication
            if (USE_FIREBASE && typeof firebase !== 'undefined') {
                firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password)
                    .then((userCredential) => {
                        // Get the user
                        const firebaseUser = userCredential.user;
                        
                        // Update profile
                        return firebaseUser.updateProfile({
                            displayName: userData.name,
                            // Default avatar
                            photoURL: 'images/avatars/sa-flag-default.jpg'
                        }).then(() => {
                            // Create user document in Firestore
                            return firebase.firestore().collection('users').doc(firebaseUser.uid).set({
                                name: userData.name,
                                email: userData.email,
                                role: 'citizen',
                                province: userData.province || '',
                                newsletter: userData.newsletter || false,
                                registrationDate: new Date().toISOString(),
                                lastLogin: new Date().toISOString()
                            });
                        }).then(() => {
                            // Create local user object for compatibility
                            const user = {
                                id: firebaseUser.uid,
                                name: userData.name,
                                email: userData.email,
                                role: 'citizen',
                                avatar: 'images/avatars/sa-flag-default.jpg',
                                registrationDate: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                                isFirebaseUser: true
                            };
                            
                            // Store in local storage for offline functionality
                            this.storeSession(user, true);
                            
                            // Send email verification
                            firebaseUser.sendEmailVerification();
                            
                            resolve(user);
                        });
                    })
                    .catch((error) => {
                        // Handle errors
                        const errorMessage = error.message;
                        reject(new Error(errorMessage));
                    });
                
                return;
            }
            
            // Fallback to local storage method if Firebase not available
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
                    this.storeSession(user, true); // Default to remember me on registration
                    
                    resolve(user);
                } catch (e) {
                    reject(new Error('Registration failed: ' + e.message));
                }
            }, 1500); // Simulate network delay for registration
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
        
        const userDataJson = JSON.stringify(user);
        const token = user.isFirebaseUser ? 'firebase-token' : 'demo-token-' + Math.random().toString(36).substring(2);
        const cookieValue = `${user.email}:${token}`;

        console.log('Storing user session with rememberMe:', rememberMe);
        
        // Clear any loading flags
        sessionStorage.removeItem('authLoading');
        
        // Always store in both localStorage and sessionStorage for better persistence
        localStorage.setItem(USER_DATA_KEY, userDataJson);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        sessionStorage.setItem(SESSION_USER_DATA_KEY, userDataJson);
        
        // Always set a cookie as backup authentication mechanism
        const cookieDays = rememberMe ? COOKIE_EXPIRY_DAYS : 1; // 1 day if not remember me
        setCookie(COOKIE_TOKEN_NAME, cookieValue, cookieDays);
        
        // Update the UI immediately after storing the session
        this.updateAuthUI();
        
        // Create backup of registered users in cookie for potential recovery
        const registeredUsers = localStorage.getItem(REGISTERED_USERS_KEY);
        if (registeredUsers) {
            try {
                const parsedUsers = JSON.parse(registeredUsers);
                // Store only emails in cookie for size limitations
                const userEmails = Object.keys(parsedUsers);
                if (userEmails.length > 0) {
                    setCookie('accountabilitySA_usersList', userEmails.join(','), COOKIE_EXPIRY_DAYS);
                }
            } catch (e) {
                console.error('Error backing up user list:', e);
            }
        }
    }

    /**
     * Update user profile data
     * @param {Object} userData Updated user data
     * @returns {Promise} Promise resolving to updated user data or rejection with error
     */
    static updateProfile(userData) {
        return new Promise((resolve, reject) => {
            // If Firebase is enabled, use Firebase to update profile
            if (USE_FIREBASE && typeof firebase !== 'undefined') {
                const firebaseUser = firebase.auth().currentUser;
                if (!firebaseUser) {
                    reject(new Error('You must be logged in to update your profile'));
                    return;
                }
                
                // Create a batch of promises to update different parts of the profile
                const promises = [];
                
                // Update Firebase Auth display name if provided
                if (userData.name) {
                    promises.push(
                        firebaseUser.updateProfile({
                            displayName: userData.name
                        })
                    );
                }
                
                // Update Firebase Auth photo URL if provided
                if (userData.avatar) {
                    promises.push(
                        firebaseUser.updateProfile({
                            photoURL: userData.avatar
                        })
                    );
                }
                
                // Update user data in Firestore
                promises.push(
                    firebase.firestore().collection('users').doc(firebaseUser.uid).update({
                        ...userData,
                        lastUpdated: new Date().toISOString()
                    })
                );
                
                // Execute all promises
                Promise.all(promises)
                    .then(() => {
                        // Create updated user object
                        const updatedUser = {
                            id: firebaseUser.uid,
                            name: userData.name || firebaseUser.displayName,
                            email: firebaseUser.email,
                            role: userData.role || 'citizen',
                            avatar: userData.avatar || firebaseUser.photoURL || 'images/avatars/sa-flag-default.jpg',
                            lastLogin: new Date().toISOString(),
                            lastUpdated: new Date().toISOString(),
                            isFirebaseUser: true
                        };
                        
                        // Update local storage
                        this.storeSession(updatedUser, true);
                        
                        resolve(updatedUser);
                    })
                    .catch((error) => {
                        reject(new Error('Failed to update profile: ' + error.message));
                    });
                
                return;
            }
            
            // Fallback to local storage method if Firebase not available
            try {
                // Get current user
                    const currentUser = this.getCurrentUser();
                    if (!currentUser) {
                    reject(new Error('You must be logged in to update your profile'));
                        return;
                    }
                    
                // Get registered users
                let registeredUsers = {};
                const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
                if (usersJson) {
                    registeredUsers = JSON.parse(usersJson);
                }
                
                // Update user data
                const updatedUser = { ...registeredUsers[currentUser.email], ...userData };
                updatedUser.lastUpdated = new Date().toISOString();
                
                // Update in registered users list
                registeredUsers[currentUser.email] = updatedUser;
                localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
                
                // Also update current session
                this.storeSession(updatedUser, true);  // Keep as persistent
                
                // Resolve with updated user data
                    resolve(updatedUser);
                
            } catch (error) {
                reject(new Error('Failed to update profile: ' + error.message));
                }
        });
    }

    /**
     * Change user password
     * @param {string} currentPassword Current password for verification
     * @param {string} newPassword New password
     * @returns {Promise} Promise resolving on success or rejection with error
     */
    static changePassword(currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            // If Firebase is enabled, use Firebase to change password
            if (USE_FIREBASE && typeof firebase !== 'undefined') {
                const firebaseUser = firebase.auth().currentUser;
                if (!firebaseUser) {
                    reject(new Error('You must be logged in to change your password'));
                    return;
                }
                
                // Get user's email for re-authentication
                const email = firebaseUser.email;
                
                // Create credential with current password
                const credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
                
                // Re-authenticate user
                firebaseUser.reauthenticateWithCredential(credential)
                    .then(() => {
                        // Password verified, update to new password
                        return firebaseUser.updatePassword(newPassword);
                    })
                    .then(() => {
                        // Password updated successfully
                        // Update password change date in Firestore
                        return firebase.firestore().collection('users').doc(firebaseUser.uid).update({
                            passwordLastChanged: new Date().toISOString()
                        });
                    })
                    .then(() => {
                        resolve('Password changed successfully');
                    })
                    .catch((error) => {
                        // Handle errors
                        reject(new Error('Failed to change password: ' + error.message));
                    });
                
                return;
            }
            
            // Fallback to local storage method if Firebase not available
            try {
                // Get current user
                const currentUser = this.getCurrentUser();
                if (!currentUser) {
                    reject(new Error('You must be logged in to change your password'));
                    return;
                }
                
                // Get registered users
                let registeredUsers = {};
                const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
                if (usersJson) {
                    registeredUsers = JSON.parse(usersJson);
                }
                
                const user = registeredUsers[currentUser.email];
                
                // Verify current password
                if (user.password !== currentPassword) {
                    reject(new Error('Current password is incorrect'));
                    return;
                }
                
                // Update password
                user.password = newPassword;
                user.passwordLastChanged = new Date().toISOString();
                
                // Update in registered users list
                registeredUsers[currentUser.email] = user;
                localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
                
                // Resolve with success message
                resolve('Password changed successfully');
                
            } catch (error) {
                reject(new Error('Failed to change password: ' + error.message));
            }
        });
    }

    /**
     * Request password reset
     * @param {string} email User email
     * @returns {Promise} Promise resolving on success or rejection with error
     */
    static requestPasswordReset(email) {
        return new Promise((resolve, reject) => {
            // If Firebase is enabled, use Firebase to reset password
            if (USE_FIREBASE && typeof firebase !== 'undefined') {
                firebase.auth().sendPasswordResetEmail(email)
                    .then(() => {
                        resolve('Password reset email sent to ' + email);
                    })
                    .catch((error) => {
                        reject(new Error('Failed to send password reset email: ' + error.message));
                    });
                
                return;
            }
            
            // Fallback to simulated password reset if Firebase not available
            setTimeout(() => {
                resolve('Password reset link has been sent to your email (simulated)');
            }, 1500);
        });
    }

    /**
     * Log out the current user
     */
    static logout() {
        // If Firebase is enabled, use Firebase to sign out
        if (USE_FIREBASE && typeof firebase !== 'undefined') {
            firebase.auth().signOut()
                .then(() => {
                    // Clear all local storage
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    localStorage.removeItem(USER_DATA_KEY);
                    sessionStorage.removeItem(SESSION_USER_DATA_KEY);
                    eraseCookie(COOKIE_TOKEN_NAME);
                    
                    // Redirect to home page
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Error signing out:', error);
                });
            
            return;
        }
        
        // Fallback to local storage method if Firebase not available
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        sessionStorage.removeItem(SESSION_USER_DATA_KEY);
        eraseCookie(COOKIE_TOKEN_NAME);
        
        // Redirect to home page
        window.location.href = 'index.html';
        
        // Update UI
        this.updateAuthUI();
    }

    /**
     * Check if user is authenticated and redirect if necessary
     * @param {boolean} requiresAuth Whether the page requires authentication
     * @param {string} redirectUrl URL to redirect to if authentication requirement not met
     */
    static checkAuthAndRedirect(requiresAuth, redirectUrl) {
        console.log('Checking auth status for page. Requires auth:', requiresAuth);
        
        // Check if we're in the process of logging in/out to prevent redirect loops
        if (sessionStorage.getItem('authLoading') === 'true') {
            console.log('Auth operation in progress, skipping redirect check');
            return;
        }
        
        const isAuth = this.isAuthenticated();
        console.log('Current auth status:', isAuth);
        
        // Try session recovery if not authenticated
        if (!isAuth && !USE_FIREBASE && this.attemptSessionRecovery()) {
            console.log('Session recovered successfully');
            // Re-check authentication after recovery
            if (requiresAuth && !this.isAuthenticated()) {
            window.location.href = redirectUrl || 'login.html';
            }
            return;
        }
        
        if (requiresAuth && !isAuth) {
            console.log('Authentication required but user not logged in. Redirecting to:', redirectUrl);
            window.location.href = redirectUrl || 'login.html';
        } else if (!requiresAuth && isAuth && redirectUrl) {
            // Optional: redirect if user is logged in but page is for anonymous users
            // For example, redirect from login page to dashboard if already logged in
            console.log('User already authenticated. Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }
    }

    /**
     * Update UI elements based on authentication status
     */
    static updateAuthUI() {
        // This function gets called from header.js
        console.log('updateAuthUI called - handled by header.js');
        
        // If we're on a page with header.js, it will handle this.
        // If there's no header.js integration, we do a basic version here:
        const isAuth = this.isAuthenticated();
        const user = this.getCurrentUser();
        
        // Find all elements with the auth-status-label class
        const authStatusLabels = document.querySelectorAll('.auth-status-label');
        if (authStatusLabels.length > 0) {
            authStatusLabels.forEach(el => {
                el.textContent = isAuth ? 'Logged In' : 'Not Logged In';
                el.className = 'auth-status-label ' + (isAuth ? 'logged-in' : 'logged-out');
            });
        }
        
        // Find user name containers
        const userNameContainers = document.querySelectorAll('.user-name-container');
        if (userNameContainers.length > 0 && user) {
            userNameContainers.forEach(el => {
                el.textContent = user.name;
            });
        }
        
        // Add any other UI update logic here that's not handled by header.js
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
};