// Budget Expenditure Charts
document.addEventListener('DOMContentLoaded', function() {
    console.log("Budget charts script loaded");
    
    // Charts have been disabled as requested
    // The page now starts directly with the container cards
    console.log("Charts have been disabled - showing only data cards");
    
    /* Original chart initialization code commented out
    // Initialize charts
    function initCharts() {
        console.log("Initializing budget expenditure charts");

        try {
            // Functional chart
            const functionalChartElement = document.getElementById('functional-chart');
            if (functionalChartElement) {
                console.log("Rendering functional chart");
                const functionalChart = new ApexCharts(functionalChartElement, functionalChartOptions);
                functionalChart.render();
            } else {
                console.log("Functional chart element not found");
            }
            
            // Economic chart
            const economicChartElement = document.getElementById('economic-chart');
            if (economicChartElement) {
                console.log("Rendering economic chart");
                const economicChart = new ApexCharts(economicChartElement, economicChartOptions);
                economicChart.render();
            } else {
                console.log("Economic chart element not found");
            }
            
            // Division chart
            const divisionChartElement = document.getElementById('division-chart');
            if (divisionChartElement) {
                console.log("Rendering division chart");
                const divisionChart = new ApexCharts(divisionChartElement, divisionChartOptions);
                divisionChart.render();
            } else {
                console.log("Division chart element not found");
            }
        } catch (error) {
            console.error("Error initializing charts:", error);
        }
    }

    // Execute with a slight delay to ensure DOM is fully loaded
    setTimeout(initCharts, 500);
    */
}); 