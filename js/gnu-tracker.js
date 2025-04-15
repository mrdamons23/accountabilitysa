// GNU Tracker Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Timeline tab functionality
    const timelineTabs = document.querySelectorAll('.timeline-tab');
    const policeTimeline = document.querySelector('.police-timeline');
    const utilitiesTimeline = document.querySelector('.utilities-timeline');
    const unemploymentTimeline = document.querySelector('.unemployment-timeline');
    const healthcareTimeline = document.querySelector('.healthcare-timeline');
    const economyTimeline = document.querySelector('.economy-timeline');
    const educationTimeline = document.querySelector('.education-timeline');
    const internationalTimeline = document.querySelector('.international-timeline');
    
    timelineTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            timelineTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show the corresponding timeline
            const timeline = this.getAttribute('data-timeline');
            if (timeline === 'police') {
                policeTimeline.style.display = 'block';
                utilitiesTimeline.style.display = 'none';
                unemploymentTimeline.style.display = 'none';
                healthcareTimeline.style.display = 'none';
                economyTimeline.style.display = 'none';
                educationTimeline.style.display = 'none';
                internationalTimeline.style.display = 'none';
            } else if (timeline === 'utilities') {
                policeTimeline.style.display = 'none';
                utilitiesTimeline.style.display = 'block';
                unemploymentTimeline.style.display = 'none';
                healthcareTimeline.style.display = 'none';
                economyTimeline.style.display = 'none';
                educationTimeline.style.display = 'none';
                internationalTimeline.style.display = 'none';
            } else if (timeline === 'unemployment') {
                policeTimeline.style.display = 'none';
                utilitiesTimeline.style.display = 'none';
                unemploymentTimeline.style.display = 'block';
                healthcareTimeline.style.display = 'none';
                economyTimeline.style.display = 'none';
                educationTimeline.style.display = 'none';
                internationalTimeline.style.display = 'none';
            } else if (timeline === 'healthcare') {
                policeTimeline.style.display = 'none';
                utilitiesTimeline.style.display = 'none';
                unemploymentTimeline.style.display = 'none';
                healthcareTimeline.style.display = 'block';
                economyTimeline.style.display = 'none';
                educationTimeline.style.display = 'none';
                internationalTimeline.style.display = 'none';
            } else if (timeline === 'economy') {
                policeTimeline.style.display = 'none';
                utilitiesTimeline.style.display = 'none';
                unemploymentTimeline.style.display = 'none';
                healthcareTimeline.style.display = 'none';
                economyTimeline.style.display = 'block';
                educationTimeline.style.display = 'none';
                internationalTimeline.style.display = 'none';
            } else if (timeline === 'education') {
                policeTimeline.style.display = 'none';
                utilitiesTimeline.style.display = 'none';
                unemploymentTimeline.style.display = 'none';
                healthcareTimeline.style.display = 'none';
                economyTimeline.style.display = 'none';
                educationTimeline.style.display = 'block';
                internationalTimeline.style.display = 'none';
            } else if (timeline === 'international') {
                policeTimeline.style.display = 'none';
                utilitiesTimeline.style.display = 'none';
                unemploymentTimeline.style.display = 'none';
                healthcareTimeline.style.display = 'none';
                economyTimeline.style.display = 'none';
                educationTimeline.style.display = 'none';
                internationalTimeline.style.display = 'block';
            }
            
            // Initialize collapsible sections after switching tabs
            initCollapsibleSections();
            // Re-attach control button listeners to target the now-visible table
            addControlButtons();
        });
    });
    
    // Initialize collapsible timeline sections
    function initCollapsibleSections() {
        // Group timeline rows by phase headers
        const timelineTables = document.querySelectorAll('.timeline-table');
        
        timelineTables.forEach(table => {
            const phaseHeaders = table.querySelectorAll('.phase-header');
            
            phaseHeaders.forEach(header => {
                // Make phase headers clickable
                if (!header.classList.contains('collapsible-initialized')) {
                    header.classList.add('collapsible-initialized', 'collapsible');
                    
                    // Add expand/collapse icon
                    const firstCell = header.querySelector('td');
                    if (firstCell) {
                        const headerText = firstCell.innerHTML;
                        firstCell.innerHTML = `<div class="phase-header-content">
                            <span class="collapse-icon">&#9660;</span>
                            <span class="expand-icon" style="display:none;">&#9654;</span>
                            ${headerText}
                        </div>`;
                    }
                    
                    // Add click event
                    header.addEventListener('click', function() {
                        this.classList.toggle('collapsed');
                        
                        // Toggle icons
                        const collapseIcon = this.querySelector('.collapse-icon');
                        const expandIcon = this.querySelector('.expand-icon');
                        if (collapseIcon && expandIcon) {
                            collapseIcon.style.display = this.classList.contains('collapsed') ? 'none' : 'inline';
                            expandIcon.style.display = this.classList.contains('collapsed') ? 'inline' : 'none';
                        }
                        
                        // Toggle visibility of rows until next phase header
                        let currentRow = this.nextElementSibling;
                        while (currentRow && !currentRow.classList.contains('phase-header')) {
                            currentRow.style.display = this.classList.contains('collapsed') ? 'none' : '';
                            currentRow = currentRow.nextElementSibling;
                        }
                    });
                }
            });
        });
        
        // Make weekly rows collapsible
        const weekRows = document.querySelectorAll('.timeline-table tbody tr:not(.phase-header)');
        let currentWeek = '';
        let weekGroup = [];
        
        // Process all rows to find and group identical weeks
        weekRows.forEach((row, index) => {
            const weekCell = row.querySelector('td:first-child');
            if (weekCell) {
                const weekText = weekCell.textContent.trim().split('\n')[0]; // Get just the "Week X" part
                
                if (weekText === currentWeek) {
                    // Add to current group
                    weekGroup.push(row);
                    row.classList.add('week-detail');
                    
                    // If it's the first detail row, add a special class
                    if (weekGroup.length === 2) {
                        weekGroup[0].classList.add('week-parent');
                        
                        // Add collapsible functionality to the first row
                        if (!weekGroup[0].classList.contains('collapsible-initialized')) {
                            weekGroup[0].classList.add('collapsible-initialized');
                            
                            // Add expand/collapse icon
                            const firstCell = weekGroup[0].querySelector('td:first-child');
                            if (firstCell) {
                                const cellContent = firstCell.innerHTML;
                                firstCell.innerHTML = `<div class="week-header-content">
                                    <span class="week-collapse-icon">&#9660;</span>
                                    <span class="week-expand-icon" style="display:none;">&#9654;</span>
                                    ${cellContent}
                                </div>`;
                            }
                            
                            // Add click event
                            weekGroup[0].addEventListener('click', function(e) {
                                // Only trigger if clicking on the week cell or icons
                                if (e.target.closest('td:first-child') || 
                                    e.target.classList.contains('week-collapse-icon') || 
                                    e.target.classList.contains('week-expand-icon')) {
                                    
                                    this.classList.toggle('collapsed');
                                    
                                    // Toggle icons
                                    const collapseIcon = this.querySelector('.week-collapse-icon');
                                    const expandIcon = this.querySelector('.week-expand-icon');
                                    if (collapseIcon && expandIcon) {
                                        collapseIcon.style.display = this.classList.contains('collapsed') ? 'none' : 'inline';
                                        expandIcon.style.display = this.classList.contains('collapsed') ? 'inline' : 'none';
                                    }
                                    
                                    // Toggle visibility of related week detail rows
                                    weekGroup.forEach((detailRow, i) => {
                                        if (i > 0) { // Skip the parent row
                                            detailRow.style.display = this.classList.contains('collapsed') ? 'none' : '';
                                        }
                                    });
                                    
                                    e.stopPropagation(); // Prevent triggering phase header collapse
                                }
                            });
                        }
                    }
                } else {
                    // Start a new group
                    currentWeek = weekText;
                    weekGroup = [row];
                }
            }
        });
    }
    
    // Initialize collapsible sections on page load
    initCollapsibleSections();
    
    // Days since formation counter
    const gnuFormationDate = new Date('June 14, 2024');
    const today = new Date();
    const diffTime = Math.abs(today - gnuFormationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const daysElement = document.getElementById('days-counter');
    if (daysElement) {
        daysElement.textContent = diffDays;
    }
    
    // Mobile menu functionality
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Add badge styling to table badges
    document.querySelectorAll('.table-badge').forEach(badge => {
        if (badge.classList.contains('badge-milestone')) {
            badge.style.backgroundColor = '#f1c40f';
        } else if (badge.classList.contains('badge-policy')) {
            badge.style.backgroundColor = '#3498db';
        } else if (badge.classList.contains('badge-appointment')) {
            badge.style.backgroundColor = '#9b59b6';
        } else if (badge.classList.contains('badge-restructure')) {
            badge.style.backgroundColor = '#e74c3c';
        }
    });

    // Timeline animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        const delay = 300 + (index * 200);
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, delay);
    });
    
    // Department cards hover effect
    const departmentCards = document.querySelectorAll('.department-card-large');
    departmentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.dept-icon i');
            icon.style.transform = 'scale(1.2)';
            icon.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.dept-icon i');
            icon.style.transform = 'scale(1)';
        });
    });
    
    // Add expand/collapse all buttons
    const addControlButtons = () => {
        const timelineContainers = document.querySelectorAll('.table-container');
        
        timelineContainers.forEach(container => {
            // Check if controls already exist
            if (!container.querySelector('.timeline-controls')) {
                const controlsDiv = document.createElement('div');
                controlsDiv.className = 'timeline-controls';
                controlsDiv.innerHTML = `
                    <button class="btn-expand-all"><i class="fas fa-expand-arrows-alt"></i> Expand All</button>
                    <button class="btn-collapse-all"><i class="fas fa-compress-arrows-alt"></i> Collapse All</button>
                `;
                
                // Insert controls before the first timeline table
                container.insertBefore(controlsDiv, container.firstChild);
            }

            // Attach event listeners (or re-attach if already exists to ensure correct scope)
            const expandAllBtn = container.querySelector('.btn-expand-all');
            const collapseAllBtn = container.querySelector('.btn-collapse-all');

            // Remove existing listeners to prevent duplicates if function is called multiple times
            const newExpandBtn = expandAllBtn.cloneNode(true);
            expandAllBtn.parentNode.replaceChild(newExpandBtn, expandAllBtn);
            const newCollapseBtn = collapseAllBtn.cloneNode(true);
            collapseAllBtn.parentNode.replaceChild(newCollapseBtn, collapseAllBtn);

            newExpandBtn.addEventListener('click', function() {
                const visibleTable = container.querySelector('.table-timeline:not([style*="display: none"]) .timeline-table');
                if (visibleTable) {
                    const collapsedPhaseHeaders = visibleTable.querySelectorAll('.phase-header.collapsed');
                    collapsedPhaseHeaders.forEach(header => header.click());
                    
                    const collapsedWeekParents = visibleTable.querySelectorAll('.week-parent.collapsed');
                    collapsedWeekParents.forEach(weekParent => weekParent.click());
                }
            });
            
            newCollapseBtn.addEventListener('click', function() {
                const visibleTable = container.querySelector('.table-timeline:not([style*="display: none"]) .timeline-table');
                if (visibleTable) {
                    const expandedPhaseHeaders = visibleTable.querySelectorAll('.phase-header:not(.collapsed)');
                    expandedPhaseHeaders.forEach(header => header.click());
                    
                    const expandedWeekParents = visibleTable.querySelectorAll('.week-parent:not(.collapsed)');
                    expandedWeekParents.forEach(weekParent => weekParent.click());
                }
            });
        });
    };
    
    // Call the function to add control buttons initially
    addControlButtons();
    
    // Cabinet composition chart with realistic data
    const chartCanvas = document.getElementById('cabinetCompositionChart');
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['ANC', 'DA', 'IFP', 'FF+', 'GOOD', 'PAC', 'UDM', 'ACDP'],
                datasets: [{
                    data: [15, 8, 2, 1, 1, 1, 1, 1],
                    backgroundColor: [
                        '#007A4D', // ANC - Green
                        '#0070C0', // DA - Blue
                        '#ED7D31', // IFP - Orange
                        '#FF0000', // FF+ - Red
                        '#4CAF50', // GOOD - Light Green
                        '#6A0DAD', // PAC - Purple
                        '#795548', // UDM - Brown
                        '#FFEB3B'  // ACDP - Yellow
                    ],
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: 'Cabinet Composition by Party',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#007A4D',
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} ministers (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });
    }
    
    // Optional: Add survey submission handler
    const surveyBtn = document.querySelector('.analysis-cta-btn');
    if (surveyBtn) {
        surveyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Survey system coming soon. Thank you for your interest in providing feedback on the GNU performance.');
        });
    }
}); 