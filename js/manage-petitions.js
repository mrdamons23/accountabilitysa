/**
 * Accountability SA - Manage Petitions Module
 * Handles displaying, editing, and deleting user-created petitions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = AuthService.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize the manage petitions page
    initializeManagePetitionsPage();
    
    // Handle header UI update
    if (typeof updateHeaderUI === 'function') {
        updateHeaderUI();
    }
});

/**
 * Initialize the manage petitions page
 */
function initializeManagePetitionsPage() {
    // Load user's created petitions
    loadCreatedPetitions();
    
    // Setup event handlers
    setupEventHandlers();
}

/**
 * Setup event handlers for the page
 */
function setupEventHandlers() {
    // Account dropdown toggle
    const accountToggle = document.querySelector('.account-dropdown-toggle');
    const accountDropdown = document.querySelector('.account-dropdown');
    
    if (accountToggle && accountDropdown) {
        accountToggle.addEventListener('click', function(e) {
            e.preventDefault();
            accountDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!accountToggle.contains(e.target) && !accountDropdown.contains(e.target)) {
                accountDropdown.classList.remove('show');
            }
        });
    }
    
    // Logout button
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            AuthService.logout();
        });
    }
}

/**
 * Load created petitions from PetitionsService
 */
function loadCreatedPetitions() {
    const user = AuthService.getCurrentUser();
    if (!user) return;
    
    const userId = user.id;
    const petitionsContainer = document.getElementById('petitions-management-list');
    const noResultsElement = document.getElementById('no-petitions');
    
    if (!petitionsContainer) return;
    
    // Show loading state
    petitionsContainer.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading your petitions...</div>';
    
    try {
        // Get created petition IDs
        const createdPetitionIds = PetitionsService.getUserCreatedPetitions(userId);
        
        // If no petitions found
        if (!createdPetitionIds || createdPetitionIds.length === 0) {
            petitionsContainer.innerHTML = '';
            if (noResultsElement) {
                noResultsElement.style.display = 'flex';
            }
            return;
        }
        
        // Hide no results message
        if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
        
        // Get petition details
        const allPetitions = PetitionsService.getAllPetitions();
        const createdPetitions = allPetitions.filter(petition => createdPetitionIds.includes(petition.id));
        
        // Get creation date details
        const CREATED_PETITIONS_DETAILS_KEY = 'accountabilitySA_createdPetitionsDetails';
        const detailsJson = localStorage.getItem(`${CREATED_PETITIONS_DETAILS_KEY}_${userId}`);
        const petitionDetails = detailsJson ? JSON.parse(detailsJson) : {};
        
        // Sort by creation date (newest first)
        createdPetitions.sort((a, b) => {
            const dateA = (petitionDetails[a.id] && petitionDetails[a.id].creationDate) || 
                          a.exactCreationDate || a.createdDate;
            const dateB = (petitionDetails[b.id] && petitionDetails[b.id].creationDate) || 
                          b.exactCreationDate || b.createdDate;
            return new Date(dateB) - new Date(dateA);
        });
        
        // Generate the HTML for each petition
        petitionsContainer.innerHTML = '';
        createdPetitions.forEach(petition => {
            const petitionElement = createPetitionElement(petition, petitionDetails);
            petitionsContainer.appendChild(petitionElement);
        });
        
    } catch (error) {
        console.error('Error loading created petitions:', error);
        petitionsContainer.innerHTML = '<div class="error-message">Error loading your petitions. Please try again later.</div>';
    }
}

/**
 * Create a petition management element
 * @param {Object} petition - The petition object
 * @param {Object} petitionDetails - Additional petition details
 * @returns {HTMLElement} The petition management element
 */
function createPetitionElement(petition, petitionDetails) {
    const signaturesCount = petition.signatures ? petition.signatures : 0;
    const goalCount = petition.goalSignatures || petition.goal || 100;
    const progressPercentage = Math.min(Math.round((signaturesCount / goalCount) * 100), 100);
    
    // Format creation date
    const creationDate = (petitionDetails[petition.id] && petitionDetails[petition.id].creationDate) || 
                         petition.exactCreationDate || petition.createdDate;
    const displayDate = formatDate(creationDate);
    
    const petitionElement = document.createElement('div');
    petitionElement.className = 'petition-management-item';
    petitionElement.setAttribute('data-id', petition.id);
    
    petitionElement.innerHTML = `
        <div class="petition-management-header">
            <div class="petition-image">
                <img src="${petition.image || 'img/petition-placeholder.jpg'}" alt="${petition.title || 'Petition'}" onerror="this.src='images/petitions/default.jpg'">
            </div>
            <div class="petition-info">
                <h4>${petition.title || 'Untitled Petition'}</h4>
                <div class="petition-meta">
                    <span><i class="far fa-calendar-alt"></i> Created: ${displayDate}</span>
                    <span><i class="fas fa-signature"></i> Signatures: ${signaturesCount}</span>
                    <span><i class="fas fa-bullseye"></i> Goal: ${goalCount}</span>
                </div>
            </div>
        </div>
        <div class="petition-management-body">
            <p>${(petition.summary || '').substring(0, 150)}${petition.summary && petition.summary.length > 150 ? '...' : ''}</p>
            <div class="petition-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-text">${signaturesCount} of ${goalCount} signatures (${progressPercentage}%)</div>
            </div>
        </div>
        <div class="petition-management-actions">
            <a href="petition-detail.html?id=${petition.id}" class="btn-view">
                <i class="fas fa-eye"></i> View
            </a>
            <button class="btn-edit-petition" onclick="editPetition('${petition.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete-petition" onclick="confirmDeletePetition('${petition.id}')">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>
    `;
    
    return petitionElement;
}

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString || 'Unknown date';
    }
}

/**
 * Edit a petition
 * @param {string} petitionId - ID of the petition to edit
 */
function editPetition(petitionId) {
    // Redirect to the petition creation form with the edit parameter
    window.location.href = `petitions.html?edit=${petitionId}#create-petition-section`;
}

/**
 * Confirm deletion of a petition
 * @param {string} petitionId - ID of the petition to delete
 */
function confirmDeletePetition(petitionId) {
    if (confirm('Are you sure you want to delete this petition? This action cannot be undone.')) {
        deletePetition(petitionId);
    }
}

/**
 * Delete a petition
 * @param {string} petitionId - ID of the petition to delete
 */
function deletePetition(petitionId) {
    const user = AuthService.getCurrentUser();
    if (!user) {
        showToast('You must be logged in to delete a petition', 'error');
        return;
    }
    
    const userId = user.id;
    
    // Get the petition element
    const petitionElement = document.querySelector(`.petition-management-item[data-id="${petitionId}"]`);
    if (petitionElement) {
        // Visually indicate deletion in progress
        petitionElement.style.opacity = '0.5';
        petitionElement.style.pointerEvents = 'none';
    }
    
    // Delete the petition using PetitionsService
    const success = PetitionsService.deletePetition(petitionId, userId);
    
    if (success) {
        // Remove the petition element with animation
        if (petitionElement) {
            petitionElement.style.transition = 'height 0.3s ease, opacity 0.3s ease, margin 0.3s ease, padding 0.3s ease';
            petitionElement.style.height = '0';
            petitionElement.style.margin = '0';
            petitionElement.style.padding = '0';
            petitionElement.style.border = 'none';
            petitionElement.style.opacity = '0';
            
            setTimeout(() => {
                petitionElement.remove();
                
                // Check if there are any petitions left
                const petitionsContainer = document.getElementById('petitions-management-list');
                const noResultsElement = document.getElementById('no-petitions');
                
                if (petitionsContainer && petitionsContainer.children.length === 0 && noResultsElement) {
                    noResultsElement.style.display = 'flex';
                }
            }, 300);
        }
        
        showToast('Petition deleted successfully', 'success');
    } else {
        // Revert visual changes if deletion failed
        if (petitionElement) {
            petitionElement.style.opacity = '1';
            petitionElement.style.pointerEvents = 'auto';
        }
        
        showToast('Failed to delete petition. Please try again.', 'error');
    }
}

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add toast styles if not already in CSS
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .toast {
            padding: 12px 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            min-width: 300px;
        }
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        .toast-content {
            display: flex;
            align-items: center;
        }
        .toast-content i {
            margin-right: 10px;
            font-size: 18px;
        }
        .toast-success {
            border-left: 4px solid #27ae60;
        }
        .toast-success i {
            color: #27ae60;
        }
        .toast-error {
            border-left: 4px solid #e74c3c;
        }
        .toast-error i {
            color: #e74c3c;
        }
        .toast-info {
            border-left: 4px solid #3498db;
        }
        .toast-info i {
            color: #3498db;
        }
        
        /* Additional styles for manage petitions page */
        .manage-petitions-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px 20px;
        }
        
        .page-header {
            margin-bottom: 30px;
            text-align: center;
        }
        
        .page-header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            color: #333;
        }
        
        .page-header p {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
        }
        
        .page-actions {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }
        
        .page-actions a {
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
        }
        
        .petitions-management-wrapper {
            margin-top: 30px;
        }
        
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            text-align: center;
        }
        
        .empty-state i {
            font-size: 48px;
            color: #ccc;
            margin-bottom: 20px;
        }
        
        .empty-state h3 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
        }
        
        .empty-state p {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
            .page-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
} 