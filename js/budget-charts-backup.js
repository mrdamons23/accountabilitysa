// Budget Expenditure Charts
document.addEventListener('DOMContentLoaded', function() {
    // Functional Classification Chart
    const functionalChartOptions = {
        series: [
            {
                name: 'Expenditure',
                data: [508.7, 298.9, 422.3, 286.6, 289.8, 266.1, 78.7, 424.9, 5.0]
            }
        ],
        chart: {
            type: 'pie',
            height: 350,
            fontFamily: 'Segoe UI, sans-serif'
        },
        labels: [
            'Learning & Culture', 
            'Health', 
            'Social Development', 
            'Community Development', 
            'Economic Development',
            'Peace & Security',
            'General Public Services',
            'Debt-Service Costs',
            'Contingency Reserve'
        ],
        colors: ['#007A4D', '#0045A2', '#DE3831', '#FDC100', '#3498DB', '#8E44AD', '#D35400', '#7F8C8D', '#95A5A6'],
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + '%';
            },
            style: {
                fontFamily: 'Segoe UI, sans-serif',
            }
        },
        legend: {
            position: 'bottom',
            fontFamily: 'Segoe UI, sans-serif'
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return 'R' + value + ' billion';
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    // Economic Classification Chart
    const economicChartOptions = {
        series: [{
            name: 'Amount (R billions)',
            data: [822.8, 750.5, 352.1, 424.9, 217.1, 5.0]
        }],
        chart: {
            type: 'bar',
            height: 350,
            fontFamily: 'Segoe UI, sans-serif',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '55%',
                distributed: true,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#007A4D', '#0045A2', '#DE3831', '#FDC100', '#8E44AD', '#95A5A6'],
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return 'R' + val + 'bn';
            },
            offsetY: -20,
            style: {
                fontFamily: 'Segoe UI, sans-serif',
                colors: ['#333']
            }
        },
        xaxis: {
            categories: [
                'Compensation of Employees', 
                'Current Transfers & Subsidies', 
                'Goods & Services', 
                'Debt-Service Costs', 
                'Capital Spending & Transfers',
                'Contingency Reserve'
            ],
            labels: {
                style: {
                    fontFamily: 'Segoe UI, sans-serif',
                    colors: '#666666'
                },
                rotate: -45,
                trim: false
            }
        },
        yaxis: {
            labels: {
                formatter: function(value) {
                    return 'R' + value + 'bn';
                },
                style: {
                    fontFamily: 'Segoe UI, sans-serif',
                    colors: '#666666'
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return 'R' + value + ' billion';
                }
            }
        }
    };

    // Division of Revenue Chart
    const divisionChartOptions = {
        series: [{
            name: 'Allocation',
            data: [912.8, 767.8, 176.8, 37.1]
        }],
        chart: {
            type: 'bar',
            height: 300,
            fontFamily: 'Segoe UI, sans-serif',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 6,
                distributed: true,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#007A4D', '#0045A2', '#FDC100', '#8E44AD'],
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return 'R' + val + 'bn';
            },
            offsetX: 30,
            style: {
                fontFamily: 'Segoe UI, sans-serif',
                colors: ['#333']
            }
        },
        xaxis: {
            categories: [
                'National Departments', 
                'Provincial Governments', 
                'Local Governments', 
                'Provisional Allocations'
            ],
            labels: {
                style: {
                    fontFamily: 'Segoe UI, sans-serif',
                    colors: '#666666'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontFamily: 'Segoe UI, sans-serif',
                    colors: '#666666'
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return 'R' + value + ' billion';
                }
            }
        }
    };

    // Render charts if elements exist
    if (document.getElementById('functional-chart')) {
        const functionalChart = new ApexCharts(
            document.getElementById('functional-chart'), 
            functionalChartOptions
        );
        functionalChart.render();
    }
    
    if (document.getElementById('economic-chart')) {
        const economicChart = new ApexCharts(
            document.getElementById('economic-chart'), 
            economicChartOptions
        );
        economicChart.render();
    }
    
    if (document.getElementById('division-chart')) {
        const divisionChart = new ApexCharts(
            document.getElementById('division-chart'), 
            divisionChartOptions
        );
        divisionChart.render();
    }
}); 