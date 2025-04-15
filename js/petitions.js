/**
 * Accountability SA - Petitions Module
 * Handles petition listing, filtering, signatures, and user interactions
 */

// Constants
const PETITIONS_STORAGE_KEY = 'accountabilitySA_petitions';
const SIGNATURES_STORAGE_KEY = 'accountabilitySA_signatures';
const SIGNATURE_DATES_KEY = 'accountabilitySA_signatureDates';

// Petition data for the platform
const defaultPetitions = [
    {
        id: 'petition-1',
        title: 'Support a 24/7 Economy for South Africa',
        summary: 'Advocating for policy changes to enable businesses to operate around the clock, creating more jobs and boosting economic growth.',
        description: `
            <p>South Africa's economy needs a major boost to create jobs and improve growth. One proven way to achieve this is by transitioning to a 24/7 economic model that allows businesses to operate continuously.</p>
            
            <p>A 24/7 economy would:</p>
            <ul>
                <li>Create more employment opportunities through multiple shifts</li>
                <li>Increase productivity and economic output</li>
                <li>Make services more accessible to citizens at all hours</li>
                <li>Allow South Africa to better compete in the global market</li>
                <li>Reduce traffic congestion by spreading commute times</li>
            </ul>
            
            <p>We call on the government to implement policies that support businesses operating around the clock, including:</p>
            <ul>
                <li>Tax incentives for businesses that operate multiple shifts</li>
                <li>Improved public transportation during night hours</li>
                <li>Enhanced security measures in business districts</li>
                <li>Streamlined regulations for night-time operations</li>
                <li>Support for worker welfare in night shifts</li>
            </ul>
            
            <p>By signing this petition, you're supporting an initiative that could transform South Africa's economy and create thousands of new jobs.</p>
        `,
        category: 'economy',
        target: 'Department of Trade, Industry and Competition',
        author: 'Accountability SA',
        authorType: 'organization',
        createdDate: '2024-03-03',
        deadline: '2099-12-31',
        goalSignatures: 10000,
        signatures: 0,
        image: 'images/petitions/24-7-economy.jpg',
        updates: [
            {
                date: '2024-03-03',
                title: 'Petition launched',
                content: 'We\'ve officially launched this petition on Accountability SA. Help us reach our target by sharing with friends and family!'
            }
        ]
    },
    {
        id: 'petition-2',
        title: 'Modern and Transparent Tender System',
        summary: 'Calling for a comprehensive reform of South Africa\'s government tender process to increase transparency, reduce corruption, and leverage technology for efficiency.',
        description: `
            <p>South Africa's public procurement system has long been plagued by corruption, inefficiency, and lack of transparency. We believe a complete overhaul of the tender system is necessary to ensure public funds are used effectively and ethically.</p>
            
            <p>Our petition calls for the following reforms:</p>
            <ul>
                <li>Implementation of a fully digital tender platform accessible to all citizens</li>
                <li>Real-time public access to all tender documentation and decision-making</li>
                <li>Blockchain-based verification of tender submissions and evaluations</li>
                <li>Mandatory disclosure of beneficial ownership for all companies bidding for tenders</li>
                <li>Independent oversight committee for high-value tenders</li>
                <li>Standardized evaluation criteria that minimizes subjective decision-making</li>
                <li>Regular public reporting on tender outcomes and performance</li>
            </ul>
            
            <p>A transparent tender system would:</p>
            <ul>
                <li>Save billions in public funds currently lost to corruption</li>
                <li>Improve the quality of service delivery to citizens</li>
                <li>Restore public trust in government institutions</li>
                <li>Create a level playing field for businesses of all sizes</li>
                <li>Attract more investment due to improved governance</li>
            </ul>
            
            <p>By signing this petition, you're helping to fight corruption and improve governance in South Africa.</p>
        `,
        category: 'governance',
        target: 'National Treasury and Parliament',
        author: 'Accountability SA',
        authorType: 'organization',
        createdDate: '2024-03-03',
        deadline: '2099-12-31',
        goalSignatures: 15000,
        signatures: 0,
        image: 'images/petitions/transparent-tenders.jpg',
        updates: [
            {
                date: '2024-03-03',
                title: 'Petition launched',
                content: 'We\'ve officially launched this petition on Accountability SA. Help us reach our target by sharing with friends and family!'
            }
        ]
    },
    {
        id: 'petition-3',
        title: 'Eliminate Taxes on Solar Energy Solutions',
        summary: 'Advocating for the removal of all taxes on solar panels, batteries, and installation to make renewable energy more accessible to all South Africans and reduce dependence on the national grid.',
        description: `
            <p>South Africa's energy crisis demands immediate and sustainable solutions. One of the most effective ways to address this is by making solar energy more accessible to all citizens through tax incentives and removing existing barriers.</p>
            
            <p>We call on the government to:</p>
            <ul>
                <li>Remove VAT on all solar panels, inverters, and battery systems</li>
                <li>Eliminate import duties on all renewable energy equipment</li>
                <li>Create tax incentives for households and businesses investing in solar power</li>
                <li>Simplify the process for connecting solar systems to the grid</li>
                <li>Provide subsidies for low-income households to access solar solutions</li>
                <li>Establish standards and certification for solar installers to ensure quality</li>
            </ul>
            
            <p>The benefits of this initiative would include:</p>
            <ul>
                <li>Reduced pressure on the national electricity grid</li>
                <li>Lower energy costs for households and businesses</li>
                <li>Decreased carbon emissions and environmental impact</li>
                <li>Job creation in the renewable energy sector</li>
                <li>Greater energy independence for South African citizens</li>
                <li>Accelerated transition to renewable energy sources</li>
            </ul>
            
            <p>By signing this petition, you're supporting a cleaner, more reliable energy future for South Africa and helping to address the ongoing electricity crisis.</p>
        `,
        category: 'environment',
        target: 'Department of Mineral Resources and Energy',
        author: 'Accountability SA',
        authorType: 'organization',
        createdDate: '2024-03-03',
        deadline: '2099-12-31',
        goalSignatures: 20000,
        signatures: 0,
        image: 'images/petitions/no-solar-tax.jpg',
        updates: [
            {
                date: '2024-03-03',
                title: 'Petition launched',
                content: 'We\'ve officially launched this petition on Accountability SA. Help us reach our target by sharing with friends and family!'
            }
        ]
    }
];

/**
 * PetitionsService class - provides methods for managing petitions
 */
class PetitionsService {
    /**
     * Initialize petitions data, loading from storage or defaults
     */
    static initializePetitions() {
        // Restore original logic: Load from localStorage if available, else use defaults.
        const storedPetitions = localStorage.getItem(PETITIONS_STORAGE_KEY);
        
        if (!storedPetitions) {
            // First time loading or localStorage cleared - set up default petitions
            console.log("No stored petitions found, initializing with defaults.");
            localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(defaultPetitions));
            return defaultPetitions;
        }
        
        // Load from storage
        try {
            const parsedPetitions = JSON.parse(storedPetitions);
            // Basic validation: Check if it's an array
            if (Array.isArray(parsedPetitions)) {
                return parsedPetitions;
            } else {
                console.error("Stored petition data is not an array. Re-initializing with defaults.");
                localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(defaultPetitions));
                return defaultPetitions;
            }
        } catch (error) {
            console.error("Error parsing stored petition data. Re-initializing with defaults.", error);
            localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(defaultPetitions));
            return defaultPetitions;
        }
    }
    
    /**
     * Get all petitions
     * @returns {Array} Array of petition objects
     */
    static getAllPetitions() {
        return this.initializePetitions();
    }
    
    /**
     * Get a petition by ID
     * @param {string} id - Petition ID
     * @returns {Object|null} Petition object or null if not found
     */
    static getPetitionById(id) {
        const petitions = this.getAllPetitions();
        return petitions.find(petition => petition.id === id) || null;
    }
    
    /**
     * Get petitions by category
     * @param {string} category - Category name
     * @returns {Array} Filtered array of petition objects
     */
    static getPetitionsByCategory(category) {
        if (category === 'all') {
            return this.getAllPetitions();
        }
        
        const petitions = this.getAllPetitions();
        return petitions.filter(petition => petition.category === category);
    }
    
    /**
     * Search petitions by text
     * @param {string} query - Search query
     * @returns {Array} Filtered array of petition objects
     */
    static searchPetitions(query) {
        const petitions = this.getAllPetitions();
        const lowerQuery = query.toLowerCase();
        
        return petitions.filter(petition => 
            petition.title.toLowerCase().includes(lowerQuery) ||
            petition.summary.toLowerCase().includes(lowerQuery) ||
            petition.category.toLowerCase().includes(lowerQuery) ||
            petition.target.toLowerCase().includes(lowerQuery)
        );
    }
    
    /**
     * Sort petitions by different criteria
     * @param {Array} petitions - Array of petitions to sort
     * @param {string} sortBy - Sorting criteria
     * @returns {Array} Sorted array of petitions
     */
    static sortPetitions(petitions, sortBy) {
        const petitionsCopy = [...petitions];
        
        switch (sortBy) {
            case 'newest':
                return petitionsCopy.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            case 'popular':
                return petitionsCopy.sort((a, b) => b.signatures - a.signatures);
            case 'closing-soon':
                return petitionsCopy.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            default:
                return petitionsCopy;
        }
    }
    
    /**
     * Calculate days left until petition deadline
     * @param {string} deadline - Deadline date string
     * @returns {number} Number of days left
     */
    static calculateDaysLeft(deadline) {
        // Return a long period for all petitions
        return 365; // Effectively removing time limits by setting all to a year
    }
    
    /**
     * Check if user has signed a petition
     * @param {string} petitionId - Petition ID
     * @param {string} userId - User ID
     * @returns {boolean} Whether user has signed
     */
    static hasUserSigned(petitionId, userId) {
        const signatures = this.getUserSignatures(userId);
        return signatures.includes(petitionId);
    }
    
    /**
     * Get all petitions a user has signed
     * @param {string} userId - User ID
     * @returns {Array} Array of petition IDs
     */
    static getUserSignatures(userId) {
        if (!userId) return [];
        
        const storedSignatures = localStorage.getItem(`${SIGNATURES_STORAGE_KEY}_${userId}`);
        return storedSignatures ? JSON.parse(storedSignatures) : [];
    }
    
    /**
     * Sign a petition
     * @param {string} petitionId - Petition ID
     * @param {string} userId - User ID
     * @param {string} reason - Optional reason for signing
     * @returns {number|false} The new signature count if successful, false otherwise
     */
    static signPetition(petitionId, userId, reason = '') {
        if (!userId || !petitionId) return false;
        
        // Check if already signed
        if (this.hasUserSigned(petitionId, userId)) {
            console.warn("Attempted to sign petition already signed by user.");
            return false;
        }
        
        // Add to user's signatures
        const signatures = this.getUserSignatures(userId);
        signatures.push(petitionId);
        localStorage.setItem(`${SIGNATURES_STORAGE_KEY}_${userId}`, JSON.stringify(signatures));
        
        // Store the signature date
        const signatureDatesKey = `${SIGNATURE_DATES_KEY}_${userId}`;
        const signatureDates = JSON.parse(localStorage.getItem(signatureDatesKey) || '{}');
        signatureDates[petitionId] = new Date().toISOString();
        localStorage.setItem(signatureDatesKey, JSON.stringify(signatureDates));
        
        // Update petition signature count
        const petitions = this.getAllPetitions();
        const petitionIndex = petitions.findIndex(p => p.id === petitionId);
        
        if (petitionIndex !== -1) {
            // Ensure signatures is treated as a number
            let currentSignatures = Number(petitions[petitionIndex].signatures) || 0;
            currentSignatures += 1;
            petitions[petitionIndex].signatures = currentSignatures;
            
            localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(petitions));
            console.log(`Petition ${petitionId} signed. New count: ${currentSignatures}`);
            
            // Return the new signature count
            return currentSignatures;
        } else {
             console.error(`Petition ${petitionId} not found for updating signature count.`);
             // Attempt to recover user signature list if petition update failed
             const userSignatures = this.getUserSignatures(userId);
             const userSigIndex = userSignatures.indexOf(petitionId);
             if (userSigIndex > -1) {
                 userSignatures.splice(userSigIndex, 1);
                 localStorage.setItem(`${SIGNATURES_STORAGE_KEY}_${userId}`, JSON.stringify(userSignatures));
                 console.warn("Rolled back user signature due to petition update failure.");
             }
             return false;
        }
    }
    
    /**
     * Unsign a petition
     * @param {string} petitionId - Petition ID
     * @param {string} userId - User ID
     * @returns {number|false} The new signature count if successful, false otherwise
     */
    static unsignPetition(petitionId, userId) {
        if (!userId || !petitionId) return false;
        
        // Check if user has actually signed
        const signatures = this.getUserSignatures(userId);
        const sigIndex = signatures.indexOf(petitionId);
        
        if (sigIndex === -1) {
            console.warn("Attempted to unsign petition not signed by user.");
            return false;
        }
        
        // Remove from user's signatures
        signatures.splice(sigIndex, 1);
        localStorage.setItem(`${SIGNATURES_STORAGE_KEY}_${userId}`, JSON.stringify(signatures));
        
        // Remove the signature date
        const signatureDatesKey = `${SIGNATURE_DATES_KEY}_${userId}`;
        const signatureDates = JSON.parse(localStorage.getItem(signatureDatesKey) || '{}');
        if (signatureDates[petitionId]) {
            delete signatureDates[petitionId];
            localStorage.setItem(signatureDatesKey, JSON.stringify(signatureDates));
        }
        
        // Update petition signature count
        const petitions = this.getAllPetitions();
        const petitionIndex = petitions.findIndex(p => p.id === petitionId);
        
        if (petitionIndex !== -1) {
            // Ensure signatures is treated as a number and decrement
            let currentSignatures = Number(petitions[petitionIndex].signatures) || 0;
            currentSignatures = Math.max(0, currentSignatures - 1); // Don't go below 0
            petitions[petitionIndex].signatures = currentSignatures;
            
            localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(petitions));
            console.log(`Petition ${petitionId} unsigned. New count: ${currentSignatures}`);
            
            // Return the new signature count
            return currentSignatures;
        } else {
             console.error(`Petition ${petitionId} not found for updating signature count during unsign.`);
             // Attempt to recover user signature list if petition update failed
             const userSignatures = this.getUserSignatures(userId);
             if (!userSignatures.includes(petitionId)) { // Check if it wasn't already removed
                 userSignatures.push(petitionId); // Add it back
                 localStorage.setItem(`${SIGNATURES_STORAGE_KEY}_${userId}`, JSON.stringify(userSignatures));
                 console.warn("Rolled back user signature addition due to petition update failure during unsign.");
             }
             return false;
        }
    }
    
    /**
     * Create a new petition
     * @param {Object} petitionData - Petition data
     * @param {string} userId - User ID of petition creator
     * @returns {Object} Created petition
     */
    static createPetition(petitionData, userId) {
        if (!userId) {
            console.error("Cannot create petition: User not logged in");
            return null;
        }
        
        const petitions = this.getAllPetitions();
        
        // Generate unique ID
        const id = 'petition-' + (petitions.length + 1);
        
        // Get exact current date and time in ISO format
        const now = new Date();
        const exactCreationDate = now.toISOString();
        const formattedDateForDisplay = now.toISOString().split('T')[0]; // YYYY-MM-DD format for display
        
        // Create new petition object
        const newPetition = {
            id,
            title: petitionData.title,
            summary: petitionData.summary,
            description: petitionData.description,
            category: petitionData.category,
            target: petitionData.target,
            author: petitionData.author,
            authorId: userId, // Store the creator's user ID 
            authorType: 'user',
            createdDate: formattedDateForDisplay, // For display
            exactCreationDate: exactCreationDate, // Store exact creation time for sorting and tracking
            deadline: petitionData.deadline,
            goalSignatures: parseInt(petitionData.goal, 10),
            signatures: 0,
            image: petitionData.image || `images/petitions/${petitionData.category}.jpg`,
            updates: [
                {
                    date: formattedDateForDisplay,
                    exactDate: exactCreationDate,
                    title: 'Petition created',
                    content: 'This petition has been created. Help it reach its goal by sharing with others!'
                }
            ]
        };
        
        // Add to petitions list
        petitions.push(newPetition);
        localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(petitions));
        
        // Store in user's created petitions list with exact creation date
        this.addToUserCreatedPetitions(userId, id, exactCreationDate);
        
        return newPetition;
    }
    
    /**
     * Add a petition to user's created petitions
     * @param {string} userId - User ID
     * @param {string} petitionId - Petition ID
     * @param {string} creationDate - Exact creation date in ISO format
     * @returns {boolean} Success status
     */
    static addToUserCreatedPetitions(userId, petitionId, creationDate) {
        if (!userId || !petitionId) return false;
        
        // Get user's created petitions 
        const CREATED_PETITIONS_KEY = 'accountabilitySA_createdPetitions';
        const storageKey = `${CREATED_PETITIONS_KEY}_${userId}`;
        
        // Store more detailed information about created petitions
        const CREATED_PETITIONS_DETAILS_KEY = 'accountabilitySA_createdPetitionsDetails';
        const detailsStorageKey = `${CREATED_PETITIONS_DETAILS_KEY}_${userId}`;
        
        // Get existing data
        const createdPetitionsJson = localStorage.getItem(storageKey);
        const createdPetitions = createdPetitionsJson ? JSON.parse(createdPetitionsJson) : [];
        
        const detailsJson = localStorage.getItem(detailsStorageKey);
        const details = detailsJson ? JSON.parse(detailsJson) : {};
        
        // Check if already in the list (shouldn't happen, but just in case)
        if (createdPetitions.includes(petitionId)) {
            return false;
        }
        
        // Add to user's created petitions
        createdPetitions.push(petitionId);
        localStorage.setItem(storageKey, JSON.stringify(createdPetitions));
        
        // Add detailed information
        details[petitionId] = {
            creationDate: creationDate || new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(detailsStorageKey, JSON.stringify(details));
        
        return true;
    }
    
    /**
     * Get petitions created by a user
     * @param {string} userId - User ID
     * @returns {Array} Array of petition IDs
     */
    static getUserCreatedPetitions(userId) {
        if (!userId) return [];
        
        const CREATED_PETITIONS_KEY = 'accountabilitySA_createdPetitions';
        const storedPetitions = localStorage.getItem(`${CREATED_PETITIONS_KEY}_${userId}`);
        return storedPetitions ? JSON.parse(storedPetitions) : [];
    }
    
    /**
     * Update an existing petition
     * @param {string} petitionId - ID of the petition to update
     * @param {Object} petitionData - Updated petition data
     * @returns {Object|null} Updated petition object or null if failed
     */
    static updatePetition(petitionId, petitionData) {
        try {
            // Get all petitions
            const petitions = this.getAllPetitions();
            
            // Find the petition to update
            const petitionIndex = petitions.findIndex(p => p.id === petitionId);
            if (petitionIndex === -1) {
                console.error(`Petition with ID ${petitionId} not found for update`);
                return null;
            }
            
            // Get the current petition data
            const currentPetition = petitions[petitionIndex];
            
            // Create updated petition object, keeping existing data that shouldn't change
            const updatedPetition = {
                ...currentPetition,
                title: petitionData.title,
                summary: petitionData.summary,
                description: petitionData.description,
                category: petitionData.category,
                target: petitionData.target,
                goalSignatures: parseInt(petitionData.goal) || currentPetition.goalSignatures || 1000,
                deadline: petitionData.deadline,
                image: petitionData.image,
                lastUpdated: new Date().toISOString()
            };
            
            // Add an update notification
            if (!updatedPetition.updates) {
                updatedPetition.updates = [];
            }
            
            updatedPetition.updates.push({
                date: new Date().toISOString(),
                title: 'Petition updated',
                content: 'The petition details have been updated by the creator.'
            });
            
            // Replace the old petition with the updated one
            petitions[petitionIndex] = updatedPetition;
            
            // Save back to storage
            localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(petitions));
            
            // Return the updated petition
            return updatedPetition;
        } catch (error) {
            console.error('Error updating petition:', error);
            return null;
        }
    }
    
    /**
     * Get total signature count across all petitions
     * @returns {number} Total signature count
     */
    static getTotalSignatureCount() {
        const petitions = this.getAllPetitions();
        return petitions.reduce((total, petition) => total + petition.signatures, 0);
    }
    
    /**
     * Get similar petitions to a given petition
     * @param {string} currentPetitionId - Current petition ID
     * @param {number} limit - Maximum number to return
     * @returns {Array} Array of similar petitions
     */
    static getSimilarPetitions(currentPetitionId, limit = 3) {
        const currentPetition = this.getPetitionById(currentPetitionId);
        if (!currentPetition) return [];
        
        const petitions = this.getAllPetitions();
        
        // Filter out current petition and get ones in same category
        const sameCategoryPetitions = petitions.filter(
            p => p.id !== currentPetitionId && p.category === currentPetition.category
        );
        
        // If we don't have enough in the same category, get some from other categories
        if (sameCategoryPetitions.length < limit) {
            const otherPetitions = petitions.filter(
                p => p.id !== currentPetitionId && p.category !== currentPetition.category
            );
            
            // Combine and limit
            return [...sameCategoryPetitions, ...otherPetitions].slice(0, limit);
        }
        
        return sameCategoryPetitions.slice(0, limit);
    }
    
    /**
     * Delete a petition from storage and user records
     * @param {string} petitionId - ID of the petition to delete
     * @param {string} userId - ID of the user deleting the petition
     * @returns {boolean} True if deletion was successful, false otherwise
     */
    static deletePetition(petitionId, userId) {
        try {
            // 1. Get all petitions
            const petitions = this.getAllPetitions();
            
            // 2. Filter out the petition to delete
            const initialLength = petitions.length;
            const updatedPetitions = petitions.filter(petition => petition.id !== petitionId);
            if (updatedPetitions.length === initialLength) {
                console.warn(`Petition with ID ${petitionId} not found in main list for deletion.`);
                // Still proceed to check user records
            }
            
            // 3. Save updated main petitions list
            localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(updatedPetitions));
            
            // 4. Remove from user's created petitions list
            const CREATED_PETITIONS_KEY = 'accountabilitySA_createdPetitions';
            const createdKey = `${CREATED_PETITIONS_KEY}_${userId}`;
            const createdPetitionsJson = localStorage.getItem(createdKey);
            if (createdPetitionsJson) {
                const createdPetitions = JSON.parse(createdPetitionsJson);
                const updatedCreated = createdPetitions.filter(id => id !== petitionId);
                localStorage.setItem(createdKey, JSON.stringify(updatedCreated));
            }
            
            // 5. Remove from user's created petitions details
            const CREATED_PETITIONS_DETAILS_KEY = 'accountabilitySA_createdPetitionsDetails';
            const detailsKey = `${CREATED_PETITIONS_DETAILS_KEY}_${userId}`;
            const detailsJson = localStorage.getItem(detailsKey);
            if (detailsJson) {
                const details = JSON.parse(detailsJson);
                if (details[petitionId]) {
                    delete details[petitionId];
                    localStorage.setItem(detailsKey, JSON.stringify(details));
                }
            }
            
            // 6. Optional: Remove from any user's signed list (might be complex/slow)
            // Consider if this is necessary. If a user signed it, maybe it should remain
            // in their signed list history but be marked as deleted?
            // For now, we'll skip this step to avoid iterating through all users.
            
            console.log(`Petition ${petitionId} deleted successfully by user ${userId}.`);
            return true;
            
        } catch (error) {
            console.error('Error deleting petition in PetitionsService:', error);
            return false;
        }
    }
}

// DOM manipulation functions for petitions page
document.addEventListener('DOMContentLoaded', function() {
    // TEMPORARY: Update petition images to use local files
    updatePetitionImages();
    
    // Check if we're on the petitions list page
    const petitionsListElement = document.getElementById('petitions-list');
    if (petitionsListElement) {
        initializePetitionsPage();
    }
    
    // Check for petition detail page
    const petitionHeroElement = document.getElementById('petition-hero');
    if (petitionHeroElement) {
        // Function is called in the HTML but defined here
        window.loadPetitionDetails = loadPetitionDetails;
    }
});

/**
 * TEMPORARY: Force update petition images in localStorage
 */
function updatePetitionImages() {
    // Clear existing petitions from localStorage to force using the defaults
    localStorage.removeItem(PETITIONS_STORAGE_KEY);
    console.log("Petition storage reset to use updated images");
}

/**
 * Initialize the petitions listing page
 */
function initializePetitionsPage() {
    // Initial stats update
    updatePetitionStats();
    
    // Render petitions
    applyFilters(); // Use applyFilters to handle initial rendering with default sort
    
    // Set up event listeners
    setupPetitionListEventListeners();
    
    // Check for edit query parameter
    checkEditMode();
}

/**
 * Update petition stats in the hero section
 */
function updatePetitionStats() {
    console.log("Updating petition stats...");
    try {
        const petitions = PetitionsService.getAllPetitions(); // Get current petition data
        const totalSignatures = PetitionsService.getTotalSignatureCount(); // Get latest total count
        
        const totalPetitionsElement = document.getElementById('total-petitions');
        const totalSignaturesElement = document.getElementById('total-signatures');
        // const successfulPetitionsElement = document.getElementById('successful-petitions'); // Assuming this might be used later
        
        if (totalPetitionsElement) {
            totalPetitionsElement.textContent = petitions.length;
        }
        if (totalSignaturesElement) {
            console.log("Updating total signatures display to:", totalSignatures);
            totalSignaturesElement.textContent = totalSignatures.toLocaleString(); // Format with commas
        }
        // if (successfulPetitionsElement) { ... }
    } catch (error) {
        console.error("Error updating petition stats:", error);
        // Optionally display an error to the user
    }
}

/**
 * Render the list of petitions
 * @param {Array} petitions - Array of petition objects
 */
function renderPetitionsList(petitions) {
    const petitionsListElement = document.getElementById('petitions-list');
    petitionsListElement.innerHTML = ''; // Clear previous list
    
    if (!petitions || petitions.length === 0) {
        petitionsListElement.innerHTML = `
            <div class="no-petitions-message">
                <i class="fas fa-file-signature"></i>
                <h3>No petitions found</h3>
                <p>Try adjusting your filters or search criteria.</p>
            </div>
        `;
        return;
    }
    
    petitions.forEach(petition => {
        const daysLeft = PetitionsService.calculateDaysLeft(petition.deadline);
        
        const petitionElement = document.createElement('div');
        petitionElement.className = 'petition-card';
        petitionElement.dataset.id = petition.id;
        petitionElement.dataset.category = petition.category;
        
        petitionElement.innerHTML = `
            <div class="petition-image">
                <img src="${petition.image}" alt="${petition.title}">
                <div class="petition-category ${petition.category}">${petition.category.charAt(0).toUpperCase() + petition.category.slice(1)}</div>
            </div>
            <div class="petition-content">
                <h3 class="petition-title">${petition.title}</h3>
                <p class="petition-description">${petition.summary}</p>
                <div class="petition-meta">
                    <div class="petition-signatures">
                        <i class="fas fa-signature"></i>
                        <span class="signature-count">${petition.signatures.toLocaleString()}</span> signatures
                    </div>
                </div>
                <a href="petition-detail.html?id=${petition.id}" class="btn-view-petition-card">View Details</a>
            </div>
        `;
        
        petitionsListElement.appendChild(petitionElement);
    });
}

/**
 * Set up event listeners for the petitions list page
 */
function setupPetitionListEventListeners() {
    // Clear any previous listeners to prevent duplicates
    window.removeEventListener('signatureAdded', handleSignatureUpdate);
    window.removeEventListener('signatureRemoved', handleSignatureUpdate); // Add listener for removal
    
    // Add listeners for signature updates
    window.addEventListener('signatureAdded', handleSignatureUpdate);
    window.addEventListener('signatureRemoved', handleSignatureUpdate); // Add listener for removal
    
    // Filter by category
    const filterCategory = document.getElementById('filter-category');
    if (filterCategory) {
        filterCategory.removeEventListener('change', applyFilters); // Remove previous if any
        filterCategory.addEventListener('change', applyFilters);
    }
    
    // Sort petitions
    const filterSort = document.getElementById('filter-sort');
    if (filterSort) {
        filterSort.removeEventListener('change', applyFilters); // Remove previous if any
        filterSort.addEventListener('change', applyFilters);
    }
    
    // Search petitions
    const searchBox = document.getElementById('petition-search');
    if (searchBox) {
        searchBox.removeEventListener('input', handleSearchInput); // Remove previous if any
        searchBox.addEventListener('input', handleSearchInput);
    }
    
    // Create petition button
    const createPetitionBtn = document.getElementById('btn-create-petition');
    if (createPetitionBtn) {
        createPetitionBtn.removeEventListener('click', handleCreatePetitionClick); // Remove previous if any
        createPetitionBtn.addEventListener('click', handleCreatePetitionClick);
    }
    
    // Cancel create petition
    const cancelPetitionBtn = document.getElementById('btn-cancel-petition');
    if (cancelPetitionBtn) {
        cancelPetitionBtn.removeEventListener('click', handleCancelPetitionClick); // Remove previous if any
        cancelPetitionBtn.addEventListener('click', handleCancelPetitionClick);
    }
    
    // Create petition form submission
    const createPetitionForm = document.getElementById('create-petition-form');
    if (createPetitionForm) {
        createPetitionForm.removeEventListener('submit', handleCreatePetitionSubmit); // Remove previous if any
        createPetitionForm.addEventListener('submit', handleCreatePetitionSubmit);
    }
    
    // Auth modal close button
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.removeEventListener('click', handleCloseModalClick); // Remove previous if any
        button.addEventListener('click', handleCloseModalClick);
    });
}

/**
 * Handle signature update event (both add and remove)
 */
function handleSignatureUpdate(event) {
    console.log(`'${event.type}' event received.`);
    updatePetitionStats(); // Update the hero stats
    applyFilters(); // Re-apply filters/sort to update counts on cards
}

/**
 * Handle search input with debounce
 */
let searchTimer;
function handleSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        applyFilters();
    }, 300);
}

/**
 * Handle create petition button click
 */
function handleCreatePetitionClick(e) {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    if (!user) {
        showAuthModal();
        return;
    }
    
    // Show form, set defaults, scroll
    document.getElementById('create-petition-section').style.display = 'block';
    const deadlineField = document.getElementById('petition-deadline');
    if (deadlineField) {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        deadlineField.setAttribute('min', minDate);
        const defaultDeadline = new Date(today);
        defaultDeadline.setDate(today.getDate() + 30);
        deadlineField.value = defaultDeadline.toISOString().split('T')[0];
    }
    const goalField = document.getElementById('petition-goal');
    if (goalField && !goalField.value) goalField.value = '1000';
    
    document.getElementById('create-petition-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Handle cancel petition button click
 */
function handleCancelPetitionClick() {
    document.getElementById('create-petition-section').style.display = 'none';
    document.getElementById('create-petition-form').reset();
}

/**
 * Handle create petition form submission
 */
function handleCreatePetitionSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const user = AuthService.getCurrentUser();
    if (!user) {
        showAuthModal();
        return;
    }

    // Convert form data to object
    const formData = {
        title: form.elements['petition-title'].value,
        category: form.elements['petition-category'].value,
        summary: form.elements['petition-summary'].value,
        description: form.elements['petition-description'].value,
        target: form.elements['petition-target'].value,
        goal: form.elements['petition-goal'].value,
        deadline: form.elements['petition-deadline'].value,
        author: user.name || 'Anonymous',
        image: '' // Will be set below if an image was uploaded
    };
        
    // Handle image upload if provided
    const imageFile = form.elements['petition-image'].files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.image = e.target.result;
            createPetitionWithImage(formData, user);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Use default image based on category
        formData.image = `images/petitions/${formData.category}.jpg`;
        createPetitionWithImage(formData, user);
    }
            }
            
/**
 * Create a petition with image data
 * @param {Object} formData - Petition data from form
 * @param {Object} user - Current user
 */
function createPetitionWithImage(formData, user) {
    try {
        const newPetition = PetitionsService.createPetition(formData, user.id);
        if (newPetition) {
            // Close create petition form
            document.getElementById('create-petition-section').style.display = 'none';
            document.getElementById('create-petition-form').reset();
            
            // Show success message
            showSuccessMessage(`Your petition "${newPetition.title}" has been created!`);
            
            // Update petition list
            applyFilters();
            
            // Update stats
            updatePetitionStats();
            
            // Trigger event for dashboard updates
            const event = new CustomEvent('petitionCreated', {
                detail: {
                    petitionId: newPetition.id,
                    userId: user.id
                }
            });
            window.dispatchEvent(event);
            
            // Scroll to the top to see notification
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showErrorMessage('Failed to create petition. Please try again.');
        }
    } catch (error) {
        console.error('Error creating petition:', error);
        showErrorMessage('An error occurred while creating your petition.');
    }
}

/**
 * Handle close modal button click
 */
function handleCloseModalClick() {
    document.getElementById('auth-modal').classList.remove('show');
}

/**
 * Apply current filters and sorting, then render the list
 */
function applyFilters() {
    const category = document.getElementById('filter-category')?.value || 'all';
    const sortBy = document.getElementById('filter-sort')?.value || 'newest';
    const searchQuery = document.getElementById('petition-search')?.value || '';
    
    let filteredPetitions = PetitionsService.getAllPetitions();
    
    // Apply search
    if (searchQuery) {
        filteredPetitions = PetitionsService.searchPetitions(searchQuery);
    }
    
    // Apply category filter
    if (category !== 'all') {
        filteredPetitions = filteredPetitions.filter(p => p.category === category);
    }
    
    // Apply sorting
    filteredPetitions = PetitionsService.sortPetitions(filteredPetitions, sortBy);
    
    // Render the filtered and sorted list
    renderPetitionsList(filteredPetitions);
}

/**
 * Show authentication required modal
 */
function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('show');
    }
}

/**
 * Show success popup after petition creation
 */
function showSuccessPopup(newPetition) {
    const successMessage = document.createElement('div');
    successMessage.className = 'petition-success-message';
    successMessage.innerHTML = `
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <h3>Petition Created Successfully!</h3>
        <p>Your petition "${newPetition.title}" has been created and is now live.</p>
        <div class="success-actions">
            <a href="petition-detail.html?id=${newPetition.id}" class="btn-view-petition">View Your Petition</a>
            <a href="account.html?tab=contributions" class="btn-view-dashboard">Go to Dashboard</a>
            <button class="btn-close-popup">Close</button>
        </div>
    `;
    document.body.appendChild(successMessage);

    // Add close functionality
    successMessage.querySelector('.btn-close-popup').addEventListener('click', () => {
        successMessage.remove();
    });
    
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);
    
    // Auto-close after some time (e.g., 7 seconds)
    setTimeout(() => {
         if (document.body.contains(successMessage)) { // Check if it hasn't been closed manually
             successMessage.remove();
         }
    }, 7000);
}

/**
 * Load petition details on the detail page
 */
function loadPetitionDetails() {
    // Get petition ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const petitionId = urlParams.get('id');
    
    if (!petitionId) {
        window.location.href = 'petitions.html';
        return;
    }
    
    // Get petition data
    const petition = PetitionsService.getPetitionById(petitionId);
    
    if (!petition) {
        window.location.href = 'petitions.html';
        return;
    }
    
    // Update page title
    document.title = `${petition.title} | Accountability SA`;
    
    // Update breadcrumb
    document.getElementById('petition-title-bread').textContent = petition.title;
    
    // Render petition hero
    renderPetitionHero(petition);
    
    // Render petition description
    document.getElementById('petition-description').innerHTML = petition.description;
    
    // Update signature count and progress
    updateSignatureProgress(petition);
    
    // Render updates
    renderPetitionUpdates(petition);
    
    // Check if user has signed
    checkUserSignedStatus(petitionId);
    
    // Show author information
    updateAuthorInfo(petition);
    
    // Setup event listeners
    setupDetailPageEventListeners(petition);
}

/**
 * Render the petition hero section
 * @param {Object} petition - Petition object
 */
function renderPetitionHero(petition) {
    const heroElement = document.getElementById('petition-hero');
    
    // Add category class to the hero element for styling
    heroElement.className = 'petition-hero'; // Reset classes first
    heroElement.classList.add(petition.category);
    
    heroElement.innerHTML = `
        <img src="${petition.image}" alt="${petition.title}" class="petition-hero-image">
        <div class="petition-hero-overlay">
            <h1 class="petition-hero-title">${petition.title}</h1>
            <p class="petition-hero-summary">${petition.summary}</p>
        </div>
        <div class="petition-hero-category ${petition.category}">
            ${petition.category.charAt(0).toUpperCase() + petition.category.slice(1)}
        </div>
    `;
}

/**
 * Update signature progress display
 * @param {Object} petition - Petition object
 * @param {number|null} explicitSignatureCount - Optional: Pass the latest count directly
 */
function updateSignatureProgress(petition, explicitSignatureCount = null) {
    // Use explicit count if provided, otherwise use count from petition object
    const signatures = explicitSignatureCount !== null ? explicitSignatureCount : petition.signatures;
    const goal = petition.goalSignatures;
    // Ensure goal is a number to prevent NaN progress
    const numericGoal = Number(goal) || 0;
    const progress = numericGoal > 0 ? (signatures / numericGoal) * 100 : 0;
    
    console.log(`Updating progress display: Signatures=${signatures}, Goal=${numericGoal}, Progress=${progress}%`);
    
    // Update counts
    const sigCountElement = document.getElementById('signatures-count');
    const goalElement = document.getElementById('signatures-goal');
    
    if(sigCountElement) {
        sigCountElement.textContent = signatures.toLocaleString(); // Format count
    }
    if(goalElement) {
        goalElement.textContent = numericGoal.toLocaleString(); // Format goal
    }
    
    // Update progress bar
    const progressBar = document.getElementById('petition-progress');
    if(progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
    
    // Update deadline
    const deadlineInfo = document.getElementById('deadline-info');
    const daysLeftElement = document.getElementById('days-left');
    if (deadlineInfo && daysLeftElement) {
        const daysLeft = PetitionsService.calculateDaysLeft(petition.deadline);
        daysLeftElement.textContent = daysLeft;
        deadlineInfo.textContent = daysLeft === 0 ? 'Closing today' : `Closing in ${daysLeft} days`;
    }
}

/**
 * Render petition updates
 * @param {Object} petition - Petition object
 */
function renderPetitionUpdates(petition) {
    const updatesElement = document.getElementById('petition-updates-list');
    updatesElement.innerHTML = '';
    
    if (!petition.updates || petition.updates.length === 0) {
        updatesElement.innerHTML = '<p>No updates have been posted for this petition yet.</p>';
        return;
    }
    
    petition.updates.forEach(update => {
        let updateDateString;
        if (update.title === 'Petition launched' || update.title === 'Petition created') {
            updateDateString = petition.createdDate;
        } else {
            updateDateString = update.date;
        }
        
        const date = new Date(updateDateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        
        const updateElement = document.createElement('div');
        updateElement.className = 'petition-update';
        updateElement.innerHTML = `
            <div class="update-date">
                <div class="update-day">${day}</div>
                <div class="update-month">${month}</div>
            </div>
            <div class="update-content">
                <h3>${update.title}</h3>
                <p>${update.content}</p>
            </div>
        `;
        
        updatesElement.appendChild(updateElement);
    });
}

/**
 * Check user signed status and update the UI accordingly
 * @param {string} petitionId - ID of the petition to check
 */
function checkUserSignedStatus(petitionId) {
    const user = AuthService.getCurrentUser();
    
    if (!user) {
        // User not logged in - show auth required for signing
        document.getElementById('sign-auth-required').style.display = 'block';
        document.getElementById('petition-already-signed').style.display = 'none';
        document.getElementById('sign-petition-form').style.display = 'none';
        
        return;
    }
    
    // User is logged in - check if they've signed
    const hasSigned = PetitionsService.hasUserSigned(petitionId, user.id);
    
    if (hasSigned) {
        // User has signed - show already signed message
        document.getElementById('sign-auth-required').style.display = 'none';
        document.getElementById('petition-already-signed').style.display = 'block';
        document.getElementById('sign-petition-form').style.display = 'none';
    } else {
        // User hasn't signed - show sign form
        document.getElementById('sign-auth-required').style.display = 'none';
        document.getElementById('petition-already-signed').style.display = 'none';
        document.getElementById('sign-petition-form').style.display = 'block';
    }
}

/**
 * Set up event listeners for the petition detail page
 * @param {Object} petition - Petition object
 */
function setupDetailPageEventListeners(petition) {
    // Sign petition form
    const signForm = document.getElementById('sign-petition-form');
    if (signForm) {
        // Remove previous listener if any to prevent duplicates
        signForm.removeEventListener('submit', handleSignSubmit);
        // Add a named handler for easier removal/management
        signForm.addEventListener('submit', handleSignSubmit);
    }
    
    // Unsign button
    const unsignButton = document.querySelector('.btn-unsign-petition');
    if (unsignButton) {
        unsignButton.removeEventListener('click', handleUnsignSubmit);
        unsignButton.addEventListener('click', handleUnsignSubmit);
    }
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        // Remove previous listener if any
        button.removeEventListener('click', handleShareClick);
        // Add named handler
        button.addEventListener('click', handleShareClick);
    });
    
    // Success modal close
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        const closeBtn = successModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.removeEventListener('click', handleCloseSuccessModal);
            closeBtn.addEventListener('click', handleCloseSuccessModal);
        }
        
        successModal.removeEventListener('click', handleCloseSuccessModalOutside);
        successModal.addEventListener('click', handleCloseSuccessModalOutside);
    }
}

// Named event handler for signing submission
function handleSignSubmit(e) {
    e.preventDefault();
    const petitionId = new URLSearchParams(window.location.search).get('id');
    if (!petitionId) return;

    const user = AuthService.getCurrentUser();
    if (!user) {
        showAuthModal();
        return;
    }

    const reason = document.getElementById('sign-reason').value;
    // Capture the returned new signature count (or false)
    const newSignatureCount = PetitionsService.signPetition(petitionId, user.id, reason);

    if (newSignatureCount !== false) {
        // 1. Get petition data (needed for goal, deadline etc.)
        const currentPetitionData = PetitionsService.getPetitionById(petitionId);
        if (!currentPetitionData) {
            console.error("Failed to fetch petition data after signing.");
            // Maybe show a generic success message but indicate potential display issue
            alert("Signature recorded, but there was an issue refreshing petition details.");
            return; 
        }
        
        // 2. Update UI elements on this page, passing the explicit new count
        checkUserSignedStatus(petitionId); // Shows the 'already signed' message
        updateSignatureProgress(currentPetitionData, newSignatureCount); // Pass explicit count
        
        // 3. Show success confirmation
        showSuccessModal();
        
        // 4. Dispatch event *after* UI update on this page is complete
        console.log("Dispatching signatureAdded event from detail page.");
        window.dispatchEvent(new CustomEvent('signatureAdded'));
        
    } else {
        // Handle potential signing failure (e.g., already signed)
        alert("Failed to record signature. You may have already signed this petition.");
    }
}

// Named event handler for unsigning submission
function handleUnsignSubmit(e) {
    e.preventDefault();
    const petitionId = new URLSearchParams(window.location.search).get('id');
    if (!petitionId) return;

    const user = AuthService.getCurrentUser();
    if (!user) {
        showAuthModal(); // Should technically not happen if button is shown, but good practice
        return;
    }
    
    if (!confirm('Are you sure you want to remove your signature from this petition?')) {
        return; // User cancelled
    }

    // Capture the returned new signature count (or false)
    const newSignatureCount = PetitionsService.unsignPetition(petitionId, user.id);

    if (newSignatureCount !== false) {
        // 1. Get petition data (needed for goal, deadline etc.)
        const currentPetitionData = PetitionsService.getPetitionById(petitionId);
        if (!currentPetitionData) {
            console.error("Failed to fetch petition data after unsigning.");
            alert("Signature removed, but there was an issue refreshing petition details.");
            return; 
        }
        
        // 2. Update UI elements on this page, passing the explicit new count
        checkUserSignedStatus(petitionId); // Shows the sign form again
        updateSignatureProgress(currentPetitionData, newSignatureCount); // Pass explicit count
        
        // 3. Dispatch event *after* UI update on this page is complete
        console.log("Dispatching signatureRemoved event from detail page.");
        window.dispatchEvent(new CustomEvent('signatureRemoved'));
        
        // Optionally show a confirmation message (though UI change is usually enough)
        // alert("Your signature has been removed.");
        
    } else {
        // Handle potential unsigning failure
        alert("Failed to remove signature. Please try again.");
    }
}

// Named event handler for share button clicks
function handleShareClick(e) {
    e.preventDefault();
    const petitionId = new URLSearchParams(window.location.search).get('id');
    const petition = PetitionsService.getPetitionById(petitionId);
    if (!petition) return;
    
    const petitionUrl = window.location.href;
    const petitionTitle = petition.title;
    const button = e.currentTarget; // Use currentTarget
    
    if (button.classList.contains('facebook')) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(petitionUrl)}`, '_blank');
    } else if (button.classList.contains('twitter')) {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(petitionTitle)}&url=${encodeURIComponent(petitionUrl)}`, '_blank');
    } else if (button.classList.contains('whatsapp')) {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(petitionTitle + ' ' + petitionUrl)}`, '_blank');
    } else if (button.classList.contains('email')) {
        window.location.href = `mailto:?subject=${encodeURIComponent('Check out this petition: ' + petitionTitle)}&body=${encodeURIComponent('I thought you might be interested in this petition: ' + petitionUrl)}`;
    }
}

// Named event handler for closing success modal via button
function handleCloseSuccessModal() {
    document.getElementById('success-modal').classList.remove('show');
}

// Named event handler for closing success modal by clicking outside
function handleCloseSuccessModalOutside(e) {
    if (e.target === document.getElementById('success-modal')) {
        document.getElementById('success-modal').classList.remove('show');
    }
}

/**
 * Show the success modal after signing
 */
function showSuccessModal() {
    const successModal = document.getElementById('success-modal');
    successModal.classList.add('show');
}

/**
 * Update author information in the author card
 * @param {Object} petition - Petition object
 */
function updateAuthorInfo(petition) {
    const authorElement = document.getElementById('petition-author');
    const authorDescElement = document.querySelector('.author-description');
    const authorImageElement = document.querySelector('.author-image');
    
    if (authorElement) {
        authorElement.textContent = petition.author;
    }
    
    if (authorDescElement) {
        if (petition.authorType === 'user') {
            authorDescElement.textContent = `This petition was started by ${petition.author}, a concerned citizen of South Africa.`;
            
            // Try to get user profile image if available (would be implemented in a real system)
            if (authorImageElement) {
                authorImageElement.src = 'images/avatars/default.jpg';
            }
        } else {
            // Organization petition
            authorDescElement.textContent = `This petition is an official initiative of Accountability SA, an organization dedicated to transparency and governance improvement in South Africa.`;
            
            if (authorImageElement) {
                authorImageElement.src = 'images/logo.png';
            }
        }
    }
}

/**
 * Check if we're in edit mode and load petition data if so
 */
function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editPetitionId = urlParams.get('edit');
    
    if (editPetitionId) {
        // Get the petition
        const petition = PetitionsService.getPetitionById(editPetitionId);
        if (!petition) {
            console.error('Petition not found for editing:', editPetitionId);
            return;
        }
        
        // Check if current user is the creator
        const user = AuthService.getCurrentUser();
        if (!user || user.id !== petition.createdBy) {
            alert('You do not have permission to edit this petition.');
            return;
        }
        
        // Show the form section and scroll to it
        const createSection = document.getElementById('create-petition-section');
        if (createSection) {
            createSection.style.display = 'block';
            setTimeout(() => {
                createSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            // Update form title to indicate edit mode
            const formTitle = createSection.querySelector('h2');
            if (formTitle) {
                formTitle.textContent = 'Edit Your Petition';
            }
            
            // Update submit button text
            const submitBtn = document.getElementById('create-petition-form').querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Petition';
            }
            
            // Store the petition ID for update
            document.getElementById('create-petition-form').setAttribute('data-edit-id', editPetitionId);
            
            // Populate form with petition data
            populateEditForm(petition);
        }
    }
}

/**
 * Populate the petition form with data for editing
 * @param {Object} petition - The petition to edit
 */
function populateEditForm(petition) {
    // Basic fields
    document.getElementById('petition-title').value = petition.title || '';
    document.getElementById('petition-summary').value = petition.summary || '';
    document.getElementById('petition-category').value = petition.category || 'other';
    document.getElementById('petition-target').value = petition.target || '';
    document.getElementById('petition-goal').value = petition.goalSignatures || petition.goal || 1000;
    
    // Handle the description (strip HTML tags if needed)
    const descriptionField = document.getElementById('petition-description');
    if (descriptionField) {
        // If description contains HTML, convert to plain text
        if (petition.description.includes('<')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = petition.description;
            descriptionField.value = tempDiv.textContent || tempDiv.innerText || '';
        } else {
            descriptionField.value = petition.description;
        }
    }
    
    // Set deadline
    const deadlineField = document.getElementById('petition-deadline');
    if (deadlineField && petition.deadline) {
        deadlineField.value = petition.deadline.split('T')[0];
    }
    
    // Display current image if available
    if (petition.image) {
        const imagePreview = document.getElementById('petition-image-preview');
        if (imagePreview) {
            imagePreview.src = petition.image;
            imagePreview.style.display = 'block';
            
            // Add a label indicating current image
            const imageLabel = document.createElement('div');
            imageLabel.className = 'current-image-label';
            imageLabel.textContent = 'Current Image (Upload a new one to replace)';
            imageLabel.style.marginTop = '5px';
            imageLabel.style.fontSize = '14px';
            imageLabel.style.color = '#666';
            
            const imageContainer = document.getElementById('petition-image-container');
            if (imageContainer) {
                // Remove any existing label first
                const existingLabel = imageContainer.querySelector('.current-image-label');
                if (existingLabel) {
                    existingLabel.remove();
                }
                imageContainer.appendChild(imageLabel);
            }
        }
    }
}

/**
 * Helper function to update petition and show success message
 */
function updateAndShowPetition(petitionId, formData, user, form, submitBtn, originalBtnText) {
    const updatedPetition = PetitionsService.updatePetition(petitionId, formData);
    if (!updatedPetition) throw new Error('Failed to update petition. Please try again.');

    // Success
    form.reset();
    // Remove the edit ID attribute
    form.removeAttribute('data-edit-id');
    
    // Reset form title and submit button text
    const formTitle = document.getElementById('create-petition-section').querySelector('h2');
    if (formTitle) {
        formTitle.textContent = 'Create a Petition';
    }
    
    submitBtn.textContent = 'Create Petition';
    
    document.getElementById('create-petition-section').style.display = 'none';
    
    // Show success message
    alert('Petition updated successfully!');
    
    // Clear edit parameter from URL without page reload
    const url = new URL(window.location);
    url.searchParams.delete('edit');
    window.history.pushState({}, '', url);
    
    initializePetitionsPage(); // Refresh list and stats
    
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
}

// Export the PetitionsService for use in other files
window.PetitionsService = PetitionsService; 