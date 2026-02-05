/**
 * Gabriele Tupini - Technical Showcase Website
 * Main JavaScript functionality with modern ES6+ features
 * 
 * Features:
 * - Mobile Navigation
 * - Scroll Animations & Effects
 * - Skills Progress Bars
 * - Project Filtering
 * - Contact Form with EmailJS
 * - Interactive Tech Stack
 * - Performance Monitoring
 * - Accessibility Features
 */

'use strict';

// ==========================================================================
// Global Configuration & Constants
// ==========================================================================

const CONFIG = {
    // EmailJS Configuration
    emailjs: {
        serviceId: 'service_zgf03ey',
        templateId: 'template_7r3r8rd',
        publicKey: 'd09HeaQfradvNnLgt'
    },

    // Animation Settings
    animations: {
        observerOptions: {
            threshold: 0.1,
            rootMargin: '-50px'
        },
        skillBarDelay: 200,
        counterSpeed: 2000
    },


    // Performance Monitoring
    performance: {
        enableMetrics: true,
        enableErrorTracking: true
    }
};

// ==========================================================================
// Utility Functions
// ==========================================================================

const Utils = {
    /**
     * Debounce function to limit rate of function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit rate of function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= (0 - offset) &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight + offset) &&
            rect.right <= window.innerWidth
        );
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Get scroll position
     */
    getScrollPosition() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },

    /**
     * Animate number counter
     */
    animateCounter(element, target, duration = 2000) {
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    /**
     * Format date for display
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Show loading state
     */
    showLoading(element, text = 'Loading...') {
        const originalContent = element.innerHTML;
        element.innerHTML = `
            <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <span>${text}</span>
        `;
        element.disabled = true;
        return originalContent;
    },

    /**
     * Hide loading state
     */
    hideLoading(element, originalContent) {
        element.innerHTML = originalContent;
        element.disabled = false;
    }
};

// ==========================================================================
// Navigation Management
// ==========================================================================

class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('mobile-menu');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isMenuOpen = false;

        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveLink();
    }

    setupScrollEffect() {
        const scrollHandler = Utils.throttle(() => {
            const scrolled = Utils.getScrollPosition() > 100;
            this.navbar.classList.toggle('scrolled', scrolled);
        }, 100);

        window.addEventListener('scroll', scrollHandler);
    }

    setupMobileMenu() {
        if (!this.navToggle) return;

        this.navToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen &&
                !this.navMenu.contains(e.target) &&
                !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navMenu.classList.toggle('active');
        this.navToggle.setAttribute('aria-expanded', this.isMenuOpen);

        // Update bars animation
        const bars = this.navToggle.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            bar.style.transform = this.isMenuOpen ?
                `rotate(${index === 0 ? '45deg' : index === 1 ? 'scaleX(0)' : '-45deg'})` : '';
        });

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        this.toggleMobileMenu();
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        Utils.scrollToElement(targetElement, 80);
                        this.closeMobileMenu();
                    }
                });
            }
        });
    }

    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    this.navLinks.forEach(link => link.classList.remove('active'));

                    // Add active class to current section link
                    const activeLink = document.querySelector(
                        `.nav-link[href="#${entry.target.id}"]`
                    );
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }
}

// ==========================================================================
// Animation & Scroll Effects
// ==========================================================================

class AnimationManager {
    constructor() {
        this.animatedElements = new Set();
        this.countersAnimated = new Set();

        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupCounters();
        this.setupSkillBars();
        this.setupTechStackAnimation();
        this.setupBackToTop();
    }

    setupScrollAnimations() {
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(
            observerCallback,
            CONFIG.animations.observerOptions
        );

        // Observe all elements with data-aos attribute
        document.querySelectorAll('[data-aos]').forEach(element => {
            observer.observe(element);
        });
    }

    animateElement(element) {
        const animationType = element.getAttribute('data-aos');
        const delay = element.getAttribute('data-aos-delay') || 0;

        setTimeout(() => {
            element.classList.add('aos-animate');

            // Custom animations based on type
            switch (animationType) {
                case 'fade-up':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-right':
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-left':
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    break;
                case 'float':
                    element.style.animation = 'float 6s ease-in-out infinite';
                    break;
            }
        }, parseInt(delay));
    }

    setupCounters() {
        const counters = document.querySelectorAll('[data-target]');

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.countersAnimated.has(entry.target)) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    Utils.animateCounter(entry.target, target, CONFIG.animations.counterSpeed);
                    this.countersAnimated.add(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.5
        });

        counters.forEach(counter => observer.observe(counter));
    }

    setupSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    const width = entry.target.getAttribute('data-width');
                    setTimeout(() => {
                        entry.target.style.width = width;
                    }, CONFIG.animations.skillBarDelay);
                    this.animatedElements.add(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.3
        });

        skillBars.forEach(bar => observer.observe(bar));
    }

    setupTechStackAnimation() {
        const techItems = document.querySelectorAll('.tech-item');

        techItems.forEach(item => {
            // Add hover effect with tooltip
            item.addEventListener('mouseenter', () => {
                const tooltip = item.getAttribute('data-tooltip');
                if (tooltip) {
                    this.showTooltip(item, tooltip);
                }
            });

            item.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            // Add click effect
            item.addEventListener('click', () => {
                item.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
            });
        });
    }

    showTooltip(element, text) {
        const existing = document.querySelector('.tooltip');
        if (existing) existing.remove();

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-dark);
            color: var(--text-light);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;

        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            setTimeout(() => tooltip.remove(), 200);
        }
    }

    setupBackToTop() {
        const backToTop = document.getElementById('back-to-top');
        if (!backToTop) return;

        const scrollHandler = Utils.throttle(() => {
            const scrolled = Utils.getScrollPosition() > 300;
            backToTop.style.display = scrolled ? 'flex' : 'none';
        }, 100);

        window.addEventListener('scroll', scrollHandler);

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==========================================================================
// Skills & Projects Management
// ==========================================================================

class SkillsManager {
    constructor() {
        this.skillNavBtns = document.querySelectorAll('.skill-nav-btn');
        this.skillCategories = document.querySelectorAll('.skill-category');
        this.currentCategory = 'frontend';

        this.init();
    }

    init() {
        this.setupCategoryNavigation();
        this.setupInteractiveElements();
    }

    setupCategoryNavigation() {
        this.skillNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                this.switchCategory(category);
            });
        });
    }

    switchCategory(category) {
        if (category === this.currentCategory) return;

        // Update navigation buttons
        this.skillNavBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === category);
        });

        // Update category display
        this.skillCategories.forEach(cat => {
            const isActive = cat.getAttribute('data-category') === category;
            cat.classList.toggle('active', isActive);

            if (isActive) {
                // Trigger skill bar animations for newly visible category
                const skillBars = cat.querySelectorAll('.skill-progress');
                skillBars.forEach((bar, index) => {
                    setTimeout(() => {
                        const width = bar.getAttribute('data-width');
                        bar.style.width = width;
                    }, index * 100);
                });
            }
        });

        this.currentCategory = category;
    }

    setupInteractiveElements() {
        // Add hover effects to skill cards
        const skillCards = document.querySelectorAll('.skill-card');

        skillCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
}

// ==========================================================================
// Projects Management
// ==========================================================================

class ProjectsManager {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        this.currentFilter = 'all';

        this.init();
    }

    init() {
        this.setupFiltering();
        this.setupProjectInteractions();
    }

    setupFiltering() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterProjects(filter);
            });
        });
    }

    filterProjects(filter) {
        if (filter === this.currentFilter) return;

        // Update filter buttons
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
        });

        // Filter project cards
        this.projectCards.forEach(card => {
            const categories = card.getAttribute('data-category') || '';
            const shouldShow = filter === 'all' || categories.includes(filter);

            card.style.transition = 'all 0.3s ease';

            if (shouldShow) {
                card.style.display = 'block';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';

                // Animate in
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        this.currentFilter = filter;
    }

    setupProjectInteractions() {
        // Project card hover effects
        this.projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const links = card.querySelector('.project-links');
                if (links) {
                    links.style.opacity = '1';
                    links.style.transform = 'translateY(0)';
                }
            });

            card.addEventListener('mouseleave', () => {
                const links = card.querySelector('.project-links');
                if (links) {
                    links.style.opacity = '0';
                    links.style.transform = 'translateY(-20px)';
                }
            });
        });
    }


}

// ==========================================================================
// Contact Form Management
// ==========================================================================

class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.isSubmitting = false;

        this.init();
    }

    init() {
        if (this.form) {
            this.setupContactForm();
        }


        this.initEmailJS();
    }

    async initEmailJS() {
        try {
            // Load EmailJS if not already loaded
            if (typeof emailjs === 'undefined') {
                await this.loadEmailJS();
            }

            emailjs.init(CONFIG.emailjs.publicKey);
        } catch (error) {
            console.warn('EmailJS initialization failed:', error);
        }
    }

    loadEmailJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupContactForm() {
        const inputs = this.form.querySelectorAll('input, select, textarea');

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmission();
        });
    }


    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required.`;
        }
        // Email validation
        else if (field.type === 'email' && value && !Utils.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
        // Minimum length validation
        else if (field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(field)} must be at least ${minLength} characters.`;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }

        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
    }

    getFieldLabel(field) {
        const label = this.form.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }

    async handleContactSubmission() {
        if (this.isSubmitting) return;

        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showFormMessage('Please correct the errors below.', 'error');
            return;
        }

        // Show loading state
        this.isSubmitting = true;
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalContent = Utils.showLoading(submitBtn, 'Sending...');

        try {
            // Prepare form data
            const formData = new FormData(this.form);
            const templateParams = {};

            // Debug: Log all form fields before processing
            console.log('Form elements found:', this.form.elements);
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: "${value}"`);
                templateParams[key] = value;
            }

            // Also get values directly from form elements as backup
            const nameField = this.form.querySelector('#name, input[name="name"]');
            const emailField = this.form.querySelector('#email, input[name="email"]');
            const companyField = this.form.querySelector('#company, input[name="company"]');
            const budgetField = this.form.querySelector('#budget, select[name="budget"]');
            const serviceField = this.form.querySelector('#service, select[name="service"]');
            const messageField = this.form.querySelector('#message, textarea[name="message"]');

            console.log('Direct field values:');
            console.log('Name:', nameField?.value || 'NOT FOUND');
            console.log('Email:', emailField?.value || 'NOT FOUND');
            console.log('Company:', companyField?.value || 'NOT FOUND');
            console.log('Budget:', budgetField?.value || 'NOT FOUND');
            console.log('Service:', serviceField?.value || 'NOT FOUND');
            console.log('Message:', messageField?.value || 'NOT FOUND');

            // Ensure critical fields are captured
            if (nameField?.value) templateParams.name = nameField.value;
            if (emailField?.value) templateParams.email = emailField.value;
            if (companyField?.value) templateParams.company = companyField.value;
            if (budgetField?.value) templateParams.budget = budgetField.value;
            if (serviceField?.value) templateParams.service = serviceField.value;
            if (messageField?.value) templateParams.message = messageField.value;

            // Add additional data
            templateParams.timestamp = new Date().toISOString();
            templateParams.user_agent = navigator.userAgent;
            templateParams.page_url = window.location.href;

            // Ensure all required fields are properly mapped with explicit values
            const finalName = templateParams.name || nameField?.value || '';
            const finalEmail = templateParams.email || emailField?.value || '';
            const finalCompany = templateParams.company || companyField?.value || '';
            const finalBudget = templateParams.budget || budgetField?.value || '';
            const finalService = templateParams.service || serviceField?.value || '';
            const finalMessage = templateParams.message || messageField?.value || '';

            // Create clean template parameters
            const finalTemplateParams = {
                // Simple, basic field mapping for EmailJS
                message: `
New Contact Form Submission:

Name: ${finalName}
Email: ${finalEmail}
Company: ${finalCompany}
Budget: ${finalBudget}
Service: ${finalService}
Timeline: ${templateParams.timeline || 'Not specified'}

Message:
${finalMessage}

---
Submitted: ${templateParams.timestamp}
From: ${templateParams.page_url}
                `,
                
                // Standard EmailJS fields
                from_name: finalName || 'Website Visitor',
                from_email: finalEmail || 'noreply@gabrieletupini.dev',
                reply_to: finalEmail || 'noreply@gabrieletupini.dev',
                to_name: 'Gabriele Tupini',
                subject: `Contact Form: ${finalService || 'New Inquiry'}`,
                
                // Individual fields for template flexibility
                user_name: finalName,
                user_email: finalEmail,
                user_company: finalCompany,
                user_budget: finalBudget,
                user_service: finalService,
                user_timeline: templateParams.timeline || 'Not specified',
                user_message: finalMessage
            };

            console.log('Final template params being sent:', finalTemplateParams);
            console.log('Raw message that will be sent:', finalTemplateParams.message);

            // Send email via EmailJS
            await emailjs.send(
                CONFIG.emailjs.serviceId,
                CONFIG.emailjs.templateId,
                finalTemplateParams
            );

            // Show success message
            this.showFormMessage(
                'Thank you for your message! I\'ll get back to you within 24 hours.',
                'success'
            );

            // Reset form
            this.form.reset();

            // Track form submission
            this.trackEvent('contact_form_submit', {
                service: finalTemplateParams.service,
                budget: finalTemplateParams.budget
            });

        } catch (error) {
            console.error('Form submission failed:', error);
            this.showFormMessage(
                'Sorry, there was an error sending your message. Please try again or email me directly.',
                'error'
            );
        } finally {
            this.isSubmitting = false;
            Utils.hideLoading(submitBtn, originalContent);
        }
    }


    showFormMessage(message, type) {
        const feedback = document.getElementById('form-feedback');
        const successEl = document.getElementById('success-message');
        const errorEl = document.getElementById('error-message');

        if (!feedback || !successEl || !errorEl) return;

        // Hide both message types first
        successEl.style.display = 'none';
        errorEl.style.display = 'none';

        // Show appropriate message
        if (type === 'success') {
            successEl.style.display = 'block';
            if (successEl.querySelector('p')) {
                successEl.querySelector('p').textContent = message;
            }
        } else {
            errorEl.style.display = 'block';
            if (errorEl.querySelector('p')) {
                errorEl.querySelector('p').innerHTML = message;
            }
        }

        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide message after 10 seconds
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 10000);
    }


    trackEvent(eventName, properties = {}) {
        // Integration with analytics (Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        console.log('Event tracked:', eventName, properties);
    }
}

// ==========================================================================
// Performance & Error Monitoring
// ==========================================================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.errors = [];

        if (CONFIG.performance.enableMetrics) {
            this.init();
        }
    }

    init() {
        this.measureLoadTime();
        this.setupErrorTracking();
        this.monitorUserInteractions();
        this.measureCoreWebVitals();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];

            this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            this.metrics.firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
            this.metrics.firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;

            console.log('Performance Metrics:', this.metrics);
        });
    }

    setupErrorTracking() {
        if (!CONFIG.performance.enableErrorTracking) return;

        window.addEventListener('error', (e) => {
            this.logError({
                type: 'JavaScript Error',
                message: e.message,
                source: e.filename,
                line: e.lineno,
                column: e.colno,
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: e.reason?.message || e.reason,
                timestamp: new Date().toISOString()
            });
        });
    }

    monitorUserInteractions() {
        // Track time to first interaction
        let firstInteraction = false;
        const interactions = ['click', 'keydown', 'touchstart'];

        const recordInteraction = () => {
            if (!firstInteraction) {
                firstInteraction = true;
                this.metrics.timeToFirstInteraction = performance.now();

                interactions.forEach(event => {
                    document.removeEventListener(event, recordInteraction);
                });
            }
        };

        interactions.forEach(event => {
            document.addEventListener(event, recordInteraction);
        });
    }

    measureCoreWebVitals() {
        // This would integrate with web-vitals library in production
        // For now, we'll use basic performance API measurements

        // Largest Contentful Paint
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.largestContentfulPaint = lastEntry.startTime;
        });

        try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // LCP not supported in this browser
        }

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.metrics.cumulativeLayoutShift = clsValue;
        });

        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            // Layout shift not supported
        }
    }

    logError(error) {
        this.errors.push(error);
        console.error('Error tracked:', error);

        // In production, send to error tracking service
        // Example: Sentry, LogRocket, etc.
    }

    getReport() {
        return {
            metrics: this.metrics,
            errors: this.errors,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }
}

// ==========================================================================
// Main Application Initialization
// ==========================================================================

class TechnicalShowcaseApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Show loading overlay
            this.showLoadingOverlay();

            // Initialize core components
            this.components.navigation = new NavigationManager();
            this.components.animations = new AnimationManager();
            this.components.skills = new SkillsManager();
            this.components.projects = new ProjectsManager();
            this.components.contactForm = new ContactFormManager();
            this.components.performance = new PerformanceMonitor();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Initialize additional features
            await this.initializeAdditionalFeatures();

            // Mark as initialized
            this.isInitialized = true;

            // Hide loading overlay
            this.hideLoadingOverlay();

            console.log('Technical Showcase App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideLoadingOverlay();
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
    }

    setupGlobalEvents() {
        // Update copyright year
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        // Handle external links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[target="_blank"]')) {
                // Track external link clicks
                const url = e.target.href;
                console.log('External link clicked:', url);
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Escape key handling
            if (e.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal, .case-study-modal');
                modals.forEach(modal => {
                    const closeBtn = modal.querySelector('.modal-close, .close');
                    if (closeBtn) closeBtn.click();
                });
            }
        });

        // Handle resize events
        window.addEventListener('resize', Utils.debounce(() => {
            // Update any size-dependent calculations
            this.handleResize();
        }, 250));
    }

    handleResize() {
        // Recalculate any dynamic sizes or positions
        const techItems = document.querySelectorAll('.tech-item');
        if (window.innerWidth <= 768) {
            // Mobile adjustments
            techItems.forEach(item => {
                item.style.fontSize = 'var(--text-lg)';
            });
        } else {
            // Desktop adjustments
            techItems.forEach(item => {
                item.style.fontSize = 'var(--text-2xl)';
            });
        }
    }

    async initializeAdditionalFeatures() {
        // Initialize any additional features that require async operations
        try {
            // Load any dynamic content
            await this.loadDynamicContent();

            // Setup analytics if available
            this.setupAnalytics();

            // Initialize any third-party integrations
            this.setupThirdPartyIntegrations();

        } catch (error) {
            console.warn('Some additional features failed to initialize:', error);
        }
    }

    async loadDynamicContent() {
        // Load any content that should be fetched dynamically
        // For example, GitHub repos, etc.

        try {
            // This is where you might load content from a CMS, API, etc.
            console.log('Dynamic content loading not implemented yet');
        } catch (error) {
            console.warn('Failed to load dynamic content:', error);
        }
    }

    setupAnalytics() {
        // Setup Google Analytics or other analytics tools
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    setupThirdPartyIntegrations() {
        // Setup integrations with third-party services
        // For example, chat widgets, analytics tools, etc.
        console.log('Third-party integrations ready');
    }

    // Public API methods
    getComponent(name) {
        return this.components[name];
    }

    getPerformanceReport() {
        return this.components.performance?.getReport();
    }
}

// ==========================================================================
// Application Startup
// ==========================================================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function initializeApp() {
    try {
        // Create global app instance
        window.TechnicalShowcaseApp = new TechnicalShowcaseApp();

        // Initialize the app
        await window.TechnicalShowcaseApp.init();

        // Setup service worker for PWA functionality (optional)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.warn);
        }

    } catch (error) {
        console.error('Failed to initialize Technical Showcase App:', error);
    }
}

// ==========================================================================
// CSS Animations Setup (inject required styles)
// ==========================================================================

// Add CSS for animations that need to be set via JavaScript
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    [data-aos] {
        opacity: 0;
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    [data-aos="fade-up"] {
        transform: translateY(30px);
    }
    
    [data-aos="fade-right"] {
        transform: translateX(-30px);
    }
    
    [data-aos="fade-left"] {
        transform: translateX(30px);
    }
    
    [data-aos].aos-animate {
        opacity: 1;
        transform: translate(0);
    }

`;

document.head.appendChild(animationStyles);

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TechnicalShowcaseApp, Utils, CONFIG };
}