/**
 * Accountability SA - User Profile Utilities
 * Handles avatar images and profile data management
 */

// Namespace for profile utilities
const ProfileUtils = {
    // Default avatar image path
    DEFAULT_AVATAR: 'images/avatars/sa-flag-default.jpg',
    
    /**
     * Get the user's current avatar URL
     * @returns {string} URL to the avatar image
     */
    getAvatar: function() {
        const user = this.getCurrentUser();
        if (!user || !user.avatar) {
            console.log('Using default avatar:', this.DEFAULT_AVATAR);
            return this.DEFAULT_AVATAR;
        }
        
        // Log the avatar path being used
        console.log('Using user avatar:', user.avatar);
        return user.avatar;
    },
    
    /**
     * Get the current user
     * @returns {Object|null} User object or null if not logged in
     */
    getCurrentUser: function() {
        // Try to use AuthService if available
        if (typeof AuthService !== 'undefined' && AuthService.getCurrentUser) {
            const user = AuthService.getCurrentUser();
            if (user) {
                // Ensure avatar is set
                if (!user.avatar) {
                    user.avatar = this.DEFAULT_AVATAR;
                }
                return user;
            }
        }
        
        // Fallback method if AuthService not available
        const userData = localStorage.getItem('accountabilitySAUser') || 
                          sessionStorage.getItem('accountabilitySAUser');
        if (!userData) return null;
        
        try {
            const user = JSON.parse(userData);
            // Ensure avatar is set
            if (!user.avatar) {
                user.avatar = this.DEFAULT_AVATAR;
            }
            return user;
        } catch (e) {
            console.error('Error parsing user data', e);
            return null;
        }
    },
    
    /**
     * Update the user's avatar
     * @param {string} avatarUrl The new avatar URL
     * @returns {boolean} Success or failure
     */
    updateAvatar: function(avatarUrl) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Update the avatar URL
        user.avatar = avatarUrl;
        
        // Save the updated user data
        try {
            // Store in both localStorage and sessionStorage for consistency
            const userJson = JSON.stringify(user);
            localStorage.setItem('accountabilitySAUser', userJson);
            sessionStorage.setItem('accountabilitySAUser', userJson);
            
            // Update all avatar elements on the page
            this.updateAllAvatarElements(avatarUrl);
            
            // Force UI refresh if header.js is available
            if (typeof updateHeaderUI === 'function') {
                updateHeaderUI();
            } else if (typeof AuthService !== 'undefined' && AuthService.updateAuthUI) {
                AuthService.updateAuthUI();
            }
            
            return true;
        } catch (e) {
            console.error('Failed to update avatar:', e);
            return false;
        }
    },
    
    /**
     * Update all avatar elements on the page
     * @param {string} avatarUrl The avatar URL to set
     */
    updateAllAvatarElements: function(avatarUrl) {
        // Update all elements with class 'user-avatar'
        const avatarElements = document.querySelectorAll('.user-avatar, [id$="-avatar"], [id*="avatar"]');
        console.log(`Updating ${avatarElements.length} avatar elements on the page`);
        
        avatarElements.forEach(img => {
            if (img.tagName === 'IMG') {
                img.src = avatarUrl;
                img.alt = this.getCurrentUser()?.name || 'User';
            }
        });
        
        // Specific known avatar elements
        const knownAvatarIds = [
            'user-avatar-header', 
            'sidebar-avatar', 
            'profile-avatar-preview'
        ];
        
        knownAvatarIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.tagName === 'IMG') {
                el.src = avatarUrl;
            }
        });
    },
    
    /**
     * Initialize all profile images on the page
     */
    initProfileImages: function() {
        const user = this.getCurrentUser();
        if (!user) {
            console.log('No user found, not initializing profile images');
            return;
        }
        
        console.log('Initializing profile images for user:', user.name);
        
        // Get the avatar URL
        const avatarUrl = this.getAvatar();
        
        // Update all avatar elements
        this.updateAllAvatarElements(avatarUrl);
        
        // Update profile name elements
        const nameElements = document.querySelectorAll(
            '.user-profile-name, #user-name-header, #dropdown-user-name, #sidebar-name'
        );
        nameElements.forEach(el => {
            if (el) el.textContent = user.name || 'User';
        });
        
        // Update email elements
        const emailElements = document.querySelectorAll(
            '#dropdown-user-email, #sidebar-email'
        );
        emailElements.forEach(el => {
            if (el) el.textContent = user.email || '';
        });
    },
    
    /**
     * Handle avatar upload from file input
     * @param {HTMLElement} fileInput The file input element
     * @param {HTMLElement} previewElement Optional preview element
     * @param {Function} callback Optional callback after upload
     */
    handleAvatarUpload: function(fileInput, previewElement, callback) {
        if (!fileInput) {
            console.error('File input element not found for avatar upload');
            return;
        }
        
        console.log('Setting up avatar upload handler on', fileInput.id || 'unnamed input');
        
        // Clear any existing listeners to prevent duplicates
        const clonedInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(clonedInput, fileInput);
        fileInput = clonedInput;
        
        fileInput.addEventListener('change', (e) => {
            console.log('File selected for avatar upload');
            const file = e.target.files[0];
            if (!file) return;
            
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }
            
            console.log('Reading selected avatar file');
            
            // Read and process the file
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                console.log('File read complete, updating avatar');
                
                // Show preview if preview element provided
                if (previewElement) {
                    previewElement.src = dataUrl;
                    console.log('Avatar preview updated');
                }
                
                // Update user's avatar in storage
                this.updateAvatar(dataUrl);
                console.log('Avatar saved to user data');
                
                // Call the callback if provided
                if (typeof callback === 'function') {
                    callback(dataUrl);
                }
                
                // Provide user feedback
                alert('Profile picture updated successfully!');
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                alert('Error reading file. Please try again.');
            };
            
            reader.readAsDataURL(file);
        });
    }
};

// Initialize profile images when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing profile images');
    ProfileUtils.initProfileImages();
});

// Export to window object for global access
window.ProfileUtils = ProfileUtils; 