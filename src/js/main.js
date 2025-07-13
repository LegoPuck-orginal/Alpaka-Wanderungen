// === ALPAKA WANDERUNGEN - MAIN JAVASCRIPT ===

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollAnimations();
    initializeContactForm();
    initializeDarkMode();
    initializeSmoothScrolling();
    initializeParallaxEffects();
});

// === NAVIGATION FUNCTIONALITY ===
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.createElement('div');
    const body = document.body;
    
    // Create overlay for mobile menu
    navOverlay.className = 'nav-overlay';
    body.appendChild(navOverlay);
    
    // Toggle mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('open');
            
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // Close menu when clicking overlay
    navOverlay.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.nav-container');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(240, 240, 232, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(240, 240, 232, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    function openMobileMenu() {
        navMenu.classList.add('open');
        navToggle.classList.add('open');
        navOverlay.classList.add('active');
        body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navOverlay.classList.remove('active');
        body.style.overflow = '';
    }
}

// === SCROLL ANIMATIONS ===
function initializeScrollAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.tour-card, .about-content > *, .contact-item, .contact-form, .section-title'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Parallax scrolling for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// === CONTACT FORM ===
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (!validateForm(data)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Wird gesendet...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                showSuccessMessage();
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
    function validateForm(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name muss mindestens 2 Zeichen haben');
        }
        
        if (!data.email || !isValidEmail(data.email)) {
            errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein');
        }
        
        if (!data.message || data.message.trim().length < 10) {
            errors.push('Nachricht muss mindestens 10 Zeichen haben');
        }
        
        if (errors.length > 0) {
            showErrorMessage(errors.join('\n'));
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showSuccessMessage() {
        showMessage('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success');
    }
    
    function showErrorMessage(message) {
        showMessage(message, 'error');
    }
    
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            ${type === 'success' 
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;
        
        // Insert message
        const form = document.getElementById('contact-form');
        form.insertBefore(messageEl, form.firstChild);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// === DARK MODE TOGGLE ===
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.toggle('dark-mode', savedTheme === 'dark');
        updateDarkModeToggle();
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateDarkModeToggle();
        });
    }
    
    function updateDarkModeToggle() {
        if (darkModeToggle) {
            const isDark = body.classList.contains('dark-mode');
            darkModeToggle.innerHTML = isDark ? '☀️' : '🌙';
            darkModeToggle.title = isDark ? 'Heller Modus' : 'Dunkler Modus';
        }
    }
}

// === SMOOTH SCROLLING ===
function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                updateActiveNavLink(targetId);
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                updateActiveNavLink(`#${sectionId}`);
            }
        });
    });
    
    function updateActiveNavLink(targetId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    }
}

// === PARALLAX EFFECTS ===
function initializeParallaxEffects() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax for hero background
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundPosition = `center ${rate}px`;
        }
        
        // Parallax for floating elements
        const floatingElements = document.querySelectorAll('.tour-card');
        floatingElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// === BOOKING FUNCTIONALITY ===
function initializeBooking() {
    const bookingButtons = document.querySelectorAll('.btn-booking');
    
    bookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tourType = this.dataset.tour || 'Standard';
            openBookingModal(tourType);
        });
    });
    
    function openBookingModal(tourType) {
        // Create modal (simplified - in production use a proper modal library)
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>Buchung für ${tourType} Tour</h3>
                <p>Vielen Dank für Ihr Interesse! Bitte kontaktieren Sie uns für eine Buchung:</p>
                <div class="booking-info">
                    <p><strong>Telefon:</strong> +49 123 456789</p>
                    <p><strong>E-Mail:</strong> info@alpaka-wanderungen.de</p>
                    <p><strong>WhatsApp:</strong> +49 123 456789</p>
                </div>
                <button class="btn btn-primary" onclick="this.closest('.booking-modal').remove()">
                    Verstanden
                </button>
            </div>
        `;
        
        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(modal);
        
        // Close modal on click outside or close button
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.remove();
            }
        });
    }
}

// === UTILITY FUNCTIONS ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimized scroll handlers
window.addEventListener('scroll', throttle(function() {
    // Any scroll-dependent functionality here
}, 16)); // ~60fps

// Initialize booking when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBooking);

// === EXPORT FOR MODULES (if using module system) ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeScrollAnimations,
        initializeContactForm,
        initializeDarkMode,
        initializeSmoothScrolling,
        initializeParallaxEffects,
        initializeBooking
    };
}
