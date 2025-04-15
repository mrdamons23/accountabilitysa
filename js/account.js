document.addEventListener('DOMContentLoaded', () => {
    // Ensure user is logged in (AuthService handles redirect)
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Define signature dates key constant if it doesn't exist in global scope
    const SIGNATURE_DATES_KEY = window.SIGNATURE_DATES_KEY || 'accountabilitySA_signatureDates';

    // Hide Comments section since it's not implemented yet
    const commentsContainer = document.querySelector('.dashboard-card.blue');
    if (commentsContainer) {
        commentsContainer.style.display = 'none';
    }

    // --- Add Sentiment Vote Listener --- 
    console.log('Setting up sentiment vote change listener on account page');
    
    // Function to handle sentiment vote change events
    function handleSentimentVoteChange(event) {
        console.log('Account Page: Detected sentimentVoteChanged event', event.detail);
        // Re-load activity to reflect the new vote
        if (user && user.id === event.detail.userId) { // Ensure it's the current user's vote
            console.log('Updating user activity with new sentiment vote');
            loadUserActivity(user.id);
            
            // Also update dashboard counts
            updateDashboardCounts(user.id);
        }
    }
    
    // Remove any existing event listener to avoid duplicates
    document.removeEventListener('sentimentVoteChanged', handleSentimentVoteChange);
    
    // Add the event listener
    document.addEventListener('sentimentVoteChanged', handleSentimentVoteChange);
    // --- End Sentiment Vote Listener ---

    // --- Add Petition Created Listener ---
    function handlePetitionCreated(event) {
        console.log('Account Page: Detected petitionCreated event', event.detail);
        if (user && user.id === event.detail.userId) {
            console.log('Updating user activity with new petition');
            loadUserActivity(user.id);
            
            // Update dashboard counts
            updateDashboardCounts(user.id);
        }
    }
    
    // Remove any existing event listener to avoid duplicates
    window.removeEventListener('petitionCreated', handlePetitionCreated);
    
    // Add the event listener
    window.addEventListener('petitionCreated', handlePetitionCreated);
    // --- End Petition Created Listener ---
    
    // --- Add Petition Deleted Listener ---
    function handlePetitionDeleted(event) {
        console.log('Account Page: Detected petitionDeleted event', event.detail);
        if (user && user.id === event.detail.userId) {
            console.log('Updating user activity after petition deletion');
            loadUserActivity(user.id);
            
            // Update dashboard counts
            updateDashboardCounts(user.id);
            
            // Update the total petitions count on the petitions page if applicable
            const totalPetitionsElement = document.getElementById('total-petitions');
            if (totalPetitionsElement && window.location.pathname.includes('petitions.html')) {
                const allPetitions = PetitionsService.getAllPetitions();
                totalPetitionsElement.textContent = allPetitions.length;
            }
        }
    }
    
    // Remove any existing event listener to avoid duplicates
    window.removeEventListener('petitionDeleted', handlePetitionDeleted);
    
    // Add the event listener
    window.addEventListener('petitionDeleted', handlePetitionDeleted);
    // --- End Petition Deleted Listener ---

    // Selectors
    const accountForm = document.getElementById('account-form');
    const passwordForm = document.getElementById('password-form');
    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePicDisplay = document.getElementById('profile-pic-display');
    const errorContainer = document.getElementById('account-error-container');
    const passwordErrorContainer = document.getElementById('password-error-container');
    const tabs = document.querySelectorAll('.tab-link');
    const sections = document.querySelectorAll('.profile-section');
    const signedPetitionsList = document.getElementById('signed-petitions-list');
    const createdPetitionsList = document.getElementById('created-petitions-list');
    const noSignedPetitions = document.getElementById('no-signed-petitions');
    const noCreatedPetitions = document.getElementById('no-created-petitions');
    const dashboardPetitionsValue = document.getElementById('dashboard-petitions');
    const dashboardCommentsValue = document.getElementById('dashboard-comments');
    const dashboardTrackedValue = document.getElementById('dashboard-tracked');
    const dashboardReportsValue = document.getElementById('dashboard-reports');
    const dashboardActivity = document.getElementById('dashboard-activity');

    // Load user data into form
    loadUserData(user);
    setupTabNavigation();
    updateDashboardCounts(user.id);
    loadUserActivity(user.id);
    setupDonationSystem(); // Initialize donation system

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('data-tab');
            showSection(targetId);
            history.pushState(null, null, `#${targetId}`);

            if (targetId === 'contributions') {
                loadUserContributions(user);
                setupContributionSubTabs(); // Setup sub-tabs when contributions tab is clicked
            }
        });
    });

    // Check for URL hash or query param to activate a specific tab
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab') || window.location.hash.substring(1);
    if (requestedTab) {
        const targetTab = document.querySelector(`.tab-link[data-tab="${requestedTab}"]`);
        if (targetTab) {
            targetTab.click();
        }
    } else {
        // Default to profile tab if none specified
        document.querySelector('.tab-link[data-tab="profile"]').click();
    }

    // Profile update form submission
    if (accountForm) {
        accountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateUserProfile(accountForm, errorContainer);
        });
    }

    // Password change form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateUserPassword(passwordForm, passwordErrorContainer);
        });
    }

    // Profile picture upload
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }

    // Function to load user data into forms
    function loadUserData(userData) {
        // Sidebar/Header potentially (ensure IDs match HTML)
        const sidebarName = document.getElementById('sidebar-name');
        const sidebarEmail = document.getElementById('sidebar-email');
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        if(sidebarName) sidebarName.textContent = userData.name || 'User Name';
        if(sidebarEmail) sidebarEmail.textContent = userData.email || 'user@example.com';
        if(sidebarAvatar) sidebarAvatar.src = userData.avatar || 'images/avatars/default.jpg';
        
        // Form fields (assuming IDs match HTML)
        const profileNameInput = document.getElementById('profile-name');
        const profileEmailInput = document.getElementById('profile-email');
        const profileProvinceSelect = document.getElementById('profile-province');
        const profilePicPreview = document.getElementById('profile-avatar-preview');

        if (profileNameInput) profileNameInput.value = userData.name || '';
        if (profileEmailInput) profileEmailInput.value = userData.email || '';
        if (profileProvinceSelect) profileProvinceSelect.value = userData.province || '';
        if (profilePicPreview) profilePicPreview.src = userData.avatar || 'images/avatars/default.jpg';

        // Update header dropdown details if elements exist
         const headerUserName = document.getElementById('user-name-header');
         const headerAvatar = document.getElementById('user-avatar-header');
         const dropdownUserName = document.getElementById('dropdown-user-name');
         const dropdownUserEmail = document.getElementById('dropdown-user-email');
 
         if(headerUserName) headerUserName.textContent = (userData.name || 'Account').split(' ')[0];
         if(headerAvatar) headerAvatar.src = userData.avatar || 'images/avatars/default.jpg';
         if(dropdownUserName) dropdownUserName.textContent = userData.name || 'User Name';
         if(dropdownUserEmail) dropdownUserEmail.textContent = userData.email || 'user@example.com';
    }

    // Function to render activity items in the UI
    function renderActivityItems(activityItems) {
        const dashboardActivity = document.getElementById('dashboard-activity');
        if (!dashboardActivity) return;

        dashboardActivity.innerHTML = '';
        
        // Ensure all activities have valid Date objects
        activityItems.forEach(activity => {
            if (!(activity.date instanceof Date)) {
                activity.date = new Date(activity.date);
            }
            
            // Handle invalid dates by setting to current time
            if (isNaN(activity.date.getTime())) {
                activity.date = new Date();
            }
        });
        
        // Sort all activities by date (oldest first for true chronological order)
        const sortedActivities = activityItems.sort((a, b) => {
            // Sort by date (oldest first)
            return a.date.getTime() - b.date.getTime();
        }).slice(0, 10); // Show only latest 10 activities
        
        if (sortedActivities.length === 0) {
            dashboardActivity.innerHTML = `
                <li class="activity-item">
                    <div class="activity-date">-</div>
                    <div class="activity-content">No activity recorded yet.</div>
                </li>
            `;
            return;
        }
        
        // Create HTML for each activity item
        sortedActivities.forEach(activity => {
            const date = activity.date;
            
            // Format date: Today, Yesterday, or date
            let dateText;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (date.toDateString() === today.toDateString()) {
                dateText = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateText = 'Yesterday';
            } else {
                dateText = date.toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }
            
            // Add time to the date
            dateText += ` at ${date.toLocaleTimeString('en-ZA', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
            
            // Create the activity item element
            const activityItem = document.createElement('li');
            activityItem.className = `activity-item ${activity.type || ''}`;
            
            // Add image if available
            let imageHtml = '';
            if (activity.image) {
                imageHtml = `<div class="activity-image">
                    <img src="${activity.image}" alt="Activity image" onerror="this.style.display='none'">
                </div>`;
            }
            
            // Add content with link if available
            let contentHtml = activity.content;
            if (activity.link) {
                contentHtml = `<a href="${activity.link}">${activity.content}</a>`;
            }
            
            activityItem.innerHTML = `
                <div class="activity-date">${dateText}</div>
                ${imageHtml}
                <div class="activity-content">${contentHtml}</div>
            `;
            
            dashboardActivity.appendChild(activityItem);
        });
    }

    // Function to load user activity
    function loadUserActivity(userId) {
        if (!dashboardActivity) return;
        
        console.log(`Loading user activity for user: ${userId}`);
        // Clear loading placeholder
        dashboardActivity.innerHTML = '';
        
        // Array to store activity items
        const activityItems = [];
        
        // Track when user created their account
        const user = AuthService.getCurrentUser();
        if (user && user.registrationDate) {
            const regDate = new Date(user.registrationDate);
            activityItems.push({
                date: regDate,
                content: 'Account created',
                type: 'account',
                importance: 15 // Very important
            });
        }
        
        // Add created petitions to activity
        if (typeof PetitionsService !== 'undefined' && PetitionsService.getUserCreatedPetitions) {
            try {
                const createdPetitionIds = PetitionsService.getUserCreatedPetitions(userId);
                const allPetitions = PetitionsService.getAllPetitions();
                
                // Get detailed information about creation dates
                const CREATED_PETITIONS_DETAILS_KEY = 'accountabilitySA_createdPetitionsDetails';
                const detailsJson = localStorage.getItem(`${CREATED_PETITIONS_DETAILS_KEY}_${userId}`);
                const petitionDetails = detailsJson ? JSON.parse(detailsJson) : {};
                
                createdPetitionIds.forEach(petitionId => {
                    const petition = allPetitions.find(p => p.id === petitionId);
                    if (petition) {
                        // Use the most precise time available, prioritizing the detailed tracking
                        const creationDate = (petitionDetails[petitionId] && petitionDetails[petitionId].creationDate) || 
                                           petition.exactCreationDate || petition.createdDate;
                        
                        // Make sure we have a valid date by converting string to Date
                        const activityDate = new Date(creationDate);
                        
                        // Only add to activity if we have a valid date
                        if (!isNaN(activityDate.getTime())) {
                            activityItems.push({
                                date: activityDate,
                                content: `Created petition: ${petition.title}`,
                                type: 'petition-created',
                                link: `petition-detail.html?id=${petition.id}`,
                                image: petition.image,
                                importance: 10 // Give creation higher importance for sorting
                            });
                        }
                    }
                });
            } catch (error) {
                console.error("Error loading created petitions for activity:", error);
            }
        }
        
        // Add signature activity using PetitionsService
        if (typeof PetitionsService !== 'undefined' && PetitionsService.getUserSignatures) {
            try {
                const signedPetitionIds = PetitionsService.getUserSignatures(userId);
                const allPetitions = PetitionsService.getAllPetitions();
                
                // Get signature dates from localStorage using the shared constant key
                const signatureDatesKey = typeof SIGNATURE_DATES_KEY !== 'undefined' 
                    ? `${SIGNATURE_DATES_KEY}_${userId}`
                    : `accountabilitySA_signatureDates_${userId}`;
                    
                let signatureDates = JSON.parse(localStorage.getItem(signatureDatesKey) || '{}');
                let shouldUpdateStorage = false;
                
                signedPetitionIds.forEach((petitionId, index) => {
                    const petition = allPetitions.find(p => p.id === petitionId);
                    if (petition) {
                        // If we don't have a stored date for this signature, handle fallback
                        if (!signatureDates[petitionId]) {
                            // **FIX:** Assign the registration date as the fallback for old signatures
                            const registrationDate = user.registrationDate ? new Date(user.registrationDate) : new Date();
                            // Use the registration time as the most logical earliest point
                            signatureDates[petitionId] = registrationDate.toISOString(); 
                            shouldUpdateStorage = true;
                        }
                        
                        activityItems.push({
                            date: new Date(signatureDates[petitionId]),
                            content: `Signed petition: ${petition.title}`,
                            type: 'petition-signed',
                            link: `petition-detail.html?id=${petition.id}`,
                            image: petition.image
                        });
                    }
                });
                
                // Save to localStorage if we added any new dates
                if (shouldUpdateStorage) {
                    localStorage.setItem(signatureDatesKey, JSON.stringify(signatureDates));
                }
            } catch (error) {
                console.error("Error loading user signatures for activity:", error);
            }
        }
        
        // --- Add Donation Activity ---
        try {
            const userDonations = JSON.parse(localStorage.getItem(`accountabilitySA_donations_${userId}`) || '[]');
            
            userDonations.forEach(donation => {
                activityItems.push({
                    date: new Date(donation.date),
                    content: `Donated R ${donation.amount.toLocaleString('en-ZA', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} to ${donation.cause}`,
                    type: 'donation'
                });
            });
        } catch (error) {
            console.error("Error loading user donations for activity:", error);
        }
        // --- End Donation Activity ---
        
        // --- Add Sentiment Vote Activity --- 
        if (typeof SentimentService !== 'undefined') {
            try {
                const sentimentService = new SentimentService(); // Instantiate if needed
                const userVotes = sentimentService.getUserVotes(userId);
                
                console.log(`Found ${userVotes.length} sentiment votes for user ${userId}`);

                userVotes.forEach(vote => {
                    // Get the topic details to display the title
                    const topic = sentimentService.getTopicById(vote.topicId);
                    const topicTitle = topic ? topic.title : 'a sentiment topic'; // Fallback title
                    const voteDate = vote.date ? new Date(vote.date) : new Date(); // Fallback date
                    
                    activityItems.push({
                        date: voteDate,
                        content: `Voted (${vote.satisfaction}/5) on: ${topicTitle}`,
                        type: 'sentiment', // Add a type for styling/filtering if needed
                        // Optionally add a link back to the sentiment page or topic
                        // link: `public-sentiment.html#${vote.topicId}` 
                    });
                });
            } catch (error) {
                console.error("Error loading user sentiment votes for activity:", error);
            }
        }
        // --- End Sentiment Vote Activity ---
        
        // Add login activity - last login from user object (if available)
        if (user && user.lastLogin) {
            const loginDate = new Date(user.lastLogin);
            activityItems.push({
                date: loginDate,
                content: 'Logged in',
                type: 'login'
            });
        }
        
        // Finally, render the activity items
        renderActivityItems(activityItems);
    }

    /**
     * Update the dashboard counts with proper synchronization
     * @param {string} userId - User ID
     */
    function updateDashboardCounts(userId) {
        if (!userId) return;
        
        console.log("Updating dashboard counts for user:", userId);
        
        // Use a Promise.all to properly handle all asynchronous operations
        Promise.all([
            // Update petition counts
            updatePetitionCountPromise(userId),
            
            // Update sentiment votes count
            updateSentimentVotesCountPromise(userId),
            
            // Update donation totals
            updateDonationsTotalPromise(userId)
        ]).then(() => {
            console.log("All dashboard counts updated successfully");
        }).catch(error => {
            console.error("Error updating dashboard counts:", error);
        });
    }
    
    /**
     * Update petition count using Promise pattern
     * @param {string} userId - User ID
     * @returns {Promise} Promise that resolves when count is updated
     */
    function updatePetitionCountPromise(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject("No user ID provided");
            }
            
            const dashboardPetitionsValue = document.getElementById('dashboard-petitions');
            const dashboardCreatedPetitionsValue = document.getElementById('dashboard-created-petitions');
            
            // Count signed petitions
            try {
                // Retry mechanism with setTimeout in case PetitionsService isn't loaded yet
                const tryUpdateSignedPetitions = (attempts = 0) => {
                    if (typeof PetitionsService !== 'undefined' && PetitionsService.getUserSignatures) {
                        const signedPetitions = PetitionsService.getUserSignatures(userId);
                        
                        // Animate the count change
                        if (dashboardPetitionsValue) {
                            // Get current value first
                            const currentValue = parseInt(dashboardPetitionsValue.textContent) || 0;
                            const newValue = signedPetitions.length;
                            
                            if (currentValue !== newValue) {
                                animateCountChange(dashboardPetitionsValue, currentValue, newValue);
                            } else {
                                dashboardPetitionsValue.textContent = newValue;
                            }
                        }
                        
                        // Also update the active petitions count on the petitions page if we're on that page
                        const totalPetitionsElement = document.getElementById('total-petitions');
                        if (totalPetitionsElement && window.location.pathname.includes('petitions.html')) {
                            const allPetitions = PetitionsService.getAllPetitions();
                            totalPetitionsElement.textContent = allPetitions.length;
                        }
                    } else if (attempts < 3) {
                        // Retry up to 3 times with exponential backoff
                        setTimeout(() => tryUpdateSignedPetitions(attempts + 1), 300 * Math.pow(2, attempts));
                    } else {
                        console.error("Failed to load PetitionsService after multiple attempts");
                        if (dashboardPetitionsValue) dashboardPetitionsValue.textContent = 'N/A';
                    }
                };
                
                tryUpdateSignedPetitions();
                
                // Count created petitions separately
                const tryUpdateCreatedPetitions = (attempts = 0) => {
                    if (typeof PetitionsService !== 'undefined' && PetitionsService.getUserCreatedPetitions && dashboardCreatedPetitionsValue) {
                        const createdPetitions = PetitionsService.getUserCreatedPetitions(userId);
                        
                        // Animate the count change
                        const currentValue = parseInt(dashboardCreatedPetitionsValue.textContent) || 0;
                        const newValue = createdPetitions.length;
                        
                        if (currentValue !== newValue) {
                            animateCountChange(dashboardCreatedPetitionsValue, currentValue, newValue);
                        } else {
                            dashboardCreatedPetitionsValue.textContent = newValue;
                        }
                    } else if (attempts < 3) {
                        // Retry with exponential backoff
                        setTimeout(() => tryUpdateCreatedPetitions(attempts + 1), 300 * Math.pow(2, attempts));
                    } else {
                        console.error("Failed to load PetitionsService for created petitions");
                        if (dashboardCreatedPetitionsValue) dashboardCreatedPetitionsValue.textContent = 'N/A';
                    }
                };
                
                tryUpdateCreatedPetitions();
                resolve();
            } catch (error) {
                console.error("Error getting petition counts:", error);
                if (dashboardPetitionsValue) dashboardPetitionsValue.textContent = 'N/A';
                if (dashboardCreatedPetitionsValue) dashboardCreatedPetitionsValue.textContent = 'N/A';
                reject(error);
            }
        });
    }
    
    /**
     * Update sentiment votes count using Promise pattern
     * @param {string} userId - User ID
     * @returns {Promise} Promise that resolves when count is updated
     */
    function updateSentimentVotesCountPromise(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject("No user ID provided");
            }
            
            const sentimentVotesCounter = document.getElementById('sentiment-votes-value');
            if (!sentimentVotesCounter) {
                return resolve(); // Element not found, nothing to update
            }
            
            // Retry mechanism with setTimeout
            const tryUpdateSentimentVotes = (attempts = 0) => {
                if (typeof SentimentService !== 'undefined') {
                    try {
                        const sentimentService = new SentimentService();
                        const userVotes = sentimentService.getUserVotes(userId);
                        
                        // Animate the count change
                        const currentValue = parseInt(sentimentVotesCounter.textContent) || 0;
                        const newValue = userVotes.length;
                        
                        if (currentValue !== newValue) {
                            animateCountChange(sentimentVotesCounter, currentValue, newValue);
                        } else {
                            sentimentVotesCounter.textContent = newValue;
                        }
                        
                        // Successfully updated, resolve the promise
                        resolve();
                    } catch (error) {
                        if (attempts < 3) {
                            // Retry with exponential backoff
                            setTimeout(() => tryUpdateSentimentVotes(attempts + 1), 300 * Math.pow(2, attempts));
                        } else {
                            console.error("Error getting sentiment votes after multiple attempts:", error);
                            sentimentVotesCounter.textContent = 'N/A';
                            reject(error);
                        }
                    }
                } else if (attempts < 3) {
                    // Service not ready yet, retry
                    setTimeout(() => tryUpdateSentimentVotes(attempts + 1), 300 * Math.pow(2, attempts));
                } else {
                    console.error("SentimentService not available after multiple attempts");
                    sentimentVotesCounter.textContent = 'N/A';
                    reject(new Error("SentimentService not available"));
                }
            };
            
            // Start the retry mechanism
            tryUpdateSentimentVotes();
        });
    }
    
    /**
     * Update donations total using Promise pattern
     * @param {string} userId - User ID
     * @returns {Promise} Promise that resolves when amount is updated
     */
    function updateDonationsTotalPromise(userId) {
        return new Promise((resolve) => {
            if (!userId) {
                return resolve(); // No user ID, nothing to do
            }
            
            const dashboardTrackedValue = document.getElementById('dashboard-tracked');
            if (!dashboardTrackedValue) {
                return resolve(); // Element not found, nothing to update
            }
            
            try {
                // Get donations from localStorage or create if not exists
                const userDonations = JSON.parse(localStorage.getItem(`accountabilitySA_donations_${userId}`) || '[]');
                
                // Calculate total donations
                const totalAmount = userDonations.reduce((total, donation) => total + donation.amount, 0);
                
                // Format as ZAR currency
                dashboardTrackedValue.textContent = 'R ' + totalAmount.toLocaleString('en-ZA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                resolve();
            } catch (error) {
                console.error("Error updating donations:", error);
                dashboardTrackedValue.textContent = 'R 0.00';
                resolve(); // Resolve anyway to not block other updates
            }
        });
    }
    
    /**
     * Animate count change for better UX
     * @param {HTMLElement} element - Element to update
     * @param {number} start - Start value
     * @param {number} end - End value
     */
    function animateCountChange(element, start, end) {
        if (!element) return;
        
        // If the difference is small, just animate a few steps
        const diff = Math.abs(end - start);
        const steps = Math.min(diff, 20); // Max 20 steps
        const increment = (end - start) / steps;
        let current = start;
        
        // Add animation class
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'countUp 0.5s ease forwards';
        
        // For small changes, don't animate
        if (diff <= 3) {
            element.textContent = end;
            return;
        }
        
        // Animate the count
        let step = 0;
        const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
                clearInterval(timer);
                element.textContent = end;
            } else {
                element.textContent = Math.round(current);
            }
        }, 1000 / steps);
    }

    // Function to load user contributions
    function loadUserContributions(currentUser) {
        // Get user ID from current user or local storage
        const user = currentUser || AuthService.getCurrentUser();
        const userId = user ? user.id : null;
        
        if (!userId) return;
        
        // Update contribution counts for dashboard
        updateDashboardCounts(userId);
        
        // Load signed petitions
        loadSignedPetitions(userId);
        
        // Load created petitions
        loadCreatedPetitions(userId);
        
        // Load petitions for management view
        loadPetitionsForManagement(userId);
        
        // Check URL parameters to activate the correct tab
        const urlParams = new URLSearchParams(window.location.search);
        const viewType = urlParams.get('view');
        
        if (viewType === 'created') {
            // Find and click the manage petitions tab
            const managePetitionsTab = document.querySelector('.contribution-tab[data-type="manage"]');
            if (managePetitionsTab) {
                setTimeout(() => {
                    managePetitionsTab.click();
                }, 200);
            }
        }
    }

    // Function to load signed petitions
    function loadSignedPetitions(userId) {
        signedPetitionsList.innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Loading signed petitions...</div>';
        noSignedPetitions.style.display = 'none';

        setTimeout(() => {
            try {
                const signedPetitionIds = PetitionsService.getUserSignatures(userId);
                
                // Get stored signature dates using the shared constant key
                const signatureDatesKey = typeof SIGNATURE_DATES_KEY !== 'undefined' 
                    ? `${SIGNATURE_DATES_KEY}_${userId}`
                    : `accountabilitySA_signatureDates_${userId}`;
                    
                const signatureDates = JSON.parse(localStorage.getItem(signatureDatesKey) || '{}');
                
                if (signedPetitionIds.length > 0) {
                    signedPetitionsList.innerHTML = '';
                    const allPetitions = PetitionsService.getAllPetitions();
                    
                    signedPetitionIds.forEach(id => {
                        const petition = allPetitions.find(p => p.id === id);
                        if (petition) {
                            const item = document.createElement('div');
                            item.className = 'contribution-item';
                            const daysLeft = PetitionsService.calculateDaysLeft(petition.deadline);
                            
                            // Use stored signature date or fallback
                            const signedDate = signatureDates[id] 
                                ? new Date(signatureDates[id]) 
                                : new Date();
                            const signedDateFormatted = signedDate.toLocaleDateString('en-ZA');
                            
                            item.innerHTML = `
                                <img src="${petition.image}" alt="${petition.title}" class="contribution-image">
                                <div class="contribution-details">
                                    <a href="petition-detail.html?id=${petition.id}" class="contribution-title">${petition.title}</a>
                                    <p class="contribution-meta">Signed on: ${signedDateFormatted} &bull; ${petition.signatures.toLocaleString()} signatures &bull; ${daysLeft} days left</p>
                                </div>
                            `;
                            signedPetitionsList.appendChild(item);
                        }
                    });
                } else {
                    signedPetitionsList.innerHTML = '';
                    noSignedPetitions.style.display = 'flex';
                }
            } catch (error) {
                console.error("Error loading signed petitions:", error);
                signedPetitionsList.innerHTML = '<div class="error-message">Could not load signed petitions.</div>';
            }
        }, 50);
    }

    /**
     * Load petitions created by the user
     * @param {string} userId - User ID
     */
    function loadCreatedPetitions(userId) {
        if (!userId || !createdPetitionsList) return;
        
        console.log("Loading created petitions for user:", userId);
        
        // Get petitions created by user
                const createdPetitionIds = PetitionsService.getUserCreatedPetitions(userId);
        console.log("Created petition IDs:", createdPetitionIds);
                
        // Get all petitions data
                    const allPetitions = PetitionsService.getAllPetitions();
                    
        // Get the details of created petitions for exact creation dates
        const CREATED_PETITIONS_DETAILS_KEY = 'accountabilitySA_createdPetitionsDetails';
        const detailsJson = localStorage.getItem(`${CREATED_PETITIONS_DETAILS_KEY}_${userId}`);
        const petitionDetails = detailsJson ? JSON.parse(detailsJson) : {};
        
        // Filter to get only the created petitions
        const createdPetitions = allPetitions.filter(petition => createdPetitionIds.includes(petition.id));
        console.log("Created petitions:", createdPetitions);
        
        if (createdPetitions.length === 0) {
            // Show no petitions message
            if (noCreatedPetitions) {
                noCreatedPetitions.style.display = 'block';
            }
            createdPetitionsList.innerHTML = '';
            return;
        }
        
        // Hide no petitions message
        if (noCreatedPetitions) {
            noCreatedPetitions.style.display = 'none';
        }
        
        // Sort by creation date (newest first)
        createdPetitions.sort((a, b) => {
            // Use exact creation date if available in details
            const dateA = (petitionDetails[a.id] && petitionDetails[a.id].creationDate) || 
                          a.exactCreationDate || a.createdDate;
            const dateB = (petitionDetails[b.id] && petitionDetails[b.id].creationDate) || 
                          b.exactCreationDate || b.createdDate;
            return new Date(dateB) - new Date(dateA);
        });
        
        // Generate HTML for each petition
        let html = '';
        createdPetitions.forEach(petition => {
            // Format creation date for display
            const creationDate = (petitionDetails[petition.id] && petitionDetails[petition.id].creationDate) || 
                                 petition.exactCreationDate || petition.createdDate;
            const displayDate = formatDate(creationDate);
            
            html += `
                <div class="contribution-item petition-item" data-id="${petition.id}">
                    <div class="contribution-image">
                        <img src="${petition.image}" alt="${petition.title}" onerror="this.src='images/petitions/default.jpg'">
                    </div>
                                <div class="contribution-details">
                        <h4>${petition.title}</h4>
                        <div class="meta-info">
                            <span><i class="fas fa-calendar-alt"></i> Created: ${displayDate}</span>
                            <span><i class="fas fa-users"></i> Signatures: ${petition.signatures}</span>
                            <span><i class="fas fa-bullseye"></i> Goal: ${petition.goalSignatures}</span>
                        </div>
                        <p>${petition.summary}</p>
                        <div class="petition-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${Math.min(100, Math.round((petition.signatures / petition.goalSignatures) * 100))}%"></div>
                            </div>
                            <span class="progress-text">${Math.round((petition.signatures / petition.goalSignatures) * 100)}% of goal</span>
                                </div>
                                <div class="contribution-actions">
                            <a href="petition-detail.html?id=${petition.id}" class="btn-view">View Petition</a>
                            <button class="btn-delete-petition" data-id="${petition.id}">Delete Petition</button>
                        </div>
                    </div>
                                </div>
                            `;
        });
        
        createdPetitionsList.innerHTML = html;
        
        // Add event listeners for delete buttons
        const deleteButtons = createdPetitionsList.querySelectorAll('.btn-delete-petition');
        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDeletePetition);
        });
    }
    
    /**
     * Handle petition deletion button click in the management tab
     * @param {Event} e - Click event
     */
    function handleDeletePetition(e) {
                            e.preventDefault(); 
        const petitionId = e.target.closest('.btn-delete-petition').getAttribute('data-id');
        
        if (!petitionId) return;
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this petition? This action cannot be undone.')) {
            return;
        }
        
        const userId = AuthService.getCurrentUser()?.id;
        if (!userId) {
            showNotification('User not found. Cannot delete petition.', 'error');
            return;
        }
        
        // Visually indicate deletion is in progress
        const petitionElement = document.querySelector(`.petition-management-item[data-id="${petitionId}"]`);
        if (petitionElement) {
            petitionElement.style.opacity = '0.5';
            petitionElement.style.pointerEvents = 'none';
        }
        
        // Call the service to delete the petition data
        const deleted = PetitionsService.deletePetition(petitionId, userId);
        
        if (deleted) {
            // Remove the element from the UI with animation
            if (petitionElement) {
                 petitionElement.style.transition = 'height 0.3s ease, opacity 0.3s ease, margin 0.3s ease, padding 0.3s ease';
                 petitionElement.style.height = '0';
                 petitionElement.style.margin = '0';
                 petitionElement.style.padding = '0';
                 petitionElement.style.border = 'none';
                 petitionElement.style.opacity = '0';
                 
                 setTimeout(() => {
                     petitionElement.remove();
                     
                     // Check if the list is now empty
                     const managePetitionsList = document.getElementById('manage-petitions-list');
                     const noManagePetitions = document.getElementById('no-manage-petitions');
                     if (managePetitionsList && noManagePetitions && managePetitionsList.children.length === 0) {
                         noManagePetitions.style.display = 'block';
                     }
                 }, 300);
            }
            
            // Show success message
            showToast('Petition deleted successfully', 'success');
            
            // Update dashboard counts
            updateDashboardCounts(userId);
            
            // Update activity log
            loadUserActivity(userId);
            
            // Dispatch petition deleted event
            const event = new CustomEvent('petitionDeleted', {
                detail: {
                    petitionId: petitionId,
                    userId: userId
                }
            });
            window.dispatchEvent(event);
            
                } else {
            // Deletion failed, revert UI changes
            if (petitionElement) {
                petitionElement.style.opacity = '1';
                petitionElement.style.pointerEvents = 'auto';
            }
            showToast('Failed to delete petition. Please try again.', 'error');
        }
    }
    
    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
            }
    }

    // Function to handle profile update
    async function updateUserProfile(form, errorEl) {
        errorEl.innerHTML = '';
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        const updatedData = {
            name: form.elements['profile-name'].value,
            email: form.elements['profile-email'].value,
            province: form.elements['profile-province'].value,
        };

        try {
            if (!updatedData.name || !updatedData.email) {
                throw new Error('Name and Email cannot be empty.');
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)) {
                throw new Error('Invalid email format.');
            }

            const updatedUser = await AuthService.updateProfile(updatedData);
            showSuccess('Profile updated successfully!', errorEl);
            loadUserData(updatedUser);
            AuthService.updateAuthUI();

        } catch (error) {
            showError(error.message || 'Failed to update profile.', errorEl);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    // Function to handle password update
    async function updateUserPassword(form, errorEl) {
        errorEl.innerHTML = '';
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        const currentPassword = form.elements['current-password'].value;
        const newPassword = form.elements['new-password'].value;
        const confirmPassword = form.elements['confirm-new-password'].value;

        try {
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new Error('All password fields are required.');
            }
            if (newPassword.length < 8) {
                throw new Error('New password must be at least 8 characters long.');
            }
            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match.');
            }

            await AuthService.changePassword(currentPassword, newPassword);
            showSuccess('Password changed successfully!', errorEl);
            form.reset();

        } catch (error) {
            showError(error.message || 'Failed to change password.', errorEl);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    // Function to handle profile picture upload
    function handleProfilePicUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file.', errorContainer);
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showError('Image size should not exceed 2MB.', errorContainer);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            if(profilePicDisplay) profilePicDisplay.src = e.target.result;
            const profilePicPreview = document.getElementById('profile-avatar-preview');
            if(profilePicPreview) profilePicPreview.src = e.target.result;

            try {
                const updatedUser = await AuthService.updateProfile({ avatar: e.target.result });
                showSuccess('Profile picture updated.', errorContainer);
                AuthService.updateAuthUI();
            } catch(error) {
                showError('Failed to update profile picture.', errorContainer);
                const currentAvatar = AuthService.getCurrentUser().avatar || 'images/avatars/default.jpg';
                if(profilePicDisplay) profilePicDisplay.src = currentAvatar;
                if(profilePicPreview) profilePicPreview.src = currentAvatar;
            }
        };
        reader.readAsDataURL(file);
    }

    // Setup sidebar navigation
    function setupTabNavigation() {
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = tab.getAttribute('data-tab');
                showSection(targetId);
                history.pushState(null, null, `#${targetId}`);

                if (targetId === 'contributions') {
                    loadUserContributions(user);
                    setupContributionSubTabs(); // Setup sub-tabs when contributions tab is clicked
                }
            });
        });

        // Handle initial tab based on URL hash or default to dashboard
        const initialTab = window.location.hash.substring(1) || 'dashboard';
        const targetTabLink = document.querySelector(`.profile-navigation a[data-tab="${initialTab}"]`);
        if (targetTabLink) {
             showSection(initialTab);
             // If initial tab is contributions, load data and setup sub-tabs
             if (initialTab === 'contributions') {
                 loadUserContributions(user);
                 setupContributionSubTabs();
             }
        } else {
            showSection('dashboard'); // Default to dashboard
        }
         // Listen for hash changes to update tab
        window.addEventListener('hashchange', () => {
             const newTabId = window.location.hash.substring(1);
             if (document.querySelector(`.profile-navigation a[data-tab="${newTabId}"]`)){
                 showSection(newTabId);
                  if (newTabId === 'contributions') {
                     loadUserContributions(user);
                     setupContributionSubTabs();
                 }
             }
         });
    }

    /**
     * Setup event listeners for contribution sub-tabs (Petitions, Comments, Reports, Manage)
     */
    function setupContributionSubTabs() {
        const contributionTabs = document.querySelectorAll('.contribution-tab');
        const contributionContents = document.querySelectorAll('.contribution-content');
        
        contributionTabs.forEach(tab => {
            // Remove existing listener to prevent duplicates if setup is called again
            tab.replaceWith(tab.cloneNode(true));
        });
        
        // Re-select tabs after cloning
        const newContributionTabs = document.querySelectorAll('.contribution-tab');
        
        newContributionTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                
                newContributionTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                contributionContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                const targetContent = document.getElementById(`${type}-content`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                } else {
                    console.error(`Content section for tab type '${type}' not found.`);
                }
                
                 // Update URL query param for view type without reloading
                const url = new URL(window.location);
                url.searchParams.set('view', type);
                history.pushState({}, '', url);
            });
        });
        
        // Activate tab based on URL parameter 'view'
        const urlParams = new URLSearchParams(window.location.search);
        const viewType = urlParams.get('view') || 'petitions'; // Default to 'petitions'
        const targetSubTab = document.querySelector(`.contribution-tab[data-type="${viewType}"]`);
        if (targetSubTab) {
             targetSubTab.click();
        } else {
            // Default to the first tab if viewType is invalid
            const firstSubTab = document.querySelector('.contribution-tab');
            if (firstSubTab) {
                firstSubTab.click();
            }
        }
    }

    // Show the target section and hide others
    function showSection(targetId) {
        sections.forEach(section => {
            section.style.display = (section.id === `${targetId}-section`) ? 'block' : 'none';
        });
        tabs.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-tab') === targetId);
        });
    }

    // Helper functions for feedback
    function showError(message, container) {
        if(container) container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
    }

    function showSuccess(message, container) {
        if(container) {
            container.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${message}</div>`;
            setTimeout(() => { container.innerHTML = ''; }, 3000);
        }
    }

    // Function to setup donation functionality
    function setupDonationSystem() {
        // Add a donation button to the dashboard if it doesn't exist
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection && !document.getElementById('donate-button')) {
            // Find the gold dashboard card
            const fundsCard = document.querySelector('.dashboard-card.gold');
            if (fundsCard) {
                // Create a donate button
                const donateBtn = document.createElement('button');
                donateBtn.id = 'donate-button';
                donateBtn.className = 'btn-secondary';
                donateBtn.style.marginTop = '10px';
                donateBtn.innerHTML = '<i class="fas fa-donate"></i> Make a Donation';
                
                // Append to the card
                fundsCard.appendChild(donateBtn);
                
                // Add click event
                donateBtn.addEventListener('click', showDonationModal);
            }
        }
        
        // Create donation modal if it doesn't exist
        if (!document.getElementById('donation-modal')) {
            const modal = document.createElement('div');
            modal.id = 'donation-modal';
            modal.className = 'modal';
            modal.style.display = 'none';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Make a Donation</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="donation-form">
                            <div class="form-group">
                                <label for="donation-amount">Amount (ZAR)</label>
                                <input type="number" id="donation-amount" min="10" step="10" value="100" required>
                            </div>
                            <div class="form-group">
                                <label for="donation-cause">Cause</label>
                                <select id="donation-cause" required>
                                    <option value="Website Operations">Website Operations</option>
                                    <option value="Corruption Investigation">Corruption Investigation</option>
                                    <option value="Community Outreach">Community Outreach</option>
                                    <option value="Legal Support">Legal Support</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn-auth">Donate Now</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal when clicking X
            const closeBtn = modal.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            // Handle donation form submission
            const donationForm = document.getElementById('donation-form');
            donationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                processDonation();
            });
        }
    }

    // Function to show donation modal
    function showDonationModal() {
        const modal = document.getElementById('donation-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Function to process donation
    function processDonation() {
        const amountField = document.getElementById('donation-amount');
        const causeField = document.getElementById('donation-cause');
        
        const amount = parseFloat(amountField.value);
        const cause = causeField.value;
        
        if (isNaN(amount) || amount < 10) {
            alert('Please enter a valid amount (minimum R10)');
            return;
        }
        
        // Get current user
        const user = AuthService.getCurrentUser();
        if (!user) return;
        
        // Create donation record
        const donation = {
            id: Date.now().toString(),
            userId: user.id,
            amount: amount,
            cause: cause,
            date: new Date().toISOString()
        };
        
        // Add to localStorage
        const donationsKey = `accountabilitySA_donations_${user.id}`;
        const existingDonations = JSON.parse(localStorage.getItem(donationsKey) || '[]');
        existingDonations.push(donation);
        localStorage.setItem(donationsKey, JSON.stringify(existingDonations));
        
        // Show confirmation
        alert(`Thank you for your donation of R ${amount.toLocaleString('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} to ${cause}!`);
        
        // Close modal
        const modal = document.getElementById('donation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Update dashboard counts and activity
        updateDashboardCounts(user.id);
        loadUserActivity(user.id);
        
        // Dispatch event for other parts of the app
        const donationEvent = new CustomEvent('donationMade', {
            detail: {
                userId: user.id,
                amount: amount,
                cause: cause
            }
        });
        document.dispatchEvent(donationEvent);
    }

    // Initialize profile picture upload functionality
    window.initProfilePictureUpload = function() {
        console.log('Initializing profile picture upload');
        
        // Get DOM elements
        const profilePictureInput = document.getElementById('profile-picture-input');
        const previewContainer = document.getElementById('avatar-preview-container');
        const avatarPreview = document.getElementById('avatar-preview');
        const avatarElement = document.querySelector('.profile-avatar');
        
        if (!profilePictureInput) {
            console.error('Profile picture input element not found');
            return;
        }
        
        if (!previewContainer || !avatarPreview) {
            console.error('Avatar preview elements not found');
        }
        
        // Use ProfileUtils if available, otherwise fallback to basic implementation
        if (window.ProfileUtils) {
            console.log('Using ProfileUtils for avatar upload');
            // Initialize with ProfileUtils for consistent behavior
            ProfileUtils.handleAvatarUpload(profilePictureInput, avatarPreview, function(avatarUrl) {
                // Update all avatar elements on the page
                const avatarElements = document.querySelectorAll('.avatar-img, .profile-avatar');
                avatarElements.forEach(img => {
                    img.src = avatarUrl;
                });
                
                // Show success notification
                showNotification('Profile picture updated successfully', 'success');
                
                // Ensure the header UI is updated to show the new avatar
                if (typeof updateHeaderUI === 'function') {
                    updateHeaderUI();
                }
            });
        } else {
            console.log('ProfileUtils not available, using basic implementation');
            // Basic implementation as fallback
            profilePictureInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                // Show loading overlay
                if (previewContainer) {
                    previewContainer.classList.add('loading');
                }
                
                // Validate file
                if (!file.type.match('image.*')) {
                    console.error('Selected file is not an image');
                    showNotification('Please select an image file', 'error');
                    if (previewContainer) {
                        previewContainer.classList.remove('loading');
                    }
                    return;
                }
                
                // Read and display the file
                const reader = new FileReader();
                reader.onload = function(event) {
                    const dataUrl = event.target.result;
                    
                    // Update preview image
                    if (avatarPreview) {
                        avatarPreview.src = dataUrl;
                    }
                    
                    // Update main avatar
                    if (avatarElement) {
                        avatarElement.src = dataUrl;
                    }
                    
                    // Update user data
                    try {
                        const userData = JSON.parse(localStorage.getItem('accountabilitySAUser') || sessionStorage.getItem('accountabilitySAUser') || '{}');
                        userData.avatar = dataUrl;
                        
                        // Save to both storage types for consistency
                        localStorage.setItem('accountabilitySAUser', JSON.stringify(userData));
                        sessionStorage.setItem('accountabilitySAUser', JSON.stringify(userData));
                        
                        showNotification('Profile picture updated successfully', 'success');
                    } catch (error) {
                        console.error('Error updating user data:', error);
                        showNotification('Failed to update profile picture', 'error');
                    }
                    
                    // Remove loading overlay
                    if (previewContainer) {
                        previewContainer.classList.remove('loading');
                    }
                };
                
                reader.onerror = function() {
                    console.error('Error reading file');
                    showNotification('Error reading file', 'error');
                    if (previewContainer) {
                        previewContainer.classList.remove('loading');
                    }
                };
                
                reader.readAsDataURL(file);
            });
        }
        
        // Add click handler for the avatar container to trigger file input
        if (avatarPreview) {
            avatarPreview.addEventListener('click', function() {
                profilePictureInput.click();
            });
        }
        
        console.log('Profile picture upload initialization complete');
    };

    // Helper function to get current user
    function getCurrentUser() {
        try {
            return JSON.parse(
                localStorage.getItem('accountabilitySAUser') || 
                sessionStorage.getItem('accountabilitySAUser') || 
                '{}'
            );
        } catch (e) {
            console.error('Error parsing user data:', e);
            return {};
        }
    }

    // Helper function to save user data
    function saveUserData(userData) {
        if (!userData || !userData.email) return false;
        
        try {
            // Save to user session
            if (localStorage.getItem('accountabilitySAUser')) {
                localStorage.setItem('accountabilitySAUser', JSON.stringify(userData));
            } else if (sessionStorage.getItem('accountabilitySAUser')) {
                sessionStorage.setItem('accountabilitySAUser', JSON.stringify(userData));
            }
            
            // Also update in registered users collection
            updateUserInRegisteredUsers(userData);
            return true;
        } catch (e) {
            console.error('Error saving user data:', e);
            return false;
        }
    }

    // Helper function to display notifications
    function showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
            
            // Add notification styles if not present
            if (!document.getElementById('notification-styles')) {
                const styles = document.createElement('style');
                styles.id = 'notification-styles';
                styles.textContent = `
                    .notification-container {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 9999;
                    }
                    .notification {
                        padding: 12px 20px;
                        margin-bottom: 10px;
                        border-radius: 6px;
                        box-shadow: 0 3px 10px rgba(0,0,0,0.15);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        min-width: 280px;
                        max-width: 350px;
                        animation: slideIn 0.3s forwards;
                        color: white;
                    }
                    .notification.info { background-color: #3498db; }
                    .notification.success { background-color: #2ecc71; }
                    .notification.error { background-color: #e74c3c; }
                    .notification-content { 
                        display: flex;
                        align-items: center;
                    }
                    .notification-content i {
                        margin-right: 10px;
                        font-size: 18px;
                    }
                    .notification .close-btn {
                        background: none;
                        border: none;
                        color: white;
                        opacity: 0.7;
                        cursor: pointer;
                        font-size: 18px;
                        transition: opacity 0.2s;
                    }
                    .notification .close-btn:hover {
                        opacity: 1;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Set icon based on type
        let icon;
        switch (type) {
            case 'success': icon = 'fa-check-circle'; break;
            case 'error': icon = 'fa-exclamation-circle'; break;
            default: icon = 'fa-info-circle';
        }
        
        // Create notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });
        
        // Assemble notification
        notification.appendChild(content);
        notification.appendChild(closeBtn);
        container.appendChild(notification);
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 4000);
        
        function removeNotification(el) {
            el.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }
    }

    // Helper to update user in registered users collection
    function updateUserInRegisteredUsers(userData) {
        if (!userData || !userData.email) return;
        
        const REGISTERED_USERS_KEY = 'accountabilitySARegisteredUsers';
        try {
            const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
            if (usersJson) {
                const users = JSON.parse(usersJson);
                if (users[userData.email]) {
                    // Update only avatar properties
                    if (userData.avatarData) {
                        users[userData.email].avatarData = userData.avatarData;
                    } else {
                        delete users[userData.email].avatarData;
                    }
                    users[userData.email].avatar = userData.avatar;
                    
                    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
                    console.log('Updated user avatar in registered users');
                }
            }
        } catch (err) {
            console.error('Error updating user in registered users:', err);
        }
    }

    // Ensure this function is called when the document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DEBUG: DOMContentLoaded event fired');
        initProfilePictureUpload();
        
        // Load contributions based on active tab
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            
            if (tab === 'contributions') {
                // Set contributions tab as active
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#contributions') {
                        link.classList.add('active');
                    }
                });
                
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                    if (pane.id === 'contributions') {
                        pane.classList.add('show', 'active');
                    }
                });
                
                // Select manage petitions tab if specified in URL
                const viewType = urlParams.get('view');
                if (viewType === 'created') {
                    setTimeout(() => {
                        const createdPetitionsTab = document.querySelector('.contribution-tab[data-type="manage"]');
                        if (createdPetitionsTab) {
                            createdPetitionsTab.click();
                        }
                    }, 100);
                }
            }
        }
        
        // Load user contributions (including petitions for management)
        loadUserContributions();
    });

    /**
     * Load petitions for the management tab with edit and delete options
     * @param {string} userId - User ID
     */
    function loadPetitionsForManagement(userId) {
        if (!userId) return;
        
        const managePetitionsList = document.getElementById('manage-petitions-list');
        const noManagePetitions = document.getElementById('no-manage-petitions');
        
        if (!managePetitionsList) return;
        
        console.log("Loading petitions for management view for user:", userId);
        
        try {
            // Get created petitions
            const createdPetitionIds = PetitionsService.getUserCreatedPetitions(userId);
            const allPetitions = PetitionsService.getAllPetitions();
            
            // Get the details for exact creation dates
            const CREATED_PETITIONS_DETAILS_KEY = 'accountabilitySA_createdPetitionsDetails';
            const detailsJson = localStorage.getItem(`${CREATED_PETITIONS_DETAILS_KEY}_${userId}`);
            const petitionDetails = detailsJson ? JSON.parse(detailsJson) : {};
            
            // Filter to get only created petitions
            const createdPetitions = allPetitions.filter(petition => createdPetitionIds.includes(petition.id));
            
            if (createdPetitions.length === 0) {
                // Show empty state
                if (noManagePetitions) {
                    noManagePetitions.style.display = 'block';
                }
                managePetitionsList.innerHTML = '';
                return;
            }
            
            // Hide empty state
            if (noManagePetitions) {
                noManagePetitions.style.display = 'none';
            }
            
            // Sort by creation date (newest first)
            createdPetitions.sort((a, b) => {
                const dateA = (petitionDetails[a.id] && petitionDetails[a.id].creationDate) || 
                           a.exactCreationDate || a.createdDate;
                const dateB = (petitionDetails[b.id] && petitionDetails[b.id].creationDate) || 
                           b.exactCreationDate || b.createdDate;
                return new Date(dateB) - new Date(dateA);
            });
            
            // Generate HTML for each petition
            let html = '';
            createdPetitions.forEach(petition => {
                // Format creation date for display
                const creationDate = (petitionDetails[petition.id] && petitionDetails[petition.id].creationDate) || 
                                 petition.exactCreationDate || petition.createdDate;
                const displayDate = formatDate(creationDate);
                
                // Calculate progress percentage
                const progressPercent = Math.min(100, Math.round((petition.signatures / petition.goalSignatures) * 100));
                
                html += `
                    <div class="petition-management-item" data-id="${petition.id}">
                        <div class="petition-management-header">
                            <div class="petition-image">
                                <img src="${petition.image}" alt="${petition.title}" onerror="this.src='images/petitions/default.jpg'">
                            </div>
                            <div class="petition-info">
                                <h4>${petition.title}</h4>
                                <div class="petition-meta">
                                    <span><i class="fas fa-calendar-alt"></i> Created: ${displayDate}</span>
                                    <span><i class="fas fa-users"></i> Signatures: ${petition.signatures}</span>
                                    <span><i class="fas fa-bullseye"></i> Goal: ${petition.goalSignatures}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="petition-management-body">
                            <p>${petition.summary}</p>
                            <div class="petition-progress">
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${progressPercent}%"></div>
                                </div>
                                <span class="progress-text">${progressPercent}% of goal</span>
                            </div>
                        </div>
                        
                        <div class="petition-management-actions">
                            <a href="petition-detail.html?id=${petition.id}" class="btn-view">
                                <i class="fas fa-eye"></i> View
                            </a>
                            <button class="btn-edit-petition" data-id="${petition.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-delete-petition" data-id="${petition.id}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            
            managePetitionsList.innerHTML = html;
            
            // Add event listeners for edit and delete buttons
            const editButtons = managePetitionsList.querySelectorAll('.btn-edit-petition');
            const deleteButtons = managePetitionsList.querySelectorAll('.btn-delete-petition');
            
            editButtons.forEach(button => {
                button.addEventListener('click', handleEditPetition);
            });
            
            deleteButtons.forEach(button => {
                button.addEventListener('click', handleDeletePetition);
            });
        } catch (error) {
            console.error("Error loading petitions for management:", error);
            managePetitionsList.innerHTML = '<div class="error-message">Failed to load your petitions. Please try again.</div>';
        }
    }
    
    /**
     * Handle petition editing
     * @param {Event} e - Click event
     */
    function handleEditPetition(e) {
        e.preventDefault();
        const petitionId = e.target.closest('.btn-edit-petition').getAttribute('data-id');
        
        if (!petitionId) return;
        
        // Get the petition details
        const petition = PetitionsService.getPetitionById(petitionId);
        if (!petition) {
            showNotification('Petition not found', 'error');
            return;
        }
        
        // Navigate to the petitions page with edit parameter
        window.location.href = `petitions.html?edit=${petitionId}#create-petition-section`;
    }

    // Toast notification styles for petition management
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
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
        `;
        document.head.appendChild(style);
    }

    // Show toast notification for petition management
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}); 