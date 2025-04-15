// Homepage Animations and Interactivity

document.addEventListener('DOMContentLoaded', function() {
    
    // Animate elements when they come into view
    const animateOnScroll = function() {
        const animatedElements = document.querySelectorAll('.mission-card, .metric-card-modern, .feature-item, .news-featured, .news-card-modern');
        
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };
    
    // Run on load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Metrics Counter Animation
    const animateCounters = function() {
        const counters = document.querySelectorAll('.metric-number-modern, .hero-stat-number');
        
        counters.forEach(counter => {
            // Skip elements that contain anything other than numbers
            const textContent = counter.textContent;
            if (!/^\d+$/.test(textContent.replace(/[^\d]/g, ''))) return;
            
            const target = parseInt(textContent.replace(/[^\d]/g, ''), 10);
            let count = 0;
            const speed = Math.floor(1000 / target);
            
            const updateCount = () => {
                const increment = target / 100;
                
                if (count < target) {
                    count += increment;
                    counter.innerText = Math.ceil(count).toLocaleString();
                    setTimeout(updateCount, speed);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            
            updateCount();
        });
    };
    
    // Run counter animation when elements are in view
    const observeCounters = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observeCounters.disconnect();
            }
        });
    }, { threshold: 0.5 });
    
    const metricsSection = document.querySelector('.key-metrics-modern');
    if (metricsSection) {
        observeCounters.observe(metricsSection);
    }
    
    // Add hover effects to department cards
    const departmentCards = document.querySelectorAll('.department-card');
    
    departmentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const indicator = this.querySelector('.performance-indicator');
            indicator.style.width = '90%';
            indicator.style.transition = 'width 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            const indicator = this.querySelector('.performance-indicator');
            indicator.style.width = '80%';
        });
    });
    
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-icon');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Hero parallax effect
    const heroSection = document.querySelector('.hero-modern');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            heroSection.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // This would normally send the data to a server
                console.log('Subscribing email:', email);
                
                // Show success message
                emailInput.value = '';
                
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Thank you for subscribing!';
                
                // Remove any existing success messages
                const existingMessage = this.querySelector('.success-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                this.appendChild(successMessage);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            }
        });
    }
    
    // Add CSS for the animations
    const style = document.createElement('style');
    style.textContent = `
        .mission-card, .metric-card-modern, .feature-item, .news-featured, .news-card-modern {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .mission-card.animate, .metric-card-modern.animate, .feature-item.animate, .news-featured.animate, .news-card-modern.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .main-nav.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 80px;
            left: 0;
            width: 100%;
            background-color: white;
            box-shadow: 0 5px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            padding: 1rem;
        }
        
        .main-nav.active li {
            margin: 1rem 0;
            width: 100%;
            text-align: center;
        }
        
        .mobile-menu-icon.active i:before {
            content: "\\f00d";
        }
        
        .success-message {
            color: var(--primary-color);
            background-color: rgba(0, 122, 77, 0.1);
            padding: 0.8rem;
            border-radius: var(--border-radius);
            margin-top: 1rem;
            text-align: center;
        }
        
        @media (max-width: 992px) {
            .main-nav {
                display: none;
            }
            
            .mobile-menu-icon {
                display: block;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add donation form functionality
    function initDonationForm() {
        // Donation amount selection
        const donationOptions = document.querySelectorAll('.donation-option');
        const customAmountInput = document.querySelector('.custom-amount input');
        
        donationOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                donationOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
                // Clear custom amount input
                customAmountInput.value = '';
            });
        });
        
        // When custom amount is entered, deselect preset options
        customAmountInput.addEventListener('focus', function() {
            donationOptions.forEach(opt => opt.classList.remove('active'));
        });
        
        // Donation frequency selection
        const frequencyOptions = document.querySelectorAll('.frequency-option');
        
        frequencyOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                frequencyOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
            });
        });
        
        // Payment method selection
        const paymentOptions = document.querySelectorAll('.payment-icon');
        
        paymentOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                this.classList.add('active');
            });
        });
        
        // Donation button click
        const donateButton = document.querySelector('.donate-button');
        if (donateButton) {
            donateButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get selected amount
                let amount;
                const activeOption = document.querySelector('.donation-option.active');
                if (activeOption) {
                    amount = activeOption.textContent;
                } else if (customAmountInput.value) {
                    amount = 'R' + customAmountInput.value;
                } else {
                    amount = 'R250'; // Default amount
                }
                
                // Get selected frequency
                const frequency = document.querySelector('.frequency-option.active').textContent;
                
                // Get selected payment method
                const paymentMethod = document.querySelector('.payment-icon.active i').className;
                let paymentName = 'Credit Card';
                if (paymentMethod.includes('paypal')) {
                    paymentName = 'PayPal';
                } else if (paymentMethod.includes('university')) {
                    paymentName = 'Bank Transfer';
                }
                
                // This would normally redirect to a payment processor
                console.log(`Processing ${frequency} donation of ${amount} via ${paymentName}`);
                
                // Show success message
                const donationForm = document.querySelector('.donation-form');
                const originalContent = donationForm.innerHTML;
                
                donationForm.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1.5rem;"></i>
                        <h3 style="margin-bottom: 1rem;">Thank You for Your Support!</h3>
                        <p style="margin-bottom: 2rem;">We're processing your ${frequency.toLowerCase()} donation of ${amount}.</p>
                        <p>You'll receive a confirmation email shortly with details of your contribution.</p>
                    </div>
                `;
                
                // Reset form after 5 seconds (for demo purposes only)
                setTimeout(() => {
                    donationForm.innerHTML = originalContent;
                    initDonationForm(); // Re-initialize form handlers
                }, 5000);
            });
        }
    }
    
    // Initialize donation form if it exists on the page
    if (document.querySelector('.donation-form')) {
        initDonationForm();
    }
}); 