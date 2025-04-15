// Public Sentiment Page - Accountability SA
// Handles user sentiment voting, topic creation, and syncing with user accounts

// Initialize SentimentService
class SentimentService {
    constructor() {
        console.log('Initializing SentimentService');
        
        // --- Reset Logic --- 
        // Set to true to reset all sentiment data and start fresh
        const FORCE_RESET_SENTIMENT = false; // Set this to false after initial reset
        
        // Topics to reset (empty since healthcare and education were removed)
        const TOPICS_TO_RESET = [];
        
        // Check existing data in localStorage
        let topicsData = localStorage.getItem('sentimentTopics');
        let userVotesData = localStorage.getItem('userVotes');
        
        console.log(`Found localStorage data: topics=${!!topicsData}, userVotes=${!!userVotesData}`);

        if (FORCE_RESET_SENTIMENT || !topicsData) {
            console.log('Resetting sentiment data: Clearing all demo votes and initializing with 0 scores.');
            this.sentimentTopics = this.generateDefaultTopics(); // Generate fresh topics with 0 scores
            this.userVotes = {}; // Reset all user votes
            
            // Clear any sentiment-related localStorage items for full reset
            localStorage.removeItem('userVotes');
            localStorage.removeItem('sentimentTopics');
            
            this.saveToLocalStorage(); // Save the reset state
        } else {
            const defaultTopics = this.generateDefaultTopics();
            let loadedTopics = [];
            try {
                loadedTopics = JSON.parse(topicsData);
                console.log(`Loaded ${loadedTopics.length} topics from localStorage`);

                // Merge default topics with loaded topics
                const loadedTopicIds = new Set(loadedTopics.map(t => t.id));
                const topicsToAdd = defaultTopics.filter(dt => !loadedTopicIds.has(dt.id));

                if (topicsToAdd.length > 0) {
                    console.log(`Adding ${topicsToAdd.length} new default topics not found in localStorage:`, topicsToAdd.map(t => t.id));
                    loadedTopics.push(...topicsToAdd);
                }

                this.sentimentTopics = loadedTopics;

                // Parse user votes data (keep this logic)
                if (userVotesData) {
                    this.userVotes = JSON.parse(userVotesData);
                    const userCount = Object.keys(this.userVotes).length;
                    console.log(`Loaded votes for ${userCount} users from localStorage`);
                    
                    // Log vote counts per user for debugging
                    Object.keys(this.userVotes).forEach(userId => {
                        const voteCount = this.userVotes[userId].length;
                        console.log(`User ${userId} has ${voteCount} votes`);
                    });
                } else {
                    console.log('No user votes found in localStorage');
                    this.userVotes = {};
                }
                
                // Reset specific topics if needed (keep this logic, but apply to the merged list)
                if (TOPICS_TO_RESET.length > 0) {
                    console.log(`Resetting specific topics: ${TOPICS_TO_RESET.join(', ')}`);
                    TOPICS_TO_RESET.forEach(topicId => {
                         const defaultTopic = defaultTopics.find(t => t.id === topicId);
                         const existingIndex = this.sentimentTopics.findIndex(t => t.id === topicId);
                         if (defaultTopic) {
                            if (existingIndex >= 0) {
                                this.sentimentTopics[existingIndex] = { ...defaultTopic, totalVotes: 0, averageScore: 0 };
                                console.log(`Reset topic: ${topicId}`);
                             } else {
                                 this.sentimentTopics.push({ ...defaultTopic, totalVotes: 0, averageScore: 0 });
                                 console.log(`Added reset topic (was missing): ${topicId}`);
                             }
                         }
                     });
                     Object.keys(this.userVotes).forEach(userId => {
                         this.userVotes[userId] = this.userVotes[userId].filter(vote => !TOPICS_TO_RESET.includes(vote.topicId));
                     });
                     this.saveToLocalStorage(); // Save after reset
                 }

            } catch (error) {
                console.error('Error parsing localStorage data or merging topics:', error);
                console.log('Regenerating default topics due to error');
                this.sentimentTopics = defaultTopics; // Fallback to default topics on error
                this.userVotes = {};
            }
        }

        // Ensure existing topics have necessary fields (migration and data integrity)
        console.log('Ensuring data integrity for topics');
        this.sentimentTopics = this.sentimentTopics.map(topic => ({
            ...topic,
            totalVotes: topic.totalVotes || 0,
            averageScore: topic.averageScore || 0
        }));
        
        // Save potentially fixed data
        this.saveToLocalStorage();
        
        // Print summary of loaded data
        const totalVotes = this.sentimentTopics.reduce((sum, topic) => sum + topic.totalVotes, 0);
        console.log(`SentimentService ready with ${this.sentimentTopics.length} topics and ${totalVotes} total votes`);
    }

    // Generate default sentiment topics if none exist (NOW WITH 0 STATS)
    generateDefaultTopics() {
        const defaultTopics = [
            // Service Delivery Topics - REPLACED WITH NEW LIST
            {
                id: "st-service-housing-settlements",
                title: "Housing and Human Settlements",
                description: "Provision of affordable housing and development of sustainable human settlements.",
                category: "service-delivery"
            },
            {
                id: "st-service-water-sanitation",
                title: "Water and Sanitation",
                description: "Ensuring access to clean water and adequate sanitation facilities.",
                category: "service-delivery"
            },
            {
                id: "st-service-electricity-energy",
                title: "Electricity and Energy",
                description: "Supply of electricity and promotion of renewable energy sources.",
                category: "service-delivery"
            },
            {
                id: "st-service-healthcare",
                title: "Healthcare Services",
                description: "Delivery of public health services, including hospitals, clinics, and community health centers.",
                category: "service-delivery"
            },
            {
                id: "st-service-education",
                title: "Education",
                description: "Provision of basic and higher education through schools, colleges, and universities.",
                category: "service-delivery"
            },
            {
                id: "st-service-social-welfare",
                title: "Social Welfare",
                description: "Support services for vulnerable groups, including social grants and child protection services.",
                category: "service-delivery"
            },
            {
                id: "st-service-safety-security",
                title: "Public Safety and Security",
                description: "Law enforcement, crime prevention, and emergency response services.",
                category: "service-delivery"
            },
            {
                id: "st-service-transportation",
                title: "Transportation",
                description: "Maintenance of public roads, public transport systems, and driver licensing services.",
                category: "service-delivery"
            },
            {
                id: "st-service-environmental-mgmt",
                title: "Environmental Management",
                description: "Conservation of natural resources and pollution control.",
                category: "service-delivery"
            },
            {
                id: "st-service-economic-dev",
                title: "Economic Development",
                description: "Support for small businesses, job creation initiatives, and investment promotion.",
                category: "service-delivery"
            },
            {
                id: "st-service-agri-rural-dev",
                title: "Agriculture and Rural Development",
                description: "Support for farmers, food security programs, and rural infrastructure development.",
                category: "service-delivery"
            },
            {
                id: "st-service-communication",
                title: "Communication Services",
                description: "Provision of postal services and promotion of digital communication infrastructure.",
                category: "service-delivery"
            },
            {
                id: "st-service-sport-arts-culture",
                title: "Sports, Arts, and Culture",
                description: "Promotion of sports, preservation of cultural heritage, and support for artistic endeavors.",
                category: "service-delivery"
            },
            {
                id: "st-service-justice-legal",
                title: "Justice and Legal Services",
                description: "Provision of legal aid, maintenance of courts, and correctional services.",
                category: "service-delivery"
            },
            {
                id: "st-service-employment",
                title: "Employment Services",
                description: "Job placement assistance, labor market information, and skills development programs.",
                category: "service-delivery"
            },
            {
                id: "st-service-municipal",
                title: "Municipal Services",
                description: "Local services such as waste management, street lighting, and community development.",
                category: "service-delivery"
            },
            
            // Political Parties Topics
            {
                id: "st-party-anc",
                title: "African National Congress (ANC)",
                description: "Rate your satisfaction with the ANC's governance, policies, and leadership.",
                category: "political-parties"
            },
            {
                id: "st-party-da",
                title: "Democratic Alliance (DA)",
                description: "Rate your satisfaction with the DA's performance in governance and opposition.",
                category: "political-parties"
            },
            {
                id: "st-party-eff",
                title: "Economic Freedom Fighters (EFF)",
                description: "Rate your satisfaction with the EFF's political positions and actions.",
                category: "political-parties"
            },
             {
                id: "st-party-ifp",
                title: "Inkatha Freedom Party (IFP)",
                description: "Rate your satisfaction with the IFP's regional and national influence.",
                category: "political-parties"
            },
            {
                id: "st-party-ffplus",
                title: "Freedom Front Plus (FF+)",
                description: "Rate your satisfaction with the FF+'s representation of minority interests.",
                category: "political-parties"
            },
            {
                id: "st-party-gnu",
                title: "Government of National Unity (GNU)",
                description: "Rate your satisfaction with the formation and potential effectiveness of the GNU.",
                category: "political-parties"
            },
            
            // Government Departments Topics - REPLACED WITH NEW LIST
            {
                id: "st-dept-agriculture",
                title: "Department of Agriculture, Land Reform and Rural Development",
                description: "Oversees agricultural policy, land reform, and rural development initiatives.",
                category: "government-departments"
            },
            {
                id: "st-dept-basic-education",
                title: "Department of Basic Education",
                description: "Responsible for primary and secondary schooling systems and educational policy.",
                category: "government-departments"
            },
            {
                id: "st-dept-comms-digital",
                title: "Department of Communications and Digital Technologies",
                description: "Manages government communications, digital transformation, and ICT infrastructure.",
                category: "government-departments"
            },
            {
                id: "st-dept-cogta",
                title: "Department of Cooperative Governance and Traditional Affairs (COGTA)",
                description: "Focuses on local government, traditional leadership structures, and intergovernmental relations.",
                category: "government-departments"
            },
            {
                id: "st-dept-defence",
                title: "Department of Defence and Military Veterans",
                description: "Oversees national defence policy, the armed forces, and support for military veterans.",
                category: "government-departments"
            },
            {
                id: "st-dept-employment-labour",
                title: "Department of Employment and Labour",
                description: "Responsible for labour relations, employment policy, and workplace standards.",
                category: "government-departments"
            },
            {
                id: "st-dept-environment",
                title: "Department of Environment, Forestry and Fisheries",
                description: "Manages environmental conservation, natural resource management, and sustainable fisheries.",
                category: "government-departments"
            },
            {
                id: "st-dept-finance",
                title: "Department of Finance",
                description: "Handles national fiscal policy, the budget process, and financial management of the state.",
                category: "government-departments"
            },
            {
                id: "st-dept-health",
                title: "Department of Health",
                description: "Oversees public health policy, healthcare systems, and related programs.",
                category: "government-departments"
            },
            {
                id: "st-dept-higher-education",
                title: "Department of Higher Education and Training",
                description: "Develops and implements policy for post-secondary education, research, and innovation.",
                category: "government-departments"
            },
            {
                id: "st-dept-home-affairs",
                title: "Department of Home Affairs",
                description: "Manages civic services such as identity documents, passports, and immigration.",
                category: "government-departments"
            },
            {
                id: "st-dept-human-settlements",
                title: "Department of Human Settlements",
                description: "Focuses on housing policy, urban development, and the promotion of adequate living conditions.",
                category: "government-departments"
            },
            {
                id: "st-dept-international-relations",
                title: "Department of International Relations and Cooperation",
                description: "Oversees South Africa's foreign policy, diplomatic relations, and international cooperation.",
                category: "government-departments"
            },
            {
                id: "st-dept-justice",
                title: "Department of Justice and Constitutional Development",
                description: "Responsible for the legal system, constitutional affairs, and the administration of justice.",
                category: "government-departments"
            },
            {
                id: "st-dept-mineral-energy",
                title: "Department of Mineral Resources and Energy",
                description: "Manages the exploitation of mineral resources and energy policy, including sustainable practices in energy development.",
                category: "government-departments"
            },
            {
                id: "st-dept-police",
                title: "Department of Police",
                description: "Oversees national policing, law enforcement, and public safety initiatives.",
                category: "government-departments"
            },
            {
                id: "st-dept-public-enterprises",
                title: "Department of Public Enterprises",
                description: "Manages state-owned enterprises and the oversight of strategic public companies.",
                category: "government-departments"
            },
            {
                id: "st-dept-public-service",
                title: "Department of Public Service and Administration",
                description: "Focuses on the performance, ethics, and management of the public service.",
                category: "government-departments"
            },
            {
                id: "st-dept-public-works",
                title: "Department of Public Works and Infrastructure",
                description: "Responsible for government infrastructure projects and public construction initiatives.",
                category: "government-departments"
            },
            {
                id: "st-dept-small-business",
                title: "Department of Small Business Development",
                description: "Promotes the growth and sustainability of small, medium, and micro-enterprises.",
                category: "government-departments"
            },
            {
                id: "st-dept-social-dev",
                title: "Department of Social Development",
                description: "Manages social welfare programs, poverty alleviation, and community support services.",
                category: "government-departments"
            },
            {
                id: "st-dept-sport-arts-culture",
                title: "Department of Sport, Arts and Culture",
                description: "Oversees policies related to sports, cultural heritage, and the arts.",
                category: "government-departments"
            },
            {
                id: "st-dept-trade-industry",
                title: "Department of Trade, Industry and Competition",
                description: "Facilitates industrial growth, trade policy, and market competition.",
                category: "government-departments"
            },
            {
                id: "st-dept-transport",
                title: "Department of Transport",
                description: "Manages national transportation networks, road safety, and public transit systems.",
                category: "government-departments"
            },
            {
                id: "st-dept-tourism",
                title: "Department of Tourism",
                description: "Focuses on promoting tourism, managing tourist infrastructure, and supporting the travel industry.",
                category: "government-departments"
            },
            {
                id: "st-dept-correctional",
                title: "Department of Correctional Services",
                description: "Oversees the management of prisons and the rehabilitation of offenders.",
                category: "government-departments"
            },
            {
                id: "st-dept-science-tech",
                title: "Department of Science and Technology",
                description: "Drives innovation, scientific research, and technology development in the country.",
                category: "government-departments"
            },
            {
                id: "st-dept-women-youth-disabilities",
                title: "Department of Women, Youth and Persons with Disabilities",
                description: "Develops policies and programs to promote equality, empowerment, and opportunities for women, youth, and individuals with disabilities.",
                category: "government-departments"
            },
            
            // Policy Topics
            {
                id: "st-policy-nhi",
                title: "National Health Insurance",
                description: "Rate your satisfaction with the National Health Insurance policy implementation and its potential impact.",
                category: "policies"
            },
            {
                id: "st-policy-land-reform",
                title: "Land Reform Policy",
                description: "Rate your satisfaction with the government's land reform and redistribution policies.",
                category: "policies"
            },
            {
                id: "st-policy-big",
                title: "Basic Income Grant",
                description: "Rate your satisfaction with the basic income grant proposal and related social support policies.",
                category: "policies"
            },
            {
                id: "st-policy-anti-corruption",
                title: "Anti-Corruption Strategies",
                description: "Rate your satisfaction with the effectiveness of government anti-corruption strategies and initiatives.",
                category: "policies"
            },
            {
                id: "st-policy-job-creation",
                title: "Job Creation Policies",
                description: "Rate your satisfaction with government policies aimed at creating employment opportunities.",
                category: "policies"
            },
            {
                id: "st-policy-renewable-energy",
                title: "Renewable Energy Policy",
                description: "Rate your satisfaction with policies promoting renewable energy and transitioning away from fossil fuels.",
                category: "policies"
            }
        ];

        // Initialize each topic with 0 votes and score
        return defaultTopics.map(topic => ({
            ...topic,
            totalVotes: 0,
            averageScore: 0
        }));
    }

    // Save data to localStorage
    saveToLocalStorage() {
        try {
            // Save sentiment topics
            const topicsJson = JSON.stringify(this.sentimentTopics);
            localStorage.setItem('sentimentTopics', topicsJson);
            
            // Save user votes
            const userVotesJson = JSON.stringify(this.userVotes);
            localStorage.setItem('userVotes', userVotesJson);
            
            // Log success
            console.log(`Successfully saved to localStorage: ${this.sentimentTopics.length} topics and votes for ${Object.keys(this.userVotes).length} users`);
            
            return true;
        } catch (error) {
            console.error('Error saving sentiment data to localStorage:', error);
            
            // Check if localStorage is full
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.warn('localStorage quota exceeded. Trying to save only essential data...');
                
                try {
                    // Try saving just the essential data (topic IDs, vote counts, and user vote references)
                    const simplifiedTopics = this.sentimentTopics.map(topic => ({
                        id: topic.id, 
                        totalVotes: topic.totalVotes,
                        averageScore: topic.averageScore
                    }));
                    
                    localStorage.setItem('sentimentTopics_minimal', JSON.stringify(simplifiedTopics));
                    localStorage.setItem('userVotes', userVotesJson); // Still try to save user votes
                    
                    console.log('Saved simplified data to localStorage');
                } catch (fallbackError) {
                    console.error('Failed to save even simplified data:', fallbackError);
                }
            }
            
            return false;
        }
    }

    // Get all sentiment topics
    getAllTopics() {
        return this.sentimentTopics;
    }

    // Get topics by category
    getTopicsByCategory(category) {
        if (!category || category === 'all') {
            return this.sentimentTopics;
        }
        return this.sentimentTopics.filter(topic => topic.category === category);
    }

    // Get topic by ID
    getTopicById(topicId) {
        return this.sentimentTopics.find(topic => topic.id === topicId);
    }

    // Get user votes (requires authentication)
    getUserVotes(userId) {
        if (!userId) return [];
        return this.userVotes[userId] || [];
    }

    // Get user vote for a specific topic
    getUserVoteForTopic(userId, topicId) {
        if (!userId) return null;
        const userVotesList = this.userVotes[userId] || [];
        return userVotesList.find(vote => vote.topicId === topicId);
    }

    // Add user vote (requires authentication)
    addUserVote(userId, topicId, satisfaction) {
        // If no user ID provided, create a temporary one
        if (!userId) {
            userId = 'temp-user-' + Date.now();
            sessionStorage.setItem('tempUserId', userId);
            console.log('Created temporary user ID for voting:', userId);
        }
        
        // Ensure satisfaction is a valid number (e.g., 1-5)
        if (typeof satisfaction !== 'number' || satisfaction < 1 || satisfaction > 5) {
            console.error(`Invalid satisfaction rating provided: ${satisfaction}`);
            return false;
        }

        // Initialize user's votes array if it doesn't exist
        if (!this.userVotes[userId]) {
            this.userVotes[userId] = [];
        }

        // Find topic
        const topic = this.getTopicById(topicId);
        if (!topic) {
            console.error(`Topic not found for voting: ${topicId}`);
            return false;
        }

        // Ensure topic stats are initialized correctly
        topic.totalVotes = topic.totalVotes || 0;
        topic.averageScore = topic.averageScore || 0;

        // Check if user has already voted on this topic
        const existingVoteIndex = this.userVotes[userId].findIndex(vote => vote.topicId === topicId);
        const voteDate = new Date().toISOString();
        let oldVoteValue = 0;
        let isNewVote = false;
        
        // If user has already voted, update their vote
        if (existingVoteIndex !== -1) {
            oldVoteValue = this.userVotes[userId][existingVoteIndex].satisfaction;
            // Update only if the vote value has actually changed
            if(oldVoteValue === satisfaction) {
                console.log('User clicked the same vote again. No change needed.');
                return false; // No change needed
            }
            this.userVotes[userId][existingVoteIndex] = {
                topicId,
                satisfaction,
                date: voteDate
            };
        } else {
            // Add new vote
            isNewVote = true;
            this.userVotes[userId].push({
                topicId,
                satisfaction,
                date: voteDate
            });
        }
        
        // Recalculate average score and total votes
        if (isNewVote) {
            topic.totalVotes++;
            topic.averageScore = ((topic.averageScore * (topic.totalVotes - 1)) + satisfaction) / topic.totalVotes;
        } else {
            // Score was updated, recalculate based on old and new values
            topic.averageScore = ((topic.averageScore * topic.totalVotes) - oldVoteValue + satisfaction) / topic.totalVotes;
        }
        // Round to 1 decimal place
        topic.averageScore = parseFloat(topic.averageScore.toFixed(1));
        
        // Save updated data - make sure this is working!
        try {
            this.saveToLocalStorage();
            console.log('Successfully saved votes to localStorage!');
        } catch (error) {
            console.error('Error saving votes to localStorage:', error);
        }
        
        console.log(`Vote recorded: User ${userId} gave ${satisfaction}/5 for "${topic.title}". Topic now has ${topic.totalVotes} votes with average ${topic.averageScore}.`);
        
        // Immediately update the hero stats
        if (typeof initializeStats === 'function') {
            initializeStats();
        }
        
        // Notify other components that votes have changed
        document.dispatchEvent(new CustomEvent('sentimentVoteChanged', {
            detail: { 
                topicId, 
                userId, 
                satisfaction, 
                topicTitle: topic.title,
                totalVotes: topic.totalVotes,
                averageScore: topic.averageScore,
                isNewVote: isNewVote
            }
        }));
        
        return true;
    }

    // Get total number of topics
    getTotalTopicsCount() {
        return this.sentimentTopics.length;
    }

    // Get total number of votes across all topics
    getTotalVotesCount() {
        const total = this.sentimentTopics.reduce((sum, topic) => sum + (topic.totalVotes || 0), 0);
        console.log(`Total votes calculated: ${total}`);
        return total;
    }

    // Get average satisfaction score across all topics
    getOverallSatisfactionScore() {
        const totalVotes = this.getTotalVotesCount();
        
        // If no votes, return 0
        if (totalVotes === 0) {
            console.log('No votes found, returning 0 for overall satisfaction');
            return 0;
        }
        
        const totalScores = this.sentimentTopics.reduce((sum, topic) => {
            // Ensure we have valid numbers
            const topicVotes = topic.totalVotes || 0;
            const topicScore = topic.averageScore || 0;
            
            // Only add to sum if this topic has votes
            return sum + (topicScore * topicVotes);
        }, 0);
        
        const overallScore = parseFloat((totalScores / totalVotes).toFixed(1));
        console.log(`Overall satisfaction: ${overallScore} (${totalScores} / ${totalVotes})`);
        return overallScore;
    }

    // Get vote distribution percentages for a topic
    getVoteDistribution(topicId) {
        // Find all votes for this topic across all users
        let voteDistribution = {
            'very-dissatisfied': 0,
            'dissatisfied': 0,
            'neutral': 0,
            'satisfied': 0,
            'very-satisfied': 0
        };
        
        // Count for each rating
        let counts = {
            1: 0, // very-dissatisfied
            2: 0, // dissatisfied
            3: 0, // neutral
            4: 0, // satisfied
            5: 0  // very-satisfied
        };
        
        // Go through all user votes to find votes for this topic
        Object.values(this.userVotes).forEach(userVotesList => {
            userVotesList.forEach(vote => {
                if (vote.topicId === topicId) {
                    counts[vote.satisfaction]++;
                }
            });
        });
        
        // Map rating numbers to sentiment values
        const ratingToSentiment = {
            1: 'very-dissatisfied',
            2: 'dissatisfied',
            3: 'neutral',
            4: 'satisfied',
            5: 'very-satisfied'
        };
        
        // Convert counts to percentages
        const topic = this.getTopicById(topicId);
        if (topic && topic.totalVotes > 0) {
            Object.keys(counts).forEach(rating => {
                const sentimentKey = ratingToSentiment[rating];
                voteDistribution[sentimentKey] = Math.round((counts[rating] / topic.totalVotes) * 100);
            });
        }
        
        return voteDistribution;
    }

    // Search topics by title or description
    searchTopics(query) {
        if (!query) return this.sentimentTopics;
        
        query = query.toLowerCase();
        return this.sentimentTopics.filter(topic => 
            topic.title.toLowerCase().includes(query) ||
            topic.description.toLowerCase().includes(query)
        );
    }

    // Get trend data for a specific category and timeframe
    getTrendData(timeframe, category) {
        const allTopics = category === 'all' ? 
            this.sentimentTopics : 
            this.sentimentTopics.filter(topic => topic.category === category);
            
        // For demo purposes, we'll derive trends from current data
        // In a real app, this would use historical snapshots
        
        // Get average scores for different sentiments
        const overallScore = this.getOverallSatisfactionScore();
        
        // Calculate positive sentiment (ratings 4-5)
        const positiveVotes = Object.values(this.userVotes).flat().filter(
            vote => {
                const topic = this.getTopicById(vote.topicId);
                return (category === 'all' || topic?.category === category) && 
                       (vote.satisfaction >= 4);
            }
        ).length;
        
        // Calculate negative sentiment (ratings 1-2)
        const negativeVotes = Object.values(this.userVotes).flat().filter(
            vote => {
                const topic = this.getTopicById(vote.topicId);
                return (category === 'all' || topic?.category === category) && 
                       (vote.satisfaction <= 2);
            }
        ).length;
        
        const totalVotes = Object.values(this.userVotes).flat().filter(
            vote => {
                const topic = this.getTopicById(vote.topicId);
                return (category === 'all' || topic?.category === category);
            }
        ).length;
        
        // Calculate percentages
        const positivePercentage = totalVotes > 0 ? (positiveVotes / totalVotes) * 100 : 0;
        const negativePercentage = totalVotes > 0 ? (negativeVotes / totalVotes) * 100 : 0;
        const neutralPercentage = 100 - positivePercentage - negativePercentage;
        
        // Generate trend data points
        // For demo purposes, we'll simulate historical points based on current data
        const numPoints = timeframe === 'month' ? 4 : 
                        timeframe === 'quarter' ? 3 : 
                        timeframe === 'year' ? 6 : 5;
        
        // Create trend lines with some variation around current values
        const overallTrend = this.generateTrendLine(overallScore * 20, numPoints);
        const positiveTrend = this.generateTrendLine(positivePercentage, numPoints);
        const negativeTrend = this.generateTrendLine(negativePercentage, numPoints, true);
        
        return {
            overallTrend,
            positiveTrend,
            negativeTrend,
            currentStats: {
                overallScore: overallScore * 20, // Convert 0-5 to percentage
                positivePercentage,
                negativePercentage,
                neutralPercentage,
                totalTopics: allTopics.length,
                totalVotes
            }
        };
    }
    
    // Helper to generate trend lines with realistic variations
    generateTrendLine(currentValue, numPoints, isInverted = false) {
        const result = [];
        let prevValue = isInverted ? 
            currentValue * (1 + Math.random() * 0.2) : 
            currentValue * (1 - Math.random() * 0.2);
            
        for (let i = 0; i < numPoints; i++) {
            // Add small random variations to simulate a trend
            const variation = (Math.random() * 10) - 5; // -5 to +5
            let nextValue = prevValue + variation;
            
            // Move towards the current value as we get closer to present
            const weight = i / (numPoints - 1);
            nextValue = (weight * currentValue) + ((1 - weight) * nextValue);
            
            // Ensure values stay within reasonable range
            nextValue = Math.max(0, Math.min(100, nextValue));
            
            result.push(nextValue);
            prevValue = nextValue;
        }
        
        // Make sure the last point matches current value
        if (result.length > 0) {
            result[result.length - 1] = currentValue;
        }
        
        return result;
    }
    
    // Get insights based on data analysis
    getInsights(timeframe, category) {
        const trendData = this.getTrendData(timeframe, category);
        const { overallTrend, positiveTrend, negativeTrend, currentStats } = trendData;
        
        // Calculate changes from first to last data point
        const overallChange = this.calculateChange(overallTrend);
        const positiveChange = this.calculateChange(positiveTrend);
        const negativeChange = this.calculateChange(negativeTrend);
        
        // Generate insights texts
        const insights = [
            {
                title: "Overall Trend",
                description: `Satisfaction has ${overallChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(overallChange).toFixed(1)}% in the last ${this.getTimeframeText(timeframe)}`,
                icon: "chart-line",
                change: overallChange
            },
            {
                title: `${this.getCategoryText(category)} Sentiment`,
                description: `Positive sentiment ${positiveChange >= 0 ? 'up' : 'down'} ${Math.abs(positiveChange).toFixed(1)}% with ${currentStats.positivePercentage.toFixed(1)}% of votes positive`,
                icon: "thumbs-up",
                change: positiveChange
            },
            {
                title: "Public Response",
                description: `${currentStats.totalVotes} total votes across ${currentStats.totalTopics} topics in this category`,
                icon: "users",
                change: currentStats.totalVotes
            },
            {
                title: "Key Improvement",
                description: `Negative sentiment ${negativeChange <= 0 ? 'decreased' : 'increased'} by ${Math.abs(negativeChange).toFixed(1)}% in this period`,
                icon: "chart-bar",
                change: -negativeChange // Inverting since decreasing negative is positive
            }
        ];
        
        return insights;
    }
    
    // Helper to calculate percentage change between first and last point
    calculateChange(trendLine) {
        if (!trendLine || trendLine.length < 2) return 0;
        const firstPoint = trendLine[0];
        const lastPoint = trendLine[trendLine.length - 1];
        return lastPoint - firstPoint;
    }
    
    // Get human-readable timeframe text
    getTimeframeText(timeframe) {
        switch(timeframe) {
            case 'month': return 'month';
            case 'quarter': return 'quarter';
            case 'year': return 'year';
            case 'all': return 'period';
            default: return 'period';
        }
    }
    
    // Get human-readable category text
    getCategoryText(category) {
        switch(category) {
            case 'service-delivery': return 'Service Delivery';
            case 'political-parties': return 'Political Parties';
            case 'government-departments': return 'Government';
            case 'policies': return 'Policy';
            case 'all': return 'Overall';
            default: return 'Overall';
        }
    }
}

// Main application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sentiment Page DOM Loaded');
    
    // Initialize the sentiment service
    const sentimentService = new SentimentService();
    
    // Update the hero section stats right away
    initializeStats();
    
    // Set up UI components
    setupTabNavigation();
    initializeSentimentUI();
    setupSearch();
    
    // Setup authentication modal
    setupAuthModal();
    
    // Set up visualizations
    // initializeVisualizations(); // Commented out until visualization section is recreated
    
    // Listen for vote changes to update stats in real-time
    document.addEventListener('sentimentVoteChanged', () => {
        console.log('Vote change detected, updating hero stats');
        initializeStats();
    });
    
    // Listen for topic creation to update stats
    document.addEventListener('sentimentTopicCreated', (event) => {
        console.log('New topic created, updating hero stats');
        initializeStats();
    });
    
    console.log('Sentiment page initialization complete');
});

// Function to get the current user's ID
function getUserId() {
    // Try to get the logged in user
    try {
        // Check if user data exists in localStorage or sessionStorage
        const userData = JSON.parse(localStorage.getItem('accountabilitySAUser') || sessionStorage.getItem('accountabilitySAUser') || '{}');
        if (userData && userData.id) {
            console.log('User found in storage:', userData.id);
            return userData.id;
        }
        
        // As a backup, check AuthService
        const authService = typeof AuthService !== 'undefined' ? AuthService : null;
        if (authService && authService.getCurrentUser) {
            const user = authService.getCurrentUser();
            if (user && user.id) {
                console.log('User found in AuthService:', user.id);
                return user.id;
            }
        }
    } catch (error) {
        console.error('Error getting user ID:', error);
    }
    
    // If no logged in user, check for a temporary ID
    let tempId = sessionStorage.getItem('tempUserId');
    
    // If no temporary ID exists, create one
    if (!tempId) {
        tempId = 'temp-user-' + new Date().getTime();
        sessionStorage.setItem('tempUserId', tempId);
        console.log('Created temporary user ID:', tempId);
    }
    
    return tempId;
}

// Update UI based on authentication status
function updateAuthUI(userId) {
    // Don't require login for any functionality
    
    // Get UI elements
    const loginCTA = document.getElementById('sentiment-login-cta');
    const createTopicBtn = document.getElementById('create-topic-btn');
    const myVotesBtn = document.getElementById('my-votes-btn');
    
    // If login CTA exists, hide it since we're allowing all users to participate
    if (loginCTA) {
        loginCTA.style.display = 'none';
    }
    
    // Set up Create Topic button to work for all users
    if (createTopicBtn) {
        createTopicBtn.disabled = false;
        createTopicBtn.addEventListener('click', showAuthModal);
    }
    
    // Set up My Votes button to work for all users
    if (myVotesBtn) {
        myVotesBtn.disabled = false;
        myVotesBtn.addEventListener('click', () => {
            // If user is logged in, show their votes
            // Otherwise generate a temporary ID for this session
            const currentUserId = userId || 'temp-user-' + new Date().getTime();
            
            // TODO: Implement showing the user's votes
            alert('This feature will show your votes. Your temporary user ID is: ' + currentUserId);
        });
    }
    
    // Enable voting on all sentiment cards
    const votingOptions = document.querySelectorAll('.voting-options');
    votingOptions.forEach(options => {
        options.classList.remove('disabled');
        
        // Set up vote buttons to work for all users
        const voteButtons = options.querySelectorAll('.vote-option');
        voteButtons.forEach(button => {
            // Remove any existing click event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add the vote handler directly
            newButton.addEventListener('click', handleVote);
        });
    });
}

// Initialize statistics for the hero section
function initializeStats() {
    console.log('Initializing hero section statistics');
    const sentimentService = new SentimentService();
    
    const topicsCountElement = document.getElementById('topics-count');
    const votesCountElement = document.getElementById('votes-count');
    
    // Get actual counts from sentiment service
    const topicsCount = sentimentService.getTotalTopicsCount();
    const votesCount = sentimentService.getTotalVotesCount();
    
    console.log(`Stats: ${topicsCount} topics, ${votesCount} votes`);
    
    // Update the DOM elements if they exist
    if (topicsCountElement) {
        topicsCountElement.textContent = topicsCount;
    }
    
    if (votesCountElement) {
        votesCountElement.textContent = votesCount.toLocaleString();
    }
}

// Update the setupTabNavigation function to remove user-created tab handling
function setupTabNavigation() {
    console.log('Setting up sentiment tab navigation');
    
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Set default active tab
    let activeTab = 'service-delivery';
    
    // Check if there's a tab specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
        // Validate that the tab exists
        const tabExists = Array.from(tabButtons).some(btn => btn.dataset.category === tabParam);
        if (tabExists) {
            console.log(`Using tab from URL param: ${tabParam}`);
            activeTab = tabParam;
        }
    }
    
    // Set active tab based on the decision above
    tabButtons.forEach(tab => {
        const isActive = tab.dataset.category === activeTab;
        tab.classList.toggle('active', isActive);
        
        // Add click event listeners
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update URL with the selected tab
            const url = new URL(window.location);
            url.searchParams.set('tab', category);
            history.replaceState(null, '', url);
            
            // Update UI
            tabButtons.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show the corresponding tab pane
            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === `${category}-tab`);
            });
            
            // Load topics for the selected category
            loadTopics(category);
        });
    });
    
    // Activate the default/selected tab
    const defaultTab = document.querySelector(`.tab-button[data-category="${activeTab}"]`);
    if (defaultTab) {
        defaultTab.click();
    } else {
        // Fallback to first tab if the target one doesn't exist
        const firstTab = document.querySelector('.tab-button');
        if (firstTab) {
            firstTab.click();
        }
    }
}

// Load topics based on selected category
function loadTopics(category, showOnlyMyVotes = false) {
    console.log(`Loading topics for category: ${category}, showOnlyMyVotes: ${showOnlyMyVotes}`);
    
    // Update active tab
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // Update active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        const paneId = `${category}-tab`;
        // Use the 'active' class instead of inline style
        pane.classList.toggle('active', pane.id === paneId);
    });
    
    // Exit if showing user-created topics - this category no longer exists
    if (category === 'user-created') {
        console.log('User-created topics are no longer supported');
        return;
    }
    
    // Load topics from the service
    const sentimentService = new SentimentService();
    const topics = sentimentService.getTopicsByCategory(category);
    
    // Get current user's votes if needed
    const userId = getUserId();
    let userVotes = [];
    
    if (userId) {
        userVotes = sentimentService.getUserVotes(userId) || [];
        console.log(`Found ${userVotes.length} votes for user ${userId}`);
    }
    
    // Filter topics based on user votes if needed
    let displayedTopics = topics;
    if (showOnlyMyVotes && userId) {
        const votedTopicIds = userVotes.map(vote => vote.topicId);
        displayedTopics = topics.filter(topic => votedTopicIds.includes(topic.id));
        console.log(`Filtering to show only ${displayedTopics.length} voted topics`);
    }
    
    // Get the grid element for this category
    const gridElement = document.getElementById(`${category}-grid`);
    if (!gridElement) {
        console.error(`Grid element not found for category: ${category}`);
        return;
    }
    
    // Display topics on the page
    gridElement.innerHTML = '';
    
    if (displayedTopics.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-comment-slash"></i>
            <h3>No topics found</h3>
            ${showOnlyMyVotes ? '<p>You haven\'t voted on any topics in this category yet.</p>' : '<p>No topics are available for this category.</p>'}
        `;
        gridElement.appendChild(emptyState);
        return;
    }
    
    // Render each topic
    displayedTopics.forEach(topic => {
        const topicCard = createTopicCard(topic, userId);
        gridElement.appendChild(topicCard);
    });
}

// Create a single topic card
function createTopicCard(topic, userId) {
    const sentimentService = new SentimentService();
    const userVote = userId ? sentimentService.getUserVoteForTopic(userId, topic.id) : null;
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'sentiment-card';
    card.dataset.topicId = topic.id;
    
    // Create card header
    const header = document.createElement('div');
    header.className = 'sentiment-header';
    header.innerHTML = `
        <h3>${topic.title}</h3>
        <span class="sentiment-category ${topic.category}">${formatCategory(topic.category)}</span>
    `;
    
    // Create card description
    const description = document.createElement('div');
    description.className = 'sentiment-description';
    description.textContent = topic.description;
    
    // Calculate the actual rating on 1-5 scale instead of percentage
    const actualRating = topic.averageScore;
    
    // Create sentiment meter
    const meter = document.createElement('div');
    meter.className = 'sentiment-meter';
    meter.innerHTML = `
        <div class="meter-stats">
            <div class="satisfaction-score">
                <div class="score-value">${actualRating.toFixed(1)}</div>
                <div class="score-label">SATISFACTION</div>
            </div>
            <div class="votes-count">
                <div class="votes-value">${topic.totalVotes.toLocaleString()}</div>
                <div class="votes-label">VOTES</div>
            </div>
        </div>
        <div class="meter-bar">
            <div class="meter-fill" style="width: ${(actualRating / 5) * 100}%"></div>
        </div>
    `;
    
    // Create voting section
    const voting = document.createElement('div');
    voting.className = 'sentiment-voting';
    
    let votingContent = `
        <h4 class="voting-title">Share Your Opinion</h4>
        <div class="voting-options ${userId ? '' : 'disabled'}">
            <button class="vote-option ${userVote && userVote.satisfaction === 1 ? 'selected' : ''}" data-value="very-dissatisfied" data-topic-id="${topic.id}" data-rating="1">
                <i class="fas fa-angry"></i>
                <span class="vote-percentage">1</span>
            </button>
            <button class="vote-option ${userVote && userVote.satisfaction === 2 ? 'selected' : ''}" data-value="dissatisfied" data-topic-id="${topic.id}" data-rating="2">
                <i class="fas fa-frown"></i>
                <span class="vote-percentage">2</span>
            </button>
            <button class="vote-option ${userVote && userVote.satisfaction === 3 ? 'selected' : ''}" data-value="neutral" data-topic-id="${topic.id}" data-rating="3">
                <i class="fas fa-meh"></i>
                <span class="vote-percentage">3</span>
            </button>
            <button class="vote-option ${userVote && userVote.satisfaction === 4 ? 'selected' : ''}" data-value="satisfied" data-topic-id="${topic.id}" data-rating="4">
                <i class="fas fa-smile"></i>
                <span class="vote-percentage">4</span>
            </button>
            <button class="vote-option ${userVote && userVote.satisfaction === 5 ? 'selected' : ''}" data-value="very-satisfied" data-topic-id="${topic.id}" data-rating="5">
                <i class="fas fa-grin-stars"></i>
                <span class="vote-percentage">5</span>
            </button>
        </div>
        <div class="voting-message"></div>
    `;
    
    voting.innerHTML = votingContent;
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(meter);
    card.appendChild(voting);
    
    // Add event listeners for voting
    if (userId) {
        const voteButtons = voting.querySelectorAll('.vote-option');
        voteButtons.forEach(button => {
            button.addEventListener('click', handleVote);
        });
    } else {
        const voteButtons = voting.querySelectorAll('.vote-option');
        voteButtons.forEach(button => {
            button.addEventListener('click', showAuthModal);
        });
    }
    
    return card;
}

// Handle vote button click
function handleVote(event) {
    // Get the clicked button's data
    const button = event.currentTarget;
    const topicId = button.dataset.topicId;
    const satisfaction = parseInt(button.dataset.rating);
    
    // Get user ID (will always return either actual user ID or temporary ID)
    const userId = getUserId();
    
    // Log the vote for debugging
    console.log(`User ${userId} voted on topic ${topicId} with satisfaction level ${satisfaction}`);
    
    // Add the vote to the service
    const sentimentService = new SentimentService();
    const result = sentimentService.addUserVote(userId, topicId, satisfaction);
    
    if (result) {
        // Update UI for the topic
        updateTopicUI(topicId);
        
        // Update topic in all parts of UI where it might appear
        updateTopicDisplay(topicId);
        
        // Update main stats in the hero section
        initializeStats();
        
        // Show success message
        const votingMessage = button.closest('.sentiment-voting').querySelector('.voting-message');
        if (votingMessage) {
            votingMessage.innerHTML = '<div class="vote-success"><i class="fas fa-check-circle"></i> Your vote has been recorded!</div>';
            setTimeout(() => {
                votingMessage.innerHTML = '';
            }, 3000);
        }
        
        // Force a refresh of the hero stats to ensure they're up to date
        setTimeout(initializeStats, 100);
        
        // Update dashboard counts if on user account page
        updateAccountDashboard();
    } else {
        // Show error message
        console.error(`Failed to register vote for topic ${topicId}`);
        const votingMessage = button.closest('.sentiment-voting').querySelector('.voting-message');
        if (votingMessage) {
            votingMessage.innerHTML = '<div class="vote-error"><i class="fas fa-exclamation-circle"></i> There was an error recording your vote. Please try again.</div>';
            setTimeout(() => {
                votingMessage.innerHTML = '';
            }, 3000);
        }
    }
}

// Update UI for a specific topic
function updateTopicUI(topicId) {
    const sentimentService = new SentimentService();
    const userId = getUserId();
    
    const topic = sentimentService.getTopicById(topicId);
    if (!topic) return;
    
    // Find the card for this topic
    const card = document.querySelector(`.sentiment-card[data-topic-id="${topicId}"]`);
    if (!card) return;
    
    // Update the satisfaction score - now showing the actual 1-5 rating
    const scoreValue = card.querySelector('.score-value');
    if (scoreValue) {
        scoreValue.textContent = topic.averageScore.toFixed(1);
    }
    
    // Update the votes count
    const votesValue = card.querySelector('.votes-value');
    if (votesValue) {
        votesValue.textContent = topic.totalVotes.toLocaleString();
    }
    
    // Update the meter fill - now based on a scale of 1-5
    const meterFill = card.querySelector('.meter-fill');
    if (meterFill) {
        meterFill.style.width = `${(topic.averageScore / 5) * 100}%`;
    }
    
    // Get vote distribution
    const voteDistribution = sentimentService.getVoteDistribution(topicId);
    
    // Update vote percentages for each option
    const voteOptions = card.querySelectorAll('.vote-option');
    voteOptions.forEach(option => {
        const sentiment = option.getAttribute('data-value');
        const rating = option.getAttribute('data-rating');
        const percentage = voteDistribution[sentiment] || 0;
        
        // Find or create percentage element
        let percentageEl = option.querySelector('.vote-percentage');
        if (!percentageEl) {
            percentageEl = document.createElement('span');
            percentageEl.className = 'vote-percentage';
            option.appendChild(percentageEl);
        }
        
        // Update to show the rating points instead of percentage
        percentageEl.textContent = rating;
    });
    
    // Update the voting buttons
        const userVote = sentimentService.getUserVoteForTopic(userId, topicId);
        
    // Remove 'selected' class from all buttons first
    voteOptions.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add 'selected' class to the button corresponding to the user's vote
        if (userVote) {
            const selectedBtn = card.querySelector(`.vote-option[data-rating="${userVote.satisfaction}"]`);
            if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
    }
}

// Setup search functionality
function setupSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            
            if (query) {
                searchTopics(query);
            } else {
                // If search is empty, revert to current tab
                const activeTab = document.querySelector('.tab-button.active');
                if (activeTab) {
                    const category = activeTab.dataset.category;
                    loadTopics(category);
                }
            }
        });
    }
}

// Search topics
function searchTopics(query) {
    const sentimentService = new SentimentService();
    const userId = getUserId();
    
    // Search for topics
    const topics = sentimentService.searchTopics(query);
    
    // Make all tab panes inactive
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Get the service-delivery tab container and make it active
    const activePane = document.getElementById('service-delivery-tab');
    if (activePane) {
        activePane.classList.add('active');
    }
    
    // Get the container to populate
    const container = document.getElementById('service-delivery-grid');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // If no topics found, show empty state
    if (topics.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>No topics match your search criteria. Try a different search term.</p>
            </div>
        `;
        return;
    }
    
    // Add search results heading
    const resultsHeading = document.createElement('div');
    resultsHeading.className = 'search-results-heading';
    resultsHeading.innerHTML = `
        <h3>Search Results for "${query}"</h3>
        <p>${topics.length} topics found</p>
    `;
    container.appendChild(resultsHeading);
    
    // Create grid to hold the cards
    const grid = document.createElement('div');
    grid.className = 'sentiment-grid';
    container.appendChild(grid);
    
    // Populate topics
    topics.forEach(topic => {
        grid.appendChild(createTopicCard(topic, userId));
    });
}

// Setup authentication modal
function setupAuthModal() {
    console.log('Setting up authentication modal');
    
    const authModal = document.getElementById('auth-modal');
    if (!authModal) {
        console.error('Auth modal not found');
        return;
    }
    
    // Set up close button
    const closeBtn = authModal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            authModal.style.display = 'none';
        });
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === authModal) {
            authModal.style.display = 'none';
        }
    });
}

// Keep these functions but remove references to user created topics
function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
}

// Initialize visualization section (commented out until it's recreated with more user data)
/*
function initializeVisualizations() {
    console.log('Initializing visualization section');
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    
    // Setup visualization event listeners
    setupVisualizationControls();
    
    // Create Chart.js visualization (mock implementation)
    renderChart();
    
    // Initialize insights counters with animation
    initializeInsightCounters();
}

// Setup visualization controls
function setupVisualizationControls() {
    const timeframeSelect = document.getElementById('viz-timeframe');
    const categorySelect = document.getElementById('viz-category');
    
    if (timeframeSelect && categorySelect) {
        // Add event listeners for visualization filters
        timeframeSelect.addEventListener('change', () => {
            renderChart();
            updateInsightsForSelection();
        });
        
        categorySelect.addEventListener('change', () => {
            renderChart();
            updateInsightsForSelection();
        });
    }
}

// Render chart based on selected filters
function renderChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    
    const timeframeSelect = document.getElementById('viz-timeframe');
    const categorySelect = document.getElementById('viz-category');
    
    const timeframe = timeframeSelect?.value || 'quarter';
    const category = categorySelect?.value || 'all';
    
    console.log(`Rendering chart with: timeframe=${timeframe}, category=${category}`);
    
    // Show loading state
    chartContainer.innerHTML = '<div class="chart-loading">Loading visualization data...</div>';
    
    // Get real data from the sentiment service
    const sentimentService = new SentimentService();
    const trendData = sentimentService.getTrendData(timeframe, category);
    
    // Simulate API delay
    setTimeout(() => {
        // Scale trend data for SVG
        const overallPoints = scaleTrendDataToSVG(trendData.overallTrend);
        const positivePoints = scaleTrendDataToSVG(trendData.positiveTrend);
        const negativePoints = scaleTrendDataToSVG(trendData.negativeTrend);
        
        // Create SVG paths for trend lines
        const overallPath = createSVGPath(overallPoints);
        const positivePath = createSVGPath(positivePoints);
        const negativePath = createSVGPath(negativePoints);
        
        chartContainer.innerHTML = `
            <div class="chart-inner">
                <div class="chart-header">
                    <h3>Sentiment Trends - ${formatCategory(category)}</h3>
                    <div class="chart-legend">
                        <div class="legend-item"><span class="legend-color" style="background-color: #3498db;"></span> Overall</div>
                        <div class="legend-item"><span class="legend-color" style="background-color: #2ecc71;"></span> Positive</div>
                        <div class="legend-item"><span class="legend-color" style="background-color: #e74c3c;"></span> Negative</div>
                    </div>
                </div>
                
                <div class="chart-area">
                    <div class="chart-y-axis">
                        <div class="y-tick">100%</div>
                        <div class="y-tick">75%</div>
                        <div class="y-tick">50%</div>
                        <div class="y-tick">25%</div>
                        <div class="y-tick">0%</div>
                    </div>
                    
                    <div class="chart-content">
                        <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                            <!-- Grid lines -->
                            <line x1="0" y1="0" x2="1000" y2="0" stroke="#f0f0f0" stroke-width="1" />
                            <line x1="0" y1="75" x2="1000" y2="75" stroke="#f0f0f0" stroke-width="1" />
                            <line x1="0" y1="150" x2="1000" y2="150" stroke="#f0f0f0" stroke-width="1" />
                            <line x1="0" y1="225" x2="1000" y2="225" stroke="#f0f0f0" stroke-width="1" />
                            <line x1="0" y1="299" x2="1000" y2="299" stroke="#f0f0f0" stroke-width="1" />
                            
                            <!-- Chart lines generated from actual data -->
                            <path d="${overallPath}" 
                                  fill="none" stroke="#3498db" stroke-width="3" class="chart-path" />
                                  
                            <path d="${positivePath}" 
                                  fill="none" stroke="#2ecc71" stroke-width="3" class="chart-path" />
                                  
                            <path d="${negativePath}" 
                                  fill="none" stroke="#e74c3c" stroke-width="3" class="chart-path" />
                        </svg>
                    </div>
                </div>
                
                <div class="chart-x-axis">
                    ${getTimeLabels(timeframe)}
                </div>
            </div>
        `;
        
        // Add animation for chart paths
        const paths = document.querySelectorAll('.chart-path');
        paths.forEach(path => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.getBoundingClientRect(); // Trigger reflow
            path.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            path.style.strokeDashoffset = '0';
        });
    }, 800);
}

// Helper function to scale trend data for SVG
function scaleTrendDataToSVG(trendData) {
    if (!trendData || trendData.length === 0) return [];
    
    const points = [];
    const numPoints = trendData.length;
    
    // Calculate x-step based on number of points
    const xStep = 1000 / (numPoints - 1);
    
    trendData.forEach((value, index) => {
        // Calculate x position (0 to 1000)
        const x = index * xStep;
        
        // Calculate y position (0 to 300, inverted as SVG coordinates)
        // Transform from percentage (0-100) to SVG y-coordinate (300-0)
        const y = 300 - (value * 3); // 3 is the scale factor (300/100)
        
        points.push({ x, y });
    });
    
    return points;
}

// Helper function to create SVG path from points
function createSVGPath(points) {
    if (!points || points.length === 0) return '';
    
    // Start with the first point
    let path = `M${points[0].x},${points[0].y}`;
    
    // Add curve to each subsequent point
    for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];
        
        // Use quadratic curves for smoother lines
        // Calculate control point (simple mid-point)
        const cpX = (prevPoint.x + currentPoint.x) / 2;
        
        path += ` Q${cpX},${prevPoint.y} ${currentPoint.x},${currentPoint.y}`;
    }
    
    return path;
}

// Replace the updateInsightsForSelection function with real data
function updateInsightsForSelection() {
    const timeframe = document.getElementById('viz-timeframe')?.value || 'quarter';
    const category = document.getElementById('viz-category')?.value || 'all';
    
    console.log(`Updating insights for: timeframe=${timeframe}, category=${category}`);
    
    // Get the container for insights
    const insightsContainer = document.querySelector('.insights-grid');
    if (!insightsContainer) return;
    
    // Add loading state
    insightsContainer.innerHTML = `
        <div class="loading-insights">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Analyzing sentiment data...</p>
        </div>
    `;
    
    // Get real insights from the service
    const sentimentService = new SentimentService();
    const insights = sentimentService.getInsights(timeframe, category);
    
    // Simulate API delay
    setTimeout(() => {
        // Clear container
        insightsContainer.innerHTML = '';
        
        // Add insight cards
        insights.forEach(insight => {
            const isPositive = insight.change >= 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            const changePrefix = isPositive ? '+' : '';
            
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            insightCard.innerHTML = `
                <div class="insight-icon">
                    <i class="fas fa-${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                    ${insight.change !== null ? `<span class="highlight ${changeClass}">${changePrefix}${Math.abs(insight.change).toFixed(1)}%</span>` : ''}
                </div>
            `;
            
            insightsContainer.appendChild(insightCard);
        });
    }, 1000);
}

// Initialize insight counters with animation
function initializeInsightCounters() {
    const counters = document.querySelectorAll('.highlight[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        const isPositive = counter.classList.contains('positive');
        const prefix = isPositive ? '+' : '';
        const suffix = counter.getAttribute('data-suffix') || '';
        
        let current = 0;
        const increment = target / 30; // Animate in 30 steps
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = `${prefix}${Math.round(current)}${suffix}`;
        }, 30);
    });
}
*/

// Modify the initializeSentimentUI function to remove the visualization setup
function initializeSentimentUI() {
    console.log('Initializing sentiment UI');
    
    // Get sentiment service
    const sentimentService = new SentimentService();
    
    // Setup tabs functionality
    setupTabNavigation();
    
    // Initialize sentiment stats
    initializeStats();
    
    // Setup search functionality
    setupSearch();
    
    // Set up basic UI elements
    updateAuthUI();
    
    // Initialize visualizations if they exist
    // initializeVisualizations(); // Commented out until visualization section is recreated
    
    // Setup auth modal
    setupAuthModal();
    
    // Load initial data
    loadTopics('service-delivery');
    
    // Handle dynamic events like tab changes
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            loadTopics(category);
        });
    });
    
    // Handle "My Votes" button
    const myVotesBtn = document.getElementById('my-votes-btn');
    if (myVotesBtn) {
        myVotesBtn.addEventListener('click', function() {
            const userId = getUserId();
            if (userId) {
                this.classList.toggle('active');
                const isActive = this.classList.contains('active');
                
                if (isActive) {
                    loadUserVotes(userId);
                } else {
                    // Reload topics based on current active tab
                    const activeTab = document.querySelector('.tab-button.active');
                    if (activeTab) {
                        const category = activeTab.dataset.category;
                        loadTopics(category);
                    }
                }
            } else {
                showAuthModal();
            }
        });
    }
    
    // Update styling for all existing sentiment cards
    updateAllCardsToNewStyling();
}

// Function to update all existing cards to the new styling
function updateAllCardsToNewStyling() {
    // Update all voting titles
    const votingTitles = document.querySelectorAll('.voting-title');
    votingTitles.forEach(title => {
        title.textContent = "Share Your Opinion";
    });
    
    // Update all vote buttons to show ratings
    const voteButtons = document.querySelectorAll('.vote-option');
    voteButtons.forEach(button => {
        // Remove any inline styles
        if (button.hasAttribute('style')) {
            button.removeAttribute('style');
        }
        
        // Find the icon and remove any inline styles
        const icon = button.querySelector('i');
        if (icon && icon.hasAttribute('style')) {
            icon.removeAttribute('style');
        }
        
        // Get the rating from the button's data attribute
        const rating = button.getAttribute('data-rating');
        
        // Find or create the rating span
        let ratingSpan = button.querySelector('.vote-percentage');
        if (!ratingSpan) {
            ratingSpan = document.createElement('span');
            ratingSpan.className = 'vote-percentage';
            button.appendChild(ratingSpan);
        }
        
        // Set the rating number
        ratingSpan.textContent = rating;
    });
    
    // Initialize vote ratings for all cards
    const cards = document.querySelectorAll('.sentiment-card');
    const sentimentService = new SentimentService();
    
    cards.forEach(card => {
        const topicId = card.getAttribute('data-topic-id');
        const userId = getUserId();
        const userVote = userId ? sentimentService.getUserVoteForTopic(userId, topicId) : null;
        
        // Update vote options
        const voteOptions = card.querySelectorAll('.vote-option');
        voteOptions.forEach(option => {
            // Remove any existing selected states
            option.classList.remove('selected', 'active');
            
            // If this is the user's vote, mark it as selected
            if (userVote && userVote.satisfaction === parseInt(option.getAttribute('data-rating'))) {
                option.classList.add('selected');
            }
        });
    });
}

// Function to update a topic's display with current data
function updateTopicDisplay(topicId) {
    const sentimentService = new SentimentService();
    const topic = sentimentService.getTopicById(topicId);
    
    if (!topic) {
        console.error(`Topic not found: ${topicId}`);
        return;
    }
    
    // Find all cards matching this topic ID (could be multiple if shown in different tabs)
    const cards = document.querySelectorAll(`.sentiment-card[data-topic-id="${topicId}"]`);
    if (cards.length === 0) {
        console.log(`No cards found for topic: ${topicId} - may not be on current page`);
        // Topic might be on another tab, just update the stats
        initializeStats();
        return;
    }
    
    console.log(`Updating ${cards.length} cards for topic ${topicId} with total votes: ${topic.totalVotes}, score: ${topic.averageScore}`);
    
    // Update all instances of this topic card
    cards.forEach(card => {
        // Update satisfaction score display - show actual score on 1-5 scale
        const scoreValueEl = card.querySelector('.score-value');
        if (scoreValueEl) {
            scoreValueEl.textContent = topic.totalVotes > 0 ? 
                topic.averageScore.toFixed(1) : 
                '0';
        }
        
        // Update votes count
        const votesValueEl = card.querySelector('.votes-value');
        if (votesValueEl) {
            votesValueEl.textContent = topic.totalVotes.toLocaleString();
        }
        
        // Update meter fill - still use percentage for the visual meter
        const meterFillEl = card.querySelector('.meter-fill');
        if (meterFillEl) {
            const fillPercentage = topic.totalVotes > 0 ? (topic.averageScore / 5) * 100 : 0;
            meterFillEl.style.width = `${fillPercentage}%`;
        }
        
        // Update vote options to show rating points
        const voteOptions = card.querySelectorAll('.vote-option');
        voteOptions.forEach(option => {
            const rating = option.getAttribute('data-rating');
            
            // Find or create percentage element
            let percentageEl = option.querySelector('.vote-percentage');
            if (!percentageEl) {
                percentageEl = document.createElement('span');
                percentageEl.className = 'vote-percentage';
                option.appendChild(percentageEl);
            }
            
            // Update to show the rating points (1-5)
            percentageEl.textContent = rating;
        });
        
        // Highlight user's selected vote if they've voted
        const userId = getUserId();
        if (userId) {
            const userVote = sentimentService.getUserVoteForTopic(userId, topicId);
            
            // First remove any existing highlights on all vote buttons
            const allVoteButtons = card.querySelectorAll('.vote-option');
            allVoteButtons.forEach(btn => {
                btn.classList.remove('active'); // Consistently remove only 'active'
                btn.classList.remove('selected'); // Also remove 'selected' class
            });
            
            // Add highlight to user's selected button
            if (userVote) {
                const selectedBtn = card.querySelector(`.vote-option[data-rating="${userVote.satisfaction}"]`);
                if (selectedBtn) {
                    selectedBtn.classList.add('selected'); // Use 'selected' class for consistency
                }
            }
        }
    });
    
    // Always update the hero stats when a topic display is updated
    initializeStats();
}

// Make sure healthcare and education topics are properly displayed
function ensureTopicsDisplayed() {
    // This function has been modified to remove healthcare and education topics
    console.log('Healthcare and Education topics have been removed from the system');
    
    // Update other stats
    initializeStats();
}

// At the bottom of the file, modify document ready function to remove user created topics initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sentiment page loaded');
    
    try {
        // Initialize the UI elements
        initializeSentimentUI();
    } catch (error) {
        console.error('Error initializing sentiment UI:', error);
    }
}); 

// Load user votes
function loadUserVotes(userId) {
    const sentimentService = new SentimentService();
    const userVotes = sentimentService.getUserVotes(userId);
    
    // Show all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Make the service-delivery tab active
    const activePane = document.getElementById('service-delivery-tab');
    if (activePane) {
        activePane.classList.add('active');
    }
    
    if (!userVotes || userVotes.length === 0) {
        // If user has no votes, show empty state
        const container = document.getElementById('service-delivery-grid');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-vote-yea"></i>
                    <h3>No votes yet</h3>
                    <p>You haven't voted on any topics yet. Browse the topics and share your opinion.</p>
                </div>
            `;
        }
        return;
    }
    
    // Get unique topic IDs from user votes
    const topicIds = userVotes.map(vote => vote.topicId);
    
    // Get topics for these IDs
    const topics = topicIds.map(id => sentimentService.getTopicById(id)).filter(Boolean);
    
    // Display these topics
    const container = document.getElementById('service-delivery-grid');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add heading
    const heading = document.createElement('div');
    heading.className = 'my-votes-heading';
    heading.innerHTML = `
        <h3>My Votes</h3>
        <p>Topics you've voted on</p>
    `;
    container.appendChild(heading);
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'sentiment-grid';
    container.appendChild(grid);
    
    // Populate topics
    topics.forEach(topic => {
        grid.appendChild(createTopicCard(topic, userId));
    });
}

// Get x-axis time labels based on selected timeframe
function getTimeLabels(timeframe) {
    let labels = [];
    
    switch(timeframe) {
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            break;
        case 'quarter':
            labels = ['Jan', 'Feb', 'Mar'];
            break;
        case 'year':
            labels = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
            break;
        case 'all':
            labels = ['2020', '2021', '2022', '2023', '2024'];
            break;
        default:
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
    
    return labels.map(label => `<div class="x-tick">${label}</div>`).join('');
}

// Format category name for display
function formatCategory(category) {
    switch(category) {
        case 'service-delivery':
            return 'Service Delivery';
        case 'political-parties':
            return 'Political Parties';
        case 'government-departments':
            return 'Government Departments';
        case 'policies':
            return 'Policies';
        case 'all':
            return 'All Categories';
        case 'service':
            return 'Service Delivery';
        case 'political':
            return 'Political Parties';
        case 'government':
            return 'Government Departments';
        default:
            return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

// Update user dashboard counts
function updateAccountDashboard() {
    // Only run this if we're on an account page and the function exists
    if (window.location.pathname.includes('account.html') && typeof updateDashboardCounts === 'function') {
        updateDashboardCounts();
    }
} 