// Alpaka-Wanderungen - Hauptfunktionen

// API Base URL
const API_BASE = window.location.origin;

// Aktuelle Buchungsdaten
let currentBookingData = {
    tour: '',
    pricePerPerson: 0,
    participants: 1,
    basePrice: 0,
    discountAmount: 0,
    totalPrice: 0,
    voucherCode: '',
    discountCode: ''
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// App initialisieren
function initializeApp() {
    // Mobile Navigation
    initMobileNavigation();
    
    // Smooth Scrolling für Navigation
    initSmoothScrolling();
    
    // Formulare initialisieren
    initForms();
    
    // Tour Cards Event Listener
    initTourCards();
    
    // Mindestdatum für Buchungen setzen
    setMinimumDate();
}

// Tour Cards initialisieren
function initTourCards() {
    // Tour Card Event Listener hinzufügen
    const tourCards = document.querySelectorAll('.tour-card');
    tourCards.forEach(card => {
        card.addEventListener('click', function() {
            const tourName = this.querySelector('.tour-title').textContent;
            const priceText = this.querySelector('.tour-price').textContent;
            const price = parseInt(priceText.match(/\d+/)[0]);
            showBookingForm(tourName, price);
        });
    });
}

// Mobile Navigation
function initMobileNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Formulare initialisieren
function initForms() {
    // Buchungsformular
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Kontaktformular
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Teilnehmer-Änderung für Preisberechnung
    const participantsSelect = document.getElementById('bookingParticipants');
    if (participantsSelect) {
        participantsSelect.addEventListener('change', updatePrice);
    }
}

// Mindestdatum setzen
function setMinimumDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// Buchungsformular anzeigen
function showBookingForm(tourName, pricePerPerson) {
    currentBookingData.tour = tourName;
    currentBookingData.pricePerPerson = pricePerPerson;
    
    // Modal anzeigen
    const modal = document.getElementById('bookingModal');
    const tourInput = document.getElementById('bookingTour');
    
    if (modal && tourInput) {
        tourInput.value = tourName;
        modal.style.display = 'block';
        
        // Körper scrollen deaktivieren
        document.body.style.overflow = 'hidden';
        
        // Preis aktualisieren
        updatePrice();
        
        // Formulardaten zurücksetzen
        resetBookingForm();
    }
}

// Buchungsmodal schließen
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Formulardaten zurücksetzen
        resetBookingForm();
        clearAlert('bookingAlert');
    }
}

// Buchungsformular zurücksetzen
function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    if (form) {
        // Alle Felder außer Tour zurücksetzen
        const tourField = document.getElementById('bookingTour');
        const tourValue = tourField.value;
        
        form.reset();
        tourField.value = tourValue;
        
        // Codes und Rabatte zurücksetzen
        currentBookingData.voucherCode = '';
        currentBookingData.discountCode = '';
        currentBookingData.discountAmount = 0;
        
        updatePrice();
    }
}

// Preis aktualisieren
function updatePrice() {
    const participants = parseInt(document.getElementById('bookingParticipants')?.value) || 1;
    
    currentBookingData.participants = participants;
    currentBookingData.basePrice = currentBookingData.pricePerPerson * participants;
    currentBookingData.totalPrice = currentBookingData.basePrice - currentBookingData.discountAmount;
    
    // UI aktualisieren
    updatePriceDisplay();
}

// Preisanzeige aktualisieren
function updatePriceDisplay() {
    const basePriceEl = document.getElementById('basePrice');
    const discountAmountEl = document.getElementById('discountAmount');
    const totalPriceEl = document.getElementById('totalPrice');
    const discountRowEl = document.getElementById('discountRow');
    
    if (basePriceEl) basePriceEl.textContent = `${currentBookingData.basePrice}€`;
    if (discountAmountEl) discountAmountEl.textContent = `-${currentBookingData.discountAmount}€`;
    if (totalPriceEl) totalPriceEl.textContent = `${currentBookingData.totalPrice}€`;
    
    // Rabattzeile nur anzeigen wenn Rabatt vorhanden
    if (discountRowEl) {
        discountRowEl.style.display = currentBookingData.discountAmount > 0 ? 'flex' : 'none';
    }
}

// Gutschein prüfen
async function checkVoucher() {
    const voucherInput = document.getElementById('bookingVoucher');
    const voucherCode = voucherInput?.value.trim().toUpperCase();
    
    if (!voucherCode) {
        showAlert('bookingAlert', 'Bitte geben Sie einen Gutscheincode ein.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/vouchers/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: voucherCode })
        });
        
        const result = await response.json();
        
        if (result.valid) {
            currentBookingData.voucherCode = voucherCode;
            
            // Rabatt berechnen
            let discount = 0;
            if (result.voucher.type === 'percentage') {
                discount = Math.round((currentBookingData.basePrice * result.voucher.value) / 100);
            } else {
                discount = Math.min(result.voucher.value, currentBookingData.basePrice);
            }
            
            currentBookingData.discountAmount = discount;
            updatePrice();
            
            showAlert('bookingAlert', `✅ Gutschein "${voucherCode}" erfolgreich eingelöst! Rabatt: ${discount}€`, 'success');
        } else {
            showAlert('bookingAlert', `❌ Gutscheincode "${voucherCode}" ist ungültig oder abgelaufen.`, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Prüfen des Gutscheins:', error);
        showAlert('bookingAlert', 'Fehler beim Prüfen des Gutscheincodes. Bitte versuchen Sie es später erneut.', 'error');
    }
}

// Rabattcode prüfen
async function checkDiscount() {
    const discountInput = document.getElementById('bookingDiscount');
    const discountCode = discountInput?.value.trim().toUpperCase();
    
    if (!discountCode) {
        showAlert('bookingAlert', 'Bitte geben Sie einen Rabattcode ein.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/discount-codes/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: discountCode })
        });
        
        const result = await response.json();
        
        if (result.valid) {
            currentBookingData.discountCode = discountCode;
            
            // Rabatt berechnen (zusätzlich zu Gutschein)
            let additionalDiscount = 0;
            if (result.discount.type === 'percentage') {
                additionalDiscount = Math.round((currentBookingData.basePrice * result.discount.value) / 100);
            } else {
                additionalDiscount = Math.min(result.discount.value, currentBookingData.basePrice);
            }
            
            currentBookingData.discountAmount += additionalDiscount;
            updatePrice();
            
            showAlert('bookingAlert', `✅ Rabattcode "${discountCode}" erfolgreich angewendet! Zusätzlicher Rabatt: ${additionalDiscount}€`, 'success');
        } else {
            showAlert('bookingAlert', `❌ Rabattcode "${discountCode}" ist ungültig oder abgelaufen.`, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Prüfen des Rabattcodes:', error);
        showAlert('bookingAlert', 'Fehler beim Prüfen des Rabattcodes. Bitte versuchen Sie es später erneut.', 'error');
    }
}

// Buchung absenden
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('bookingName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        tour: currentBookingData.tour,
        date: document.getElementById('bookingDate').value,
        participants: currentBookingData.participants,
        voucherCode: currentBookingData.voucherCode,
        discountCode: currentBookingData.discountCode,
        message: document.getElementById('bookingMessage').value,
        pricePerPerson: currentBookingData.pricePerPerson,
        basePrice: currentBookingData.basePrice,
        discountAmount: currentBookingData.discountAmount,
        totalPrice: currentBookingData.totalPrice
    };
    
    try {
        showAlert('bookingAlert', 'Buchungsanfrage wird gesendet...', 'info');
        
        const response = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('bookingAlert', '✅ Ihre Buchungsanfrage wurde erfolgreich gesendet! Sie erhalten in Kürze eine Bestätigungs-E-Mail.', 'success');
            
            // Formular nach 3 Sekunden schließen
            setTimeout(() => {
                closeBookingModal();
            }, 3000);
        } else {
            showAlert('bookingAlert', `❌ Fehler beim Senden: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Senden der Buchung:', error);
        showAlert('bookingAlert', '❌ Fehler beim Senden der Buchungsanfrage. Bitte versuchen Sie es später erneut.', 'error');
    }
}

// Kontaktformular absenden
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value
    };
    
    try {
        showAlert('contactAlert', 'Nachricht wird gesendet...', 'info');
        
        const response = await fetch(`${API_BASE}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('contactAlert', '✅ Ihre Nachricht wurde erfolgreich gesendet! Wir melden uns in Kürze bei Ihnen.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showAlert('contactAlert', `❌ Fehler beim Senden: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Fehler beim Senden der Kontaktnachricht:', error);
        showAlert('contactAlert', '❌ Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.', 'error');
    }
}

// Alert anzeigen
function showAlert(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    // Auto-hide für Erfolgs- und Info-Meldungen
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            clearAlert(containerId);
        }, 5000);
    }
}

// Alert löschen
function clearAlert(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

// Modal außerhalb des Inhalts schließen
window.addEventListener('click', function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        closeBookingModal();
    }
});

// Escape-Taste zum Schließen des Modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeBookingModal();
    }
});

// Service Worker wurde entfernt um 404-Fehler zu vermeiden
// Falls gewünscht, kann später ein Service Worker erstellt werden

// Lazy Loading für Bilder
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Scroll-Animationen
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.tour-card, .stat, .contact-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Navigation Scroll-Effekt
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(51, 152, 75, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'transparent';
        navbar.style.backdropFilter = 'none';
    }
});

// App initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    lazyLoadImages();
});
