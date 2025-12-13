// Main JavaScript for Nash Digitech Solutions Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initThemeToggle();
    initPortfolioCarousel();
    initServiceFilter();
    initTestimonialSlider();
    initContactForm();
    initNewsletterForm();
    initLiveChat();
    initStatsCounter();
    initScrollAnimations();
    initBackToTop();
    initCurrentYear();
    initFormValidation();
    
    // Set current year in footer
    function initCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
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
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
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
    
    // Testimonial slider functionality
    function initTestimonialSlider() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.testimonial-dots .dot');
        const prevBtn = document.querySelector('.testimonial-prev');
        const nextBtn = document.querySelector('.testimonial-next');
        
        let currentSlide = 0;
        
        // Function to show specific slide
        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show selected slide
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        
        // Next slide
        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });
        
        // Previous slide
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });
        
        // Dot click
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
    
    // Contact form functionality
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const formStatus = document.getElementById('formStatus');
        
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const service = document.getElementById('service').value;
                const budget = document.getElementById('budget').value;
                const message = document.getElementById('message').value.trim();
                const newsletterOptIn = document.getElementById('newsletterOptIn').checked;
                
                // Basic validation
                if (!name || !email || !message) {
                    showFormStatus('Please fill in all required fields.', 'error');
                    return;
                }
                
                if (!isValidEmail(email)) {
                    showFormStatus('Please enter a valid email address.', 'error');
                    return;
                }
                
                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                try {
                    // Prepare email data
                    const emailData = {
                        name: name,
                        email: email,
                        phone: phone || 'Not provided',
                        service: service || 'Not specified',
                        budget: budget || 'Not specified',
                        message: message,
                        newsletterOptIn: newsletterOptIn ? 'Yes' : 'No',
                        date: new Date().toLocaleString(),
                        source: 'Nash Digitech Website Contact Form'
                    };
                    
                    // Send email using SMTP.js (configured for Gmail)
                    // Note: In production, you would use a backend service
                    // For demo purposes, we'll simulate email sending
                    
                    // Simulate API call delay
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Save to localStorage for demo purposes
                    saveContactToLocal(emailData);
                    
                    // Show success message
                    showFormStatus(
                        `Thank you ${name}! Your message has been sent successfully. We'll contact you at ${email} within 24 hours to discuss your project.`,
                        'success'
                    );
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Update live chat with new inquiry notification
                    addChatMessage(
                        'bot',
                        `I see you just submitted a contact form about ${service || 'our services'}. How can I assist you further with your inquiry?`
                    );
                    
                } catch (error) {
                    console.error('Form submission error:', error);
                    showFormStatus(
                        `Sorry ${name}, there was an error sending your message. Please try again or contact us directly at nashdigitechsolutions@gmail.com`,
                        'error'
                    );
                } finally {
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
        
        // Helper function to show form status
        function showFormStatus(message, type) {
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
        
        // Save contact to localStorage for demo purposes
        function saveContactToLocal(data) {
            let contacts = JSON.parse(localStorage.getItem('nashContacts') || '[]');
            contacts.push({
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('nashContacts', JSON.stringify(contacts));
        }
    }
    
    // Newsletter form functionality
    function initNewsletterForm() {
        const newsletterForm = document.getElementById('newsletterForm');
        const newsletterMessage = document.getElementById('newsletterMessage');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('newsletterEmail').value.trim();
                
                if (!email || !isValidEmail(email)) {
                    showNewsletterMessage('Please enter a valid email address.', 'error');
                    return;
                }
                
                // Save to localStorage
                let subscribers = JSON.parse(localStorage.getItem('nashNewsletterSubscribers') || '[]');
                
                // Check if already subscribed
                if (subscribers.includes(email)) {
                    showNewsletterMessage('You are already subscribed to our newsletter!', 'success');
                } else {
                    subscribers.push(email);
                    localStorage.setItem('nashNewsletterSubscribers', JSON.stringify(subscribers));
                    showNewsletterMessage('Thank you for subscribing to our newsletter!', 'success');
                    
                    // Clear input
                    document.getElementById('newsletterEmail').value = '';
                }
            });
        }
        
        // Helper function for newsletter messages
        function showNewsletterMessage(message, type) {
            newsletterMessage.textContent = message;
            newsletterMessage.className = `form-message ${type}`;
            
            // Hide message after 5 seconds
            setTimeout(() => {
                newsletterMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    // Live chat functionality
    function initLiveChat() {
        const chatToggle = document.getElementById('chatToggle');
        const chatClose = document.getElementById('chatClose');
        const liveChat = document.getElementById('liveChat');
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        const chatNotification = document.querySelector('.chat-notification');
        
        // Toggle chat window
        chatToggle.addEventListener('click', () => {
            liveChat.classList.toggle('active');
            chatToggle.style.display = 'none';
            
            // Remove notification
            chatNotification.style.display = 'none';
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
            
            if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
                return "Hello! 👋 I'm Nash, your virtual assistant. How can I help you today?";
            } else if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
                return "Our pricing depends on the specific requirements of your project. Basic websites start at $1,200, while custom web applications can range from $2,500 to $10,000+. Would you like me to connect you with our sales team for a detailed quote?";
            } else if (message.includes('website') || message.includes('web design')) {
                return "We offer complete website design and development services, including responsive design, CMS integration, SEO optimization, and ongoing support. Our typical timeline for a standard website is 2-4 weeks. Would you like to discuss your specific requirements?";
            } else if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
                return "You can reach us at:<br><strong>Phone:</strong> +263 78 718 2780<br><strong>Email:</strong> nashdigitechsolutions@gmail.com<br><strong>Address:</strong> Victoria Falls, Zimbabwe<br>We're available 24/7 for urgent inquiries!";
            } else if (message.includes('portfolio') || message.includes('work') || message.includes('project')) {
                return "You can view our portfolio above in the 'Our Portfolio Gallery' section. We've worked with clients across various industries including tourism, healthcare, e-commerce, and finance. Is there a specific type of project you'd like to see examples of?";
            } else if (message.includes('ai') || message.includes('machine learning') || message.includes('artificial intelligence')) {
                return "Yes! We specialize in AI and machine learning solutions including predictive analytics, natural language processing, computer vision, and automation systems. We can help you leverage AI to improve efficiency and gain insights from your data.";
            } else if (message.includes('time') || message.includes('hours') || message.includes('open')) {
                return "Our business hours are:<br><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM<br><strong>Saturday:</strong> 9:00 AM - 1:00 PM<br><strong>Emergency Support:</strong> Available 24/7<br>We're based in Victoria Falls, Zimbabwe (GMT+2).";
            } else if (message.includes('thank') || message.includes('thanks')) {
                return "You're welcome! 😊 Is there anything else I can help you with today?";
            } else if (message.includes('bye') || message.includes('goodbye')) {
                return "Goodbye! Feel free to reach out anytime if you have more questions. Have a great day!";
            } else {
                return "Thank you for your message! I'm still learning, but I can connect you with a human expert who can better assist you with that. Would you like me to do that, or is there something specific about our services I can help you with?";
            }
        }
        
        // Show notification after 10 seconds
        setTimeout(() => {
            chatNotification.style.display = 'flex';
        }, 10000);
    }
    
    // Stats counter animation
    function initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target;
                    const target = parseInt(statNumber.getAttribute('data-count'));
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