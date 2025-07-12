// Website Main JavaScript - Sicher und Modern
class AlpakaWebsite {
  constructor() {
    this.isInitialized = false;
    this.currentSection = 'hero';
    this.formData = new Map();
    this.csrfToken = this.generateCSRFToken();
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.initializeAnimations();
    this.initializeNavigation();
    this.initializeContactForm();
    this.initializeDarkMode();
    this.setupSecurityMeasures();
    
    this.isInitialized = true;
    console.log('🦙 Alpaka Website initialized securely');
  }

  // === SICHERHEITSMASSNAHMEN ===
  generateCSRFToken() {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  }

  setupSecurityMeasures() {
    // Content Security Policy Headers (würde normalerweise server-seitig gesetzt)
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:;");
      document.head.appendChild(cspMeta);
    }

    // XSS Schutz
    this.sanitizeInputs();
    
    // Rate Limiting für Formulare
    this.setupRateLimiting();
  }

  sanitizeInputs() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = this.sanitizeHTML(e.target.value);
      });
    });
  }

  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML.replace(/[<>]/g, '');
  }

  setupRateLimiting() {
    this.submissionTimes = [];
    this.maxSubmissions = 3; // Max 3 Submissions pro 5 Minuten
    this.timeWindow = 5 * 60 * 1000; // 5 Minuten
  }

  checkRateLimit() {
    const now = Date.now();
    this.submissionTimes = this.submissionTimes.filter(time => now - time < this.timeWindow);
    
    if (this.submissionTimes.length >= this.maxSubmissions) {
      return false;
    }
    
    this.submissionTimes.push(now);
    return true;
  }

  // === EVENT LISTENERS ===
  setupEventListeners() {
    // Sichere Event Delegation
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    
    // Keyboard Navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const value = target.getAttribute('data-value');

    switch (action) {
      case 'navigate':
        this.navigateToSection(value);
        break;
      case 'toggle-menu':
        this.toggleMobileMenu();
        break;
      case 'toggle-dark-mode':
        this.toggleDarkMode();
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  handleKeydown(e) {
    // Escape schließt Mobile Menu
    if (e.key === 'Escape') {
      this.closeMobileMenu();
    }
    
    // Enter auf Buttons
    if (e.key === 'Enter' && e.target.matches('button')) {
      e.target.click();
    }
  }

  // === NAVIGATION ===
  initializeNavigation() {
    this.updateActiveNavigation();
    this.setupMobileMenu();
  }

  navigateToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // Smooth scroll mit Offset für Fixed Header
    const headerHeight = document.querySelector('.nav-container')?.offsetHeight || 60;
    const targetPosition = targetSection.offsetTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    this.currentSection = sectionId;
    this.updateActiveNavigation();
    this.closeMobileMenu();
  }

  updateActiveNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-value="${this.currentSection}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  setupMobileMenu() {
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => this.closeMobileMenu());
  }

  toggleMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('#nav-toggle');
    const overlay = document.querySelector('.nav-overlay');

    if (menu && toggle && overlay) {
      const isOpen = menu.classList.contains('open');
      
      menu.classList.toggle('open', !isOpen);
      toggle.classList.toggle('open', !isOpen);
      overlay.classList.toggle('active', !isOpen);
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'auto' : 'hidden';
    }
  }

  closeMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('#nav-toggle');
    const overlay = document.querySelector('.nav-overlay');

    if (menu && toggle && overlay) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // === SCROLL ANIMATIONEN ===
  initializeAnimations() {
    this.setupScrollObserver();
    this.animateCounters();
  }

  setupScrollObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Update current section
          if (entry.target.id) {
            this.currentSection = entry.target.id;
            this.updateActiveNavigation();
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('.section, .fade-in').forEach(el => {
      this.observer.observe(el);
    });
  }

  animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      // Start animation when element is visible
      this.observer.observe(counter);
      counter.addEventListener('visible', updateCounter, { once: true });
    });
  }

  // === KONTAKT FORMULAR ===
  initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Setze minimales Datum für Date Input
    const dateInput = form.querySelector('#date');
    if (dateInput) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const maxDate = new Date(today);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      
      dateInput.min = tomorrow.toISOString().split('T')[0];
      dateInput.max = maxDate.toISOString().split('T')[0];
    }

    this.setupFormValidation(form);
    this.setupFormSubmission(form);
  }

  setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (required && !value) {
      isValid = false;
      errorMessage = 'Dieses Feld ist erforderlich';
    }
    // Email validation
    else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      }
    }
    // Phone validation
    else if (type === 'tel' && value) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein';
      }
    }

    this.setFieldError(field, isValid ? '' : errorMessage);
    return isValid;
  }

  setFieldError(field, message) {
    field.classList.toggle('error', !!message);
    
    let errorElement = field.parentNode.querySelector('.form-error');
    if (!errorElement && message) {
      errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      field.parentNode.appendChild(errorElement);
    }
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  setupFormSubmission(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!this.checkRateLimit()) {
        this.showMessage('Zu viele Anfragen. Bitte warten Sie 5 Minuten.', 'error');
        return;
      }

      if (!this.validateForm(form)) {
        this.showMessage('Bitte überprüfen Sie Ihre Eingaben.', 'error');
        return;
      }

      await this.submitForm(form);
    });
  }

  validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async submitForm(form) {
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';

    try {
      // Collect form data securely
      const formData = new FormData(form);
      const data = {
        name: this.sanitizeHTML(formData.get('name') || ''),
        email: this.sanitizeHTML(formData.get('email') || ''),
        phone: this.sanitizeHTML(formData.get('phone') || ''),
        persons: parseInt(formData.get('persons') || '1'),
        date: formData.get('date') || '',
        message: this.sanitizeHTML(formData.get('message') || ''),
        timestamp: new Date().toISOString(),
        csrf: this.csrfToken
      };

      // Save to localStorage (in real app: send to server)
      await this.saveContactRequest(data);
      
      this.showSuccessMessage();
      form.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  async saveContactRequest(data) {
    try {
      const existingRequests = JSON.parse(localStorage.getItem('alpaka_contact_requests') || '[]');
      existingRequests.push({
        id: Date.now().toString(),
        ...data,
        status: 'new',
        isRead: false
      });
      
      localStorage.setItem('alpaka_contact_requests', JSON.stringify(existingRequests));
      
      // Update statistics
      this.updateStatistics();
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  updateStatistics() {
    try {
      const stats = JSON.parse(localStorage.getItem('alpaka_statistics') || '{}');
      const today = new Date().toISOString().split('T')[0];
      
      if (!stats.dailyCalls) stats.dailyCalls = {};
      if (!stats.dailyCalls[today]) stats.dailyCalls[today] = 0;
      
      stats.dailyCalls[today]++;
      stats.totalRequests = (stats.totalRequests || 0) + 1;
      stats.lastUpdate = new Date().toISOString();
      
      localStorage.setItem('alpaka_statistics', JSON.stringify(stats));
    } catch (error) {
      console.error('Statistics update error:', error);
    }
  }

  showSuccessMessage() {
    const successElement = document.getElementById('form-success') || this.createSuccessElement();
    successElement.classList.add('show');
    
    setTimeout(() => {
      successElement.classList.remove('show');
    }, 5000);
  }

  createSuccessElement() {
    const successDiv = document.createElement('div');
    successDiv.id = 'form-success';
    successDiv.className = 'form-success';
    successDiv.textContent = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns bald bei Ihnen.';
    
    const form = document.getElementById('contact-form');
    if (form) {
      form.appendChild(successDiv);
    }
    
    return successDiv;
  }

  showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // === DARK MODE ===
  initializeDarkMode() {
    const savedMode = localStorage.getItem('alpaka_dark_mode');
    if (savedMode === 'true') {
      document.body.classList.add('dark-mode');
      this.updateDarkModeButton(true);
    }
  }

  toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('alpaka_dark_mode', isDark);
    this.updateDarkModeButton(isDark);
  }

  updateDarkModeButton(isDark) {
    const button = document.querySelector('[data-action="toggle-dark-mode"]');
    if (button) {
      const icon = button.querySelector('.btn-icon');
      if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
      }
    }
  }

  // === UTILITY FUNCTIONS ===
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

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
  }

  handleScroll() {
    // Header background opacity based on scroll
    const header = document.querySelector('.nav-container');
    if (header) {
      const scrolled = window.scrollY > 50;
      header.style.background = scrolled 
        ? 'rgba(240, 240, 232, 0.98)' 
        : 'rgba(240, 240, 232, 0.95)';
    }
  }

  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.alpakaWebsite = new AlpakaWebsite();
});

// Fallback for older browsers
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.alpakaWebsite) {
      window.alpakaWebsite = new AlpakaWebsite();
    }
  });
} else if (!window.alpakaWebsite) {
  window.alpakaWebsite = new AlpakaWebsite();
}
