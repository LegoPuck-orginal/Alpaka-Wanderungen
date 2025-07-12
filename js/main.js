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
    this.initializeCookieBanner();
    this.setupCookieFunctions();
    
    // Stelle sicher, dass alle Inhalte sofort sichtbar sind
    this.showAllSections();
    
    // Lade Testdaten für Demo
    this.addTestBookings();
    
    this.isInitialized = true;
    console.log('🦙 Alpaka Website initialized securely');
  }
  
  // === SEKTION SICHTBARKEIT ===
  showAllSections() {
    // Mache alle Sektionen sofort sichtbar
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.add('active', 'visible');
    });
    
    // Markiere Hero als aktuellen Bereich
    this.currentSection = 'hero';
    this.updateActiveNavigation();
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
          entry.target.classList.add('visible', 'active');
          
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
    this.initializeTourCalculation();
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
    
    // Verbesserte Erfolgsmeldung mit Buchungsdetails
    successElement.innerHTML = `
      <div class="success-content">
        <span class="success-icon">🎉</span>
        <h4>Buchungsanfrage erfolgreich gesendet!</h4>
        <p>Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.</p>
        <p><strong>Buchungs-ID:</strong> #${Date.now().toString().slice(-6)}</p>
        <p>Wir melden uns innerhalb von 24 Stunden bei Ihnen zurück.</p>
        <div class="success-actions">
          <button class="btn btn-secondary" onclick="this.closest('.form-success').classList.remove('show')">Verstanden</button>
        </div>
      </div>
    `;
    
    successElement.classList.add('show');
    
    // Automatically hide after 8 seconds
    setTimeout(() => {
      successElement.classList.remove('show');
    }, 8000);
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

  // === BUCHUNGSSYSTEM ERWEITERT ===
  initializeTourCalculation() {
    const tourSelect = document.getElementById('tour');
    const personsSelect = document.getElementById('persons');
    const dateInput = document.getElementById('date');
    const tourInfo = document.getElementById('tour-info');
    const bookingSummary = document.getElementById('booking-summary');
    const summaryContent = document.getElementById('summary-content');

    if (!tourSelect || !personsSelect) return;

    const tourPrices = {
      'familie': { price: 25, name: 'Familien-Tour', duration: '2 Stunden', icon: '🧑‍👧‍👦' },
      'abenteuer': { price: 45, name: 'Abenteuer-Tour', duration: '4 Stunden', icon: '🥾' },
      'sonnenaufgang': { price: 35, name: 'Sonnenaufgang-Tour', duration: '3 Stunden', icon: '🌅' },
      'individuell': { price: 0, name: 'Individuelle Tour', duration: 'Nach Absprache', icon: '⭐' }
    };

    const updateBookingSummary = () => {
      const selectedTour = tourSelect.value;
      const selectedPersons = parseInt(personsSelect.value) || 0;
      const selectedDate = dateInput.value;

      if (selectedTour && selectedPersons && tourPrices[selectedTour]) {
        const tour = tourPrices[selectedTour];
        const totalPrice = tour.price * selectedPersons;

        tourInfo.innerHTML = `
          <div class="tour-details">
            <span class="tour-icon">${tour.icon}</span>
            <div class="tour-text">
              <strong>${tour.name}</strong><br>
              <small>Dauer: ${tour.duration}</small>
            </div>
          </div>
        `;

        if (selectedTour !== 'individuell') {
          summaryContent.innerHTML = `
            <div class="summary-item">
              <span>Tour:</span>
              <span>${tour.icon} ${tour.name}</span>
            </div>
            <div class="summary-item">
              <span>Teilnehmer:</span>
              <span>${selectedPersons} Person${selectedPersons > 1 ? 'en' : ''}</span>
            </div>
            <div class="summary-item">
              <span>Preis pro Person:</span>
              <span>${tour.price}€</span>
            </div>
            ${selectedDate ? `<div class="summary-item"><span>Datum:</span><span>${new Date(selectedDate).toLocaleDateString('de-DE')}</span></div>` : ''}
            <div class="summary-total">
              <span>Gesamtpreis:</span>
              <span>${totalPrice}€</span>
            </div>
          `;
        } else {
          summaryContent.innerHTML = `
            <div class="summary-item">
              <span>Tour:</span>
              <span>${tour.icon} ${tour.name}</span>
            </div>
            <div class="summary-item">
              <span>Teilnehmer:</span>
              <span>${selectedPersons} Person${selectedPersons > 1 ? 'en' : ''}</span>
            </div>
            ${selectedDate ? `<div class="summary-item"><span>Datum:</span><span>${new Date(selectedDate).toLocaleDateString('de-DE')}</span></div>` : ''}
            <div class="summary-note">
              <span>💡 Preis wird individuell nach Ihren Wünschen berechnet</span>
            </div>
          `;
        }

        bookingSummary.style.display = 'block';
      } else {
        bookingSummary.style.display = 'none';
        tourInfo.innerHTML = '';
      }
    };

    tourSelect.addEventListener('change', updateBookingSummary);
    personsSelect.addEventListener('change', updateBookingSummary);
    dateInput.addEventListener('change', updateBookingSummary);
  }

  // === COOKIE MANAGEMENT ===
  initializeCookieBanner() {
    // Prüfe ob bereits entschieden wurde
    const cookieConsent = localStorage.getItem('alpaka_cookie_consent');
    if (!cookieConsent) {
      setTimeout(() => {
        document.getElementById('cookie-banner').classList.add('show');
      }, 2000); // 2 Sekunden nach Seitenload
    }
  }
  
  // Global Cookie Functions
  setupCookieFunctions() {
    window.acceptCookies = () => {
      localStorage.setItem('alpaka_cookie_consent', JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString()
      }));
      this.hideCookieBanner();
      console.log('✅ Alle Cookies akzeptiert');
    };
    
    window.declineCookies = () => {
      localStorage.setItem('alpaka_cookie_consent', JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString()
      }));
      this.hideCookieBanner();
      console.log('❌ Optionale Cookies abgelehnt');
    };
    
    window.showPrivacyModal = () => {
      document.getElementById('privacy-modal').classList.add('show');
    };
    
    window.closePrivacyModal = () => {
      document.getElementById('privacy-modal').classList.remove('show');
    };
    
    window.savePreferences = () => {
      const analytics = document.getElementById('analytics-cookies').checked;
      const marketing = document.getElementById('marketing-cookies').checked;
      
      localStorage.setItem('alpaka_cookie_consent', JSON.stringify({
        necessary: true,
        analytics: analytics,
        marketing: marketing,
        timestamp: new Date().toISOString()
      }));
      
      this.hideCookieBanner();
      window.closePrivacyModal();
      console.log('💾 Cookie-Einstellungen gespeichert:', { analytics, marketing });
    };
  }
  
  hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 500);
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

  // === TESTDATEN FÜR BUCHUNGSSYSTEM ===
  addTestBookings() {
    const testBookings = [
      {
        id: 'booking_001',
        name: 'Familie Mustermann',
        email: 'familie@mustermann.de',
        phone: '+49 123 456 789',
        persons: 4,
        tour: 'familie',
        date: '2025-07-20',
        message: 'Wir freuen uns sehr auf die Familien-Tour mit unseren zwei Kindern (8 und 12 Jahre).',
        timestamp: new Date('2025-07-10T10:30:00').toISOString(),
        status: 'confirmed',
        isRead: true
      },
      {
        id: 'booking_002', 
        name: 'Sarah Schmidt',
        email: 'sarah.schmidt@email.de',
        phone: '+49 987 654 321',
        persons: 2,
        tour: 'sonnenaufgang',
        date: '2025-07-25',
        message: 'Sonnenaufgang-Tour für mich und meinen Partner. Können wir vegetarisches Frühstück bekommen?',
        timestamp: new Date('2025-07-11T14:15:00').toISOString(),
        status: 'new',
        isRead: false
      },
      {
        id: 'booking_003',
        name: 'Michael Weber',
        email: 'm.weber@outdoor.com', 
        phone: '+49 555 123 456',
        persons: 6,
        tour: 'abenteuer',
        date: '2025-08-05',
        message: 'Abenteuer-Tour für unsere Wandergruppe. Alle sind erfahrene Wanderer.',
        timestamp: new Date('2025-07-12T09:45:00').toISOString(),
        status: 'pending',
        isRead: false
      }
    ];

    // Füge Testbuchungen zu localStorage hinzu
    const existingRequests = JSON.parse(localStorage.getItem('alpaka_contact_requests') || '[]');
    const combinedRequests = [...existingRequests, ...testBookings];
    localStorage.setItem('alpaka_contact_requests', JSON.stringify(combinedRequests));
    
    console.log('✅ Test-Buchungen hinzugefügt:', testBookings.length);
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

// === GLOBALE HILFSFUNKTIONEN ===

// Tour Filter Funktionalität
function initializeTourFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const tourCards = document.querySelectorAll('.tour-card');

  if (filterButtons.length === 0 || tourCards.length === 0) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Entferne active von allen Buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Füge active zum geklickten Button hinzu
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      tourCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100);
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

// Tour Details Modal
const tourDetails = {
  'familie': {
    title: '👨‍👩‍👧‍👦 Familien-Tour',
    duration: '2 Stunden',
    price: '25€ pro Person',
    description: 'Die perfekte Tour für die ganze Familie! Unsere kinderlieben Alpakas sorgen für unvergessliche Momente.',
    includes: [
      '✅ Erfahrener Guide',
      '✅ Kleine Gruppe (max. 8 Personen)',
      '✅ Picknick mit regionalen Produkten',
      '✅ Fotoshooting mit den Alpakas',
      '✅ Sicherheitsausrüstung',
      '✅ Alpaka-Diplom für Kinder'
    ],
    route: 'Wiesenwege → Waldpfad → Alpaka-Gehege → Picknickplatz',
    difficulty: 'Leicht',
    distance: '3 km'
  },
  'abenteuer': {
    title: '🥾 Abenteuer-Tour',
    duration: '4 Stunden',
    price: '45€ pro Person',
    description: 'Für echte Naturliebhaber! Entdecken Sie mit unseren Alpakas die schönsten Wanderwege der Region.',
    includes: [
      '✅ Professioneller Bergführer',
      '✅ Kleine Gruppe (max. 6 Personen)',
      '✅ Gipfelpicknick mit Panoramablick',
      '✅ Fotoshooting an besonderen Orten',
      '✅ Wanderstöcke bei Bedarf',
      '✅ Energie-Snacks und Getränke'
    ],
    route: 'Bergpfad → Aussichtspunkt → Gipfel → Abstieg durch Wälder',
    difficulty: 'Mittel',
    distance: '8 km'
  },
  'sonnenaufgang': {
    title: '🌅 Sonnenaufgang-Tour',
    duration: '3 Stunden',
    price: '35€ pro Person',
    description: 'Magische Momente erleben! Starten Sie früh am Morgen und genießen Sie den Sonnenaufgang mit unseren Alpakas.',
    includes: [
      '✅ Frühaufsteher-Guide',
      '✅ Exklusive kleine Gruppe (max. 6 Personen)',
      '✅ Romantisches Frühstück bei Sonnenaufgang',
      '✅ Warme Decken und heißer Kaffee',
      '✅ Professionelle Sonnenaufgang-Fotos',
      '✅ Sonnenaufgang-Garantie*'
    ],
    route: 'Frühmorgendlicher Aufstieg → Aussichtspunkt → Frühstücksplatz',
    difficulty: 'Leicht-Mittel',
    distance: '4 km'
  }
};

function showTourDetails(tourId) {
  const tour = tourDetails[tourId];
  if (!tour) return;

  // Erstelle Modal HTML
  const modalHTML = `
    <div class="tour-modal-overlay" onclick="closeTourModal()">
      <div class="tour-modal" onclick="event.stopPropagation()">
        <div class="tour-modal-header">
          <h2>${tour.title}</h2>
          <button class="tour-modal-close" onclick="closeTourModal()">×</button>
        </div>
        <div class="tour-modal-body">
          <div class="tour-info-grid">
            <div class="tour-info-item">
              <strong>⏰ Dauer:</strong> ${tour.duration}
            </div>
            <div class="tour-info-item">
              <strong>💰 Preis:</strong> ${tour.price}
            </div>
            <div class="tour-info-item">
              <strong>📍 Schwierigkeit:</strong> ${tour.difficulty}
            </div>
            <div class="tour-info-item">
              <strong>🚶‍♀️ Strecke:</strong> ${tour.distance}
            </div>
          </div>
          
          <div class="tour-description">
            <h3>Beschreibung</h3>
            <p>${tour.description}</p>
          </div>
          
          <div class="tour-includes">
            <h3>Im Preis enthalten</h3>
            <div class="includes-list">
              ${tour.includes.map(item => `<div class="include-item">${item}</div>`).join('')}
            </div>
          </div>
          
          <div class="tour-route">
            <h3>Route</h3>
            <p>${tour.route}</p>
          </div>
        </div>
        <div class="tour-modal-footer">
          <button class="btn btn-secondary" onclick="closeTourModal()">Schließen</button>
          <a href="#kontakt" class="btn btn-primary" data-tour="${tourId}" onclick="closeTourModal(); selectTour('${tourId}')">
            Jetzt buchen
          </a>
        </div>
      </div>
    </div>
  `;

  // Füge Modal zum DOM hinzu
  const existingModal = document.querySelector('.tour-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';
}

function closeTourModal() {
  const modal = document.querySelector('.tour-modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
}

function selectTour(tourId) {
  // Automatische Tour-Auswahl im Kontaktformular
  setTimeout(() => {
    const tourSelect = document.getElementById('tour');
    if (tourSelect) {
      tourSelect.value = tourId;
      // Trigger change event für Preisberechnung
      tourSelect.dispatchEvent(new Event('change'));
    }
  }, 500);
}

// Initialisiere Features nach DOM Load
document.addEventListener('DOMContentLoaded', function() {
  // Warte bis die Alpaka Website initialisiert ist
  setTimeout(() => {
    initializeTourFilter();
  }, 100);
});
