// Alpaka-Wanderungen JavaScript - Gutschein-Formular

document.addEventListener('DOMContentLoaded', function() {
    console.log('🦙 Alpaka-Wanderungen JavaScript geladen!');
    
    // Gutschein-Formular Funktionalität
    initGutscheinForm();
    
    // Mobile Navigation
    initMobileNav();
    
    // Smooth Scrolling
    initSmoothScrolling();
});

// Gutschein-Formular Initialisierung
function initGutscheinForm() {
    const gutscheinForm = document.getElementById('gutscheinForm');
    const gutscheinTypRadios = document.querySelectorAll('input[name="gutscheinTyp"]');
    const empfaengerTypRadios = document.querySelectorAll('input[name="empfaengerTyp"]');
    const gutscheinBetragSelect = document.getElementById('gutscheinBetrag');
    
    if (!gutscheinForm) return;
    
    console.log('🎁 Gutschein-Formular initialisiert');
    
    // Gutschein-Typ Änderung (Betrag vs Tour)
    gutscheinTypRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const betragGruppe = document.getElementById('betragGruppe');
            const tourGruppe = document.getElementById('tourGruppe');
            
            if (this.value === 'betrag') {
                betragGruppe.style.display = 'block';
                tourGruppe.style.display = 'none';
                document.getElementById('gutscheinBetrag').required = true;
                document.getElementById('gutscheinTour').required = false;
            } else {
                betragGruppe.style.display = 'none';
                tourGruppe.style.display = 'block';
                document.getElementById('gutscheinBetrag').required = false;
                document.getElementById('gutscheinTour').required = true;
            }
        });
    });
    
    // Custom Betrag anzeigen/verstecken
    if (gutscheinBetragSelect) {
        gutscheinBetragSelect.addEventListener('change', function() {
            const customBetragGruppe = document.getElementById('customBetragGruppe');
            const customBetragInput = document.getElementById('customBetrag');
            
            if (this.value === 'custom') {
                customBetragGruppe.style.display = 'block';
                customBetragInput.required = true;
                customBetragInput.focus();
            } else {
                customBetragGruppe.style.display = 'none';
                customBetragInput.required = false;
                customBetragInput.value = '';
            }
        });
    }
    
    // Empfänger-Typ Änderung (Selbst vs Geschenk)
    empfaengerTypRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const empfaengerDaten = document.getElementById('empfaengerDaten');
            const empfaengerVorname = document.getElementById('empfaengerVorname');
            const empfaengerNachname = document.getElementById('empfaengerNachname');
            
            if (this.value === 'geschenk') {
                empfaengerDaten.style.display = 'block';
                empfaengerVorname.required = true;
                empfaengerNachname.required = true;
            } else {
                empfaengerDaten.style.display = 'none';
                empfaengerVorname.required = false;
                empfaengerNachname.required = false;
                // Felder leeren
                empfaengerVorname.value = '';
                empfaengerNachname.value = '';
                document.getElementById('empfaengerEmail').value = '';
            }
        });
    });
    
    // Formular Absenden
    gutscheinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('📝 Gutschein-Bestellung wird gesendet...');
        
        // Formulardaten sammeln
        const formData = new FormData(this);
        const gutscheinData = Object.fromEntries(formData.entries());
        
        // Gutschein-Betrag bestimmen
        if (gutscheinData.gutscheinTyp === 'betrag') {
            if (gutscheinData.gutscheinBetrag === 'custom') {
                gutscheinData.finalerBetrag = gutscheinData.customBetrag;
                gutscheinData.beschreibung = `Wertgutschein ${gutscheinData.customBetrag}€`;
            } else {
                gutscheinData.finalerBetrag = gutscheinData.gutscheinBetrag;
                const betragTexte = {
                    '25': 'Kleine Freude',
                    '50': 'Alpaka-Kennenlern-Tour',
                    '75': 'Entspannte Wanderung',
                    '100': 'Premium-Erlebnis',
                    '150': 'Komplettes Alpaka-Abenteuer'
                };
                gutscheinData.beschreibung = `Wertgutschein ${gutscheinData.gutscheinBetrag}€ - ${betragTexte[gutscheinData.gutscheinBetrag]}`;
            }
        } else {
            // Tour-Gutschein
            const tourPreise = {
                'kennenlern-tour': 45,
                'entspannte-wanderung': 65,
                'natur-abenteuer': 85,
                'sonnenuntergang': 75
            };
            gutscheinData.finalerBetrag = tourPreise[gutscheinData.gutscheinTour];
            gutscheinData.beschreibung = `Tour-Gutschein: ${document.querySelector(`option[value="${gutscheinData.gutscheinTour}"]`).textContent}`;
        }
        
        // Validierung
        if (!validateGutscheinForm(gutscheinData)) {
            return;
        }
        
        // Button deaktivieren während des Sendens
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '📨 Wird gesendet...';
        
        try {
            // An Server senden
            const response = await fetch('/api/gutschein-bestellung', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gutscheinData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Gutschein-Bestellung erfolgreich gesendet:', result);
                
                // Erfolg anzeigen
                showSuccessMessage('🎉 Ihre Gutschein-Bestellung wurde erfolgreich gesendet! Sie erhalten in Kürze eine Bestätigung per E-Mail.');
                
                // Formular zurücksetzen
                this.reset();
                resetFormVisibility();
                
            } else {
                throw new Error('Server-Fehler beim Senden der Bestellung');
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Senden der Gutschein-Bestellung:', error);
            showErrorMessage('❌ Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.');
        } finally {
            // Button wieder aktivieren
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Formular-Validierung
function validateGutscheinForm(data) {
    const errors = [];
    
    // Pflichtfelder prüfen
    if (!data.kaeuferVorname || !data.kaeuferNachname || !data.kaeuferEmail) {
        errors.push('Bitte füllen Sie alle Käufer-Pflichtfelder aus.');
    }
    
    if (!data.versandStrasse || !data.versandPlz || !data.versandOrt) {
        errors.push('Bitte füllen Sie alle Versand-Pflichtfelder aus.');
    }
    
    // E-Mail validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.kaeuferEmail)) {
        errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    }
    
    // Geschenk-Validierung
    if (data.empfaengerTyp === 'geschenk') {
        if (!data.empfaengerVorname || !data.empfaengerNachname) {
            errors.push('Bitte geben Sie den Namen des Beschenkten ein.');
        }
    }
    
    // Betrag validieren
    if (data.gutscheinTyp === 'betrag' && data.gutscheinBetrag === 'custom') {
        const betrag = parseFloat(data.customBetrag);
        if (!betrag || betrag < 10 || betrag > 500) {
            errors.push('Der Gutschein-Betrag muss zwischen 10€ und 500€ liegen.');
        }
    }
    
    if (errors.length > 0) {
        showErrorMessage('Bitte korrigieren Sie folgende Fehler:\n• ' + errors.join('\n• '));
        return false;
    }
    
    return true;
}

// Formular-Sichtbarkeit zurücksetzen
function resetFormVisibility() {
    document.getElementById('customBetragGruppe').style.display = 'none';
    document.getElementById('empfaengerDaten').style.display = 'none';
    document.getElementById('betragGruppe').style.display = 'block';
    document.getElementById('tourGruppe').style.display = 'none';
}

// Erfolgs-Nachricht anzeigen
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            document.body.removeChild(alertDiv);
        }
    }, 5000);
}

// Fehler-Nachricht anzeigen
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-error';
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
        white-space: pre-line;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            document.body.removeChild(alertDiv);
        }
    }, 7000);
}

// Mobile Navigation
function initMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
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