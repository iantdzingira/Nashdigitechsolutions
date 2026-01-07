// Main JavaScript for Nash Digitech Solutions Website
const API_BASE_URL = 'http://localhost:3000/api'; // Backend URL

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initThemeToggle();
    initPortfolioCarousel();
    initServiceFilter();
    initLiveChat();
    initStatsCounter();
    initScrollAnimations();
    initBackToTop();
    initCurrentYear();
    initFormValidation();
    
    // Load testimonials from backend
    loadTestimonials();
    
    // Initialize testimonial system
    initTestimonialSystem();
    
    // Initialize contact form with social media selection
    initContactFormWithSocialMedia();
    
    // Initialize newsletter form
    initNewsletterForm();
    
    // Set current year in footer and calculate years experience
    function initCurrentYear() {
        const currentYear = new Date().getFullYear();
        document.getElementById('currentYear').textContent = currentYear;
        
        // Calculate years experience (starting from 2023)
        const startYear = 2023;
        const yearsExperience = currentYear - startYear;
        document.getElementById('yearsExperience').textContent = yearsExperience;
    }
    
    // Navigation functionality
    function initNavigation() {
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const closeSidebar = document.getElementById('closeSidebar');
        const navLinks = document.querySelectorAll('.nav-menu a, .sidebar-nav a');
        
        // Toggle sidebar
        hamburger.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
        
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) && !hamburger.contains(event.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
        
        // Smooth scrolling for anchor links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        // Close sidebar if open
                        sidebar.classList.remove('active');
                        
                        // Scroll to target
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                        
                        // Update active nav link
                        navLinks.forEach(l => l.classList.remove('active'));
                        this.classList.add('active');
                    }
                }
            });
        });
        
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Update active nav link based on scroll position
            updateActiveNavLink();
        });
        
        // Function to update active nav link based on scroll position
        function updateActiveNavLink() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-menu a, .sidebar-nav a');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Theme toggle functionality
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        
        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
        
        // Update theme icon based on current theme
        function updateThemeIcon(theme) {
            if (theme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }
    
    // Portfolio carousel initialization
    function initPortfolioCarousel() {
        if ($('#portfolioCarousel').length) {
            $('#portfolioCarousel').owlCarousel({
                items: 1,
                loop: true,
                margin: 20,
                autoplay: true,
                autoplayTimeout: 3000,
                autoplayHoverPause: true,
                nav: true,
                dots: true,
                responsive:{
                    0:{
                        items:1
                    },
                    768:{
                        items:2
                    },
                    992:{
                        items:3
                    }
                }
            });
        }
    }
    
    // Service filter functionality
    function initServiceFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const serviceCards = document.querySelectorAll('.service-card');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const filterValue = button.getAttribute('data-filter');
                
                // Show/hide service cards based on filter
                serviceCards.forEach(card => {
                    const categories = card.getAttribute('data-category').split(' ');
                    
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Enhanced Live Chat functionality
    function initLiveChat() {
        const chatToggle = document.getElementById('chatToggle');
        const chatClose = document.getElementById('chatClose');
        const liveChat = document.getElementById('liveChat');
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        const chatNotification = document.querySelector('.chat-notification');
        
        // Chat responses database
        const chatResponses = {
            greeting: [
                "Hello! 👋 I'm Nash, your virtual assistant. How can I help you today?",
                "Hi there! Welcome to Nash Digitech Solutions. How may I assist you?"
            ],
            pricing: [
                "Our website design starts at $500+, mobile apps at $250+, and system development from $700+. What specific service are you interested in?",
                "We offer competitive pricing based on your project requirements. Could you share more details about your project for an accurate quote?"
            ],
            services: [
                "We offer: 1) Professional Website Design ($500+), 2) Mobile Apps ($250+), 3) System Development ($700+), 4) Digital Marketing ($100/mo), 5) Creative Design ($75+). Which service interests you?",
                "Our services include web development, mobile apps, AI solutions, system development, and digital marketing. What do you need help with?"
            ],
            portfolio: [
                "Check out our portfolio section above to see our latest projects. Would you like to see specific types of projects?",
                "You can view our work in the portfolio gallery. We have projects across various industries including e-commerce, healthcare, and tourism."
            ],
            contact: [
                "You can reach us at +263 78 718 2780 or email nashdigitechsolutions@gmail.com. We're also on WhatsApp for quick responses!",
                "Contact us via phone: +263 78 718 2780, email: nashdigitechsolutions@gmail.com, or through our social media platforms."
            ],
            hours: [
                "We're available Mon-Fri 8AM-6PM and Sat 9AM-1PM. 24/7 emergency support is available for existing clients.",
                "Our business hours: Monday-Friday: 8:00 AM - 6:00 PM, Saturday: 9:00 AM - 1:00 PM. 24/7 support for urgent matters."
            ],
            website: [
                "Our website design services include responsive design, CMS integration, SEO optimization, and ongoing support. Starting at $500+.",
                "We create custom websites that are mobile-friendly, fast, and optimized for conversions. Timeline: 2-4 weeks."
            ],
            mobile: [
                "We develop native iOS (Swift) and Android (Kotlin/Java) apps, as well as cross-platform solutions. Starting at $250+.",
                "Our mobile app development includes full lifecycle services from design to deployment on app stores."
            ],
            system: [
                "We build custom systems including ERPs, CRMs, and automation solutions. Web-based from $700+, non-web from $1000+.",
                "Our system development services can streamline your business operations with custom software solutions."
            ],
            default: [
                "I'm here to help! Could you rephrase that or ask about our services, pricing, or portfolio?",
                "I'm still learning. Could you ask about our services, pricing, or how we can help your business?"
            ]
        };
        
        // Toggle chat window
        chatToggle.addEventListener('click', () => {
            liveChat.classList.toggle('active');
            chatToggle.style.display = 'none';
            
            // Remove notification
            if (chatNotification) chatNotification.style.display = 'none';
        });
        
        // Close chat
        chatClose.addEventListener('click', () => {
            liveChat.classList.remove('active');
            chatToggle.style.display = 'flex';
        });
        
        // Send message
        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Send message function
        function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Add user message
            addChatMessage('user', message);
            
            // Clear input
            chatInput.value = '';
            
            // Simulate bot response after delay
            setTimeout(() => {
                const botResponse = getBotResponse(message);
                addChatMessage('bot', botResponse);
            }, 1000);
        }
        
        // Add message to chat
        function addChatMessage(sender, text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${sender}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = `<p>${text}</p>`;
            
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Get bot response based on user message
        function getBotResponse(userMessage) {
            const message = userMessage.toLowerCase();
            
            // Check for keywords and return appropriate response
            if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
                return chatResponses.greeting[Math.floor(Math.random() * chatResponses.greeting.length)];
            } else if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
                return chatResponses.pricing[Math.floor(Math.random() * chatResponses.pricing.length)];
            } else if (message.includes('service') || message.includes('what do you do') || message.includes('offer')) {
                return chatResponses.services[Math.floor(Math.random() * chatResponses.services.length)];
            } else if (message.includes('website') || message.includes('web design')) {
                return chatResponses.website[Math.floor(Math.random() * chatResponses.website.length)];
            } else if (message.includes('mobile') || message.includes('app')) {
                return chatResponses.mobile[Math.floor(Math.random() * chatResponses.mobile.length)];
            } else if (message.includes('system') || message.includes('software') || message.includes('erp') || message.includes('crm')) {
                return chatResponses.system[Math.floor(Math.random() * chatResponses.system.length)];
            } else if (message.includes('portfolio') || message.includes('work') || message.includes('project')) {
                return chatResponses.portfolio[Math.floor(Math.random() * chatResponses.portfolio.length)];
            } else if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
                return chatResponses.contact[Math.floor(Math.random() * chatResponses.contact.length)];
            } else if (message.includes('time') || message.includes('hours') || message.includes('open')) {
                return chatResponses.hours[Math.floor(Math.random() * chatResponses.hours.length)];
            } else if (message.includes('thank') || message.includes('thanks')) {
                return "You're welcome! 😊 Is there anything else I can help you with today?";
            } else if (message.includes('bye') || message.includes('goodbye')) {
                return "Goodbye! Feel free to reach out anytime if you have more questions. Have a great day!";
            } else {
                return chatResponses.default[Math.floor(Math.random() * chatResponses.default.length)];
            }
        }
        
        // Show notification after 10 seconds
        setTimeout(() => {
            if (chatNotification) chatNotification.style.display = 'flex';
        }, 10000);
    }
    
    // Stats counter animation
    function initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target;
                    const target = parseInt(statNumber.textContent);
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        statNumber.textContent = Math.floor(current);
                    }, 16);
                    
                    // Stop observing once animated
                    observer.unobserve(statNumber);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    // Scroll animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.animate-fade-up, .animate-fade-in, .animate-slide-in').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Back to top button
    function initBackToTop() {
        const backToTop = document.getElementById('backToTop');
        
        if (!backToTop) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });
        
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Form validation helpers
    function initFormValidation() {
        // Email validation helper
        window.isValidEmail = function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        
        // Phone validation helper
        window.isValidPhone = function(phone) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            return phoneRegex.test(phone);
        };
    }
    
    // Initialize animations on load
    setTimeout(() => {
        document.querySelectorAll('.animate-fade-up, .animate-fade-in').forEach(el => {
            el.style.opacity = '1';
        });
    }, 100);
});

// Service worker for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// ============================================
// TESTIMONIALS SYSTEM
// ============================================

// Load testimonials from backend
async function loadTestimonials() {
    try {
        console.log('📡 Fetching live data from Nash Digitech API...');
        const response = await fetch(`${API_BASE_URL}/testimonials`);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            // 1. Display the actual testimonial cards
            // If the array is empty, displayTestimonials handles the "Be the first" message
            displayTestimonials(data.testimonials);
            
            // 2. Update the Testimonials Section Stats (Total, Avg Rating, Countries)
            if (data.stats) {
                updateTestimonialStats(data.stats);
                
                // 3. Update the Global "Happy Clients" counter in the Hero/Stats section
                // We use the 'total' from approved testimonials in the DB
                updateHappyClientsCount(data.stats.total);
            }

            console.log(`✅ Sync Complete: ${data.testimonials.length} testimonials live.`);
        } else {
            throw new Error(data.message || 'Backend returned success: false');
        }
    } catch (error) {
        console.error('❌ Backend Sync Failed:', error.message);
        
        // Fallback to local data so the site doesn't look broken
        console.log('⚠️ Reverting to local browser storage...');
        loadTestimonialsFromLocalStorage();
    }
}

function loadTestimonialsFromLocalStorage() {
    const testimonials = JSON.parse(localStorage.getItem('nashTestimonials') || '[]');
    const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
    
    if (approvedTestimonials.length > 0) {
        displayTestimonials(approvedTestimonials);
        updateHappyClientsCount(approvedTestimonials.length);
    } else {
        // Show default message
        const slider = document.getElementById('testimonialSlider');
        if (slider) {
            slider.innerHTML = `
                <div class="testimonial-slide active">
                    <div class="testimonial-content">
                        <div class="testimonial-text">
                            <p>Be the first to share your experience with Nash Digitech!</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

function displayTestimonials(testimonials) {
    const slider = document.getElementById('testimonialSlider');
    const dotsContainer = document.getElementById('testimonialDots');
    
    if (!slider) return;
    
    slider.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    
    if (testimonials.length === 0) {
        slider.innerHTML = `
            <div class="testimonial-slide active">
                <div class="testimonial-content">
                    <div class="testimonial-text">
                        <p>Be the first to share your experience with Nash Digitech!</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    testimonials.forEach((testimonial, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <div class="testimonial-content">
                <div class="testimonial-text">
                    <p>"${testimonial.testimonial}"</p>
                    <div class="testimonial-rating">
                        ${generateStars(testimonial.rating)}
                    </div>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">${testimonial.name.charAt(0)}</div>
                    <div class="author-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.position}</p>
                        <p class="testimonial-country"><i class="fas fa-globe-africa"></i> ${testimonial.country}</p>
                    </div>
                </div>
            </div>
        `;
        slider.appendChild(slide);
        
        // Create dot if container exists
        if (dotsContainer) {
            const dot = document.createElement('span');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        }
    });
    
    // Initialize slider controls
    initTestimonialControls();
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function initTestimonialControls() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }
    
    prevBtn?.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });
    
    nextBtn?.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Auto-advance slides every 5 seconds
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
}

function updateTestimonialStats(stats) {
    const totalElement = document.getElementById('totalTestimonials');
    const averageElement = document.getElementById('averageRating');
    const countriesElement = document.getElementById('countriesCount');
    
    if (totalElement) totalElement.textContent = stats.total || 0;
    if (averageElement) averageElement.textContent = stats.averageRating || '0.0';
    if (countriesElement) countriesElement.textContent = stats.countriesCount || 0;
}

function updateHappyClientsCount(count) {
    const happyClientsElement = document.getElementById('happyClients');
    if (happyClientsElement) happyClientsElement.textContent = count;
}

// Testimonial Modal System
function initTestimonialSystem() {
    const modal = document.getElementById('testimonialModal');
    const openBtn = document.getElementById('addTestimonialBtn');
    const closeBtn = document.getElementById('closeTestimonialModal');
    const form = document.getElementById('testimonialForm');
    const stars = document.querySelectorAll('.rating-stars i');
    
    if (!modal || !openBtn) return;
    
    // Star rating functionality
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            document.getElementById('clientRating').value = rating;
            
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'selected');
                } else {
                    s.classList.remove('fas', 'selected');
                    s.classList.add('far');
                }
            });
        });
    });
    
    // Open modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (form) form.reset();
            stars.forEach(s => {
                s.classList.remove('fas', 'selected');
                s.classList.add('far');
            });
        });
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (form) form.reset();
            stars.forEach(s => {
                s.classList.remove('fas', 'selected');
                s.classList.add('far');
            });
        }
    });
    
    // Submit testimonial
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const testimonialData = {
                name: document.getElementById('clientName').value,
                position: document.getElementById('clientPosition').value || 'Client',
                country: document.getElementById('clientCountry').value,
                rating: parseInt(document.getElementById('clientRating').value),
                testimonial: document.getElementById('clientTestimonial').value,
                status: 'pending'
            };
            
            try {
                const result = await submitTestimonialToBackend(testimonialData);
                alert(result.message);
                
                modal.style.display = 'none';
                form.reset();
                stars.forEach(s => {
                    s.classList.remove('fas', 'selected');
                    s.classList.add('far');
                });
                
                // Reload testimonials
                loadTestimonials();
                
            } catch (error) {
                alert('Error submitting testimonial. Please try again.');
            }
        });
    }
}

async function submitTestimonialToBackend(testimonialData) {
    try {
        const response = await fetch(`${API_BASE_URL}/testimonials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testimonialData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { success: true, message: data.message };
        } else {
            throw new Error(data.message || 'Failed to submit testimonial');
        }
    } catch (error) {
        console.error('Error submitting testimonial to backend:', error);
        
        // Fallback to localStorage
        return submitTestimonialToLocalStorage(testimonialData);
    }
}

function submitTestimonialToLocalStorage(testimonialData) {
    try {
        let testimonials = JSON.parse(localStorage.getItem('nashTestimonials') || '[]');
        testimonialData.id = Date.now();
        testimonialData.createdAt = new Date().toISOString();
        testimonials.push(testimonialData);
        localStorage.setItem('nashTestimonials', JSON.stringify(testimonials));
        
        return { 
            success: true, 
            message: 'Thank you for your testimonial! It will be reviewed and published soon.' 
        };
    } catch (error) {
        console.error('Error saving testimonial to localStorage:', error);
        return { success: false, message: 'Error saving testimonial. Please try again.' };
    }
}

// ============================================
// CONTACT FORM WITH SOCIAL MEDIA SELECTION
// ============================================

function initContactFormWithSocialMedia() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const socialMediaModal = document.getElementById('socialMediaModal');
    const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
    const closeSocialModal = document.getElementById('closeSocialModal');
    const cancelSocial = document.getElementById('cancelSocial');
    const confirmPlatforms = document.getElementById('confirmPlatforms');
    
    if (!contactForm || !sendFeedbackBtn) return;
    
    let formData = null;
    
    // Handle form submission
    sendFeedbackBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const service = document.getElementById('service').value;
        const budget = document.getElementById('budget').value;
        const message = document.getElementById('message').value.trim();
        const newsletterOptIn = document.getElementById('newsletterOptIn')?.checked || false;
        const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
        
        // Basic validation
        if (!name || !email || !message) {
            showFormStatus('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }
        
        if (!agreeTerms) {
            showFormStatus('You must agree to receive communication via selected platforms.', 'error');
            return;
        }
        
        // Get service price
        const serviceSelect = document.getElementById('service');
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        const servicePrice = selectedOption?.dataset.price || '';
        
        // Save form data temporarily
        formData = {
            name,
            email,
            phone: phone || 'Not provided',
            service: service || 'Not specified',
            servicePrice: servicePrice,
            budget: budget || 'Not specified',
            message,
            newsletterOptIn,
            date: new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // Show social media platform selection modal
        if (socialMediaModal) {
            socialMediaModal.style.display = 'flex';
            // Reset checkboxes
            document.querySelectorAll('input[name="contact-platform"]').forEach(cb => {
                cb.checked = false;
            });
        } else {
            // If modal doesn't exist, send directly
            sendContactForm([]);
        }
    });
    
    // Close social media modal
    if (closeSocialModal) {
        closeSocialModal.addEventListener('click', () => {
            if (socialMediaModal) socialMediaModal.style.display = 'none';
        });
    }
    
    if (cancelSocial) {
        cancelSocial.addEventListener('click', () => {
            if (socialMediaModal) socialMediaModal.style.display = 'none';
        });
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (socialMediaModal && e.target === socialMediaModal) {
            socialMediaModal.style.display = 'none';
        }
    });
    
    // Confirm platform selection and send message
    if (confirmPlatforms) {
        confirmPlatforms.addEventListener('click', async function() {
            // Get selected platforms
            const selectedPlatforms = Array.from(document.querySelectorAll('input[name="contact-platform"]:checked'))
                .map(cb => cb.value);
            
            if (selectedPlatforms.length === 0) {
                alert('Please select at least one contact platform.');
                return;
            }
            
            // Send contact form
            await sendContactForm(selectedPlatforms);
        });
    }
    
    async function sendContactForm(selectedPlatforms) {
        if (!formData) return;
        
        // Update button state
        const originalText = confirmPlatforms ? confirmPlatforms.innerHTML : 'Sending...';
        if (confirmPlatforms) {
            confirmPlatforms.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            confirmPlatforms.disabled = true;
        }
        
        try {
            // Add platforms to form data
            formData.platforms = selectedPlatforms;
            
            // Prepare message for different platforms
            const contactMessage = prepareContactMessage(formData, selectedPlatforms);
            
            // Send to backend
            const backendResult = await submitContactFormToBackend(formData);
            
            // Send to selected platforms
            await sendViaPlatforms(selectedPlatforms, contactMessage);
            
            // Show success message
            showFormStatus(
                `Thank you ${formData.name}! ${backendResult.message} We'll contact you via ${selectedPlatforms.join(', ')} within 24 hours.`,
                'success'
            );
            
            // Close modal
            if (socialMediaModal) socialMediaModal.style.display = 'none';
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showFormStatus(
                `Sorry ${formData.name}, there was an error sending your message. Please try again or contact us directly.`,
                'error'
            );
        } finally {
            // Reset button state
            if (confirmPlatforms) {
                confirmPlatforms.innerHTML = originalText;
                confirmPlatforms.disabled = false;
            }
            formData = null;
        }
    }
    
    function prepareContactMessage(data, platforms) {
        return `
🌟 *New Project Inquiry - Nash Digitech Solutions* 🌟

*Name:* ${data.name}
*Email:* ${data.email}
*Phone:* ${data.phone}
*Service Needed:* ${data.service} ${data.servicePrice}
*Budget Range:* ${data.budget}
*Preferred Contact:* ${platforms.join(', ')}

*Project Details:*
${data.message}

*Date Submitted:* ${data.date}
${data.newsletterOptIn ? '\n✅ Subscribed to newsletter' : ''}
        `.trim();
    }
    
    async function sendViaPlatforms(platforms, message) {
        for (const platform of platforms) {
            await sendViaPlatform(platform, message);
        }
    }
    
    function sendViaPlatform(platform, message) {
        return new Promise((resolve) => {
            try {
                switch(platform) {
                    case 'whatsapp':
                        window.open(`https://wa.me/263787182780?text=${encodeURIComponent(message)}`, '_blank');
                        break;
                    case 'telegram':
                        window.open(`https://t.me/nashdigitech?text=${encodeURIComponent(message)}`, '_blank');
                        break;
                    case 'instagram':
                        window.open(`https://www.instagram.com/nashdigitech`, '_blank');
                        break;
                    case 'facebook':
                        window.open(`https://www.facebook.com/nashdigitech`, '_blank');
                        break;
                    case 'twitter':
                        window.open(`https://twitter.com/messages/compose?recipient_id=nashdigitech&text=${encodeURIComponent(message)}`, '_blank');
                        break;
                    case 'linkedin':
                        window.open(`https://www.linkedin.com/company/nash-digitech`, '_blank');
                        break;
                    case 'tiktok':
                        window.open(`https://www.tiktok.com/@nashdigitech`, '_blank');
                        break;
                    case 'signal':
                        window.open(`https://signal.me/#p/nashdigitech`, '_blank');
                        break;
                    case 'skype':
                        window.open(`skype:nashdigitech?chat`, '_blank');
                        break;
                    case 'zoom':
                        window.open(`https://zoom.us/`, '_blank');
                        break;
                    case 'email':
                        window.location.href = `mailto:nashdigitechsolutions@gmail.com?subject=New Project Inquiry from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(message)}`;
                        break;
                    case 'phone':
                        window.open('tel:+263787182780', '_blank');
                        break;
                    default:
                        console.log(`Message for ${platform}: ${message}`);
                }
                resolve();
            } catch (error) {
                console.error(`Error sending via ${platform}:`, error);
                resolve(); // Continue even if one platform fails
            }
        });
    }
    
    async function submitContactFormToBackend(contactData) {
        try {
            const response = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                return { success: true, message: data.message };
            } else {
                throw new Error(data.message || 'Failed to submit contact form');
            }
        } catch (error) {
            console.error('Error submitting contact form to backend:', error);
            
            // Fallback to localStorage
            return saveContactToLocalStorage(contactData);
        }
    }
    
    function saveContactToLocalStorage(data) {
        try {
            let contacts = JSON.parse(localStorage.getItem('nashContacts') || '[]');
            contacts.push({
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('nashContacts', JSON.stringify(contacts));
            
            return { 
                success: true, 
                message: 'Contact form saved locally.' 
            };
        } catch (error) {
            console.error('Error saving contact to localStorage:', error);
            return { success: false, message: 'Error saving contact.' };
        }
    }
    
    // Helper function to show form status
    function showFormStatus(message, type) {
        if (!formStatus) return;
        
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        // Scroll to status message
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide status message after 8 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 8000);
    }
}

// ============================================
// NEWSLETTER FORM
// ============================================

function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMessage = document.getElementById('newsletterMessage');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail').value.trim();
        
        if (!email || !isValidEmail(email)) {
            showNewsletterMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNewsletterMessage(data.message || 'Thank you for subscribing to our newsletter!', 'success');
                document.getElementById('newsletterEmail').value = '';
            } else {
                showNewsletterMessage(data.message || 'Subscription failed.', 'error');
            }
        } catch (error) {
            showNewsletterMessage('Error subscribing. Please try again.', 'error');
        }
    });
    
    function showNewsletterMessage(message, type) {
        if (!newsletterMessage) return;
        
        newsletterMessage.textContent = message;
        newsletterMessage.className = `form-message ${type}`;
        newsletterMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            newsletterMessage.style.display = 'none';
        }, 5000);
    }
}

// ============================================
// INITIALIZE ALL SYSTEMS
// ============================================

// Make sure all systems are initialized when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Functions already initialized in the main DOMContentLoaded event
    // This ensures they're available globally
});

document.addEventListener('DOMContentLoaded', function() {
    // Select elements
    const testimonialModal = document.getElementById('testimonialSubmissionModal');
    const openBtn = document.getElementById('submitTestimonialBtn');
    const closeBtn = document.getElementById('closeTestimonialModal');

    // 1. Open Modal when button is clicked
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            testimonialModal.style.display = 'flex'; // Ensure your CSS handles 'flex' or 'block'
            testimonialModal.classList.add('active'); // Good for animations
        });
    }

    // 2. Close Modal when 'X' is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            testimonialModal.style.display = 'none';
            testimonialModal.classList.remove('active');
        });
    }

    // 3. Close Modal if user clicks outside the content box
    window.addEventListener('click', (e) => {
        if (e.target === testimonialModal) {
            testimonialModal.style.display = 'none';
            testimonialModal.classList.remove('active');
        }
    });
});

// Star Rating Interaction
const stars = document.querySelectorAll('#testimonialRatingStars i');
stars.forEach(star => {
    star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
        document.getElementById('testimonialRating').value = rating;
        
        stars.forEach(s => {
            s.classList.remove('fas', 'active');
            s.classList.add('far');
            if(s.getAttribute('data-rating') <= rating) {
                s.classList.remove('far');
                s.classList.add('fas', 'active');
            }
        });
    });
});

// --- 2. SELECTORS (Matching your HTML exactly) ---
const testimonialForm = document.getElementById('testimonialSubmissionForm');
const testimonialModal = document.getElementById('testimonialSubmissionModal');
const openModalBtn = document.getElementById('submitTestimonialBtn');
const closeModalBtn = document.getElementById('closeTestimonialModal');
const ratingStars = document.querySelectorAll('#testimonialRatingStars i');
const ratingInput = document.getElementById('testimonialRating');

// --- 3. MODAL LOGIC ---
if (openModalBtn && testimonialModal) {
    openModalBtn.onclick = () => {
        testimonialModal.style.display = 'flex';
    };
}

if (closeModalBtn && testimonialModal) {
    closeModalBtn.onclick = () => {
        testimonialModal.style.display = 'none';
    };
}

// Close modal if user clicks outside the content box
window.onclick = (event) => {
    if (event.target == testimonialModal) {
        testimonialModal.style.display = 'none';
    }
};

// --- 4. STAR RATING LOGIC ---
ratingStars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = star.getAttribute('data-rating');
        ratingInput.value = rating;
        
        // Update visual stars (Solid vs Regular)
        ratingStars.forEach(s => {
            const sRating = s.getAttribute('data-rating');
            if (sRating <= rating) {
                s.classList.remove('far');
                s.classList.add('fas');
            } else {
                s.classList.remove('fas');
                s.classList.add('far');
            }
        });
    });
});

// --- 5. SUBMISSION LOGIC ---
if (testimonialForm) {
    testimonialForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = testimonialForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // UI Feedback
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        const testimonialData = {
            name: document.getElementById('testimonialName').value.trim(),
            position: document.getElementById('testimonialPosition').value.trim() || 'Client',
            country: document.getElementById('testimonialCountry').value.trim(),
            rating: parseInt(ratingInput.value) || 5,
            testimonial: document.getElementById('testimonialText').value.trim(),
            email: document.getElementById('testimonialEmail').value.trim(),
            status: 'pending'
        };

        // Validate Rating
        if (!ratingInput.value) {
            alert("Please select a star rating!");
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/testimonials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testimonialData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert('✅ Success: Your testimonial has been submitted for review!');
                testimonialModal.style.display = 'none';
                testimonialForm.reset();
                
                // Reset stars visual
                ratingStars.forEach(s => {
                    s.classList.remove('fas');
                    s.classList.add('far');
                });
                ratingInput.value = '';
            } else {
                alert('❌ Error: ' + (result.message || 'Something went wrong.'));
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert('❌ Connection error: Could not reach the backend server at ' + API_BASE_URL);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}