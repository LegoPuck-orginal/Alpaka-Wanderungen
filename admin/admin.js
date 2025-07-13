// Admin Panel JavaScript
let authToken = localStorage.getItem('alpaka_admin_token');

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (authToken) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Authentication
function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    logoutBtn.style.display = 'none';
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    logoutBtn.style.display = 'block';
    loadStatistics();
    loadBookings();
    loadContacts();
    loadVouchers();
    loadDiscountCodes();
}

function logout() {
    localStorage.removeItem('alpaka_admin_token');
    authToken = null;
    showLogin();
}

// Login Form Handler
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const loginAlert = document.getElementById('loginAlert');
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('alpaka_admin_token', authToken);
            showDashboard();
            showAlert('loginAlert', 'Erfolgreich angemeldet!', 'success');
        } else {
            showAlert('loginAlert', data.error || 'Anmeldung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showAlert('loginAlert', 'Verbindungsfehler', 'error');
    }
});

// Tab Switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const stats = await response.json();
        
        if (response.ok) {
            document.getElementById('totalBookings').textContent = stats.totalBookings;
            document.getElementById('totalRevenue').textContent = stats.totalRevenue + '€';
            document.getElementById('totalVouchers').textContent = stats.totalVouchers;
            document.getElementById('totalDiscountCodes').textContent = stats.activeDiscountCodes;
            document.getElementById('totalContacts').textContent = stats.totalContacts;
            document.getElementById('newContacts').textContent = stats.newContacts;
        }
    } catch (error) {
        console.error('Statistics loading error:', error);
    }
}

// Bookings Management
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const bookings = await response.json();
        
        if (response.ok) {
            displayBookings(bookings);
        } else {
            showAlert('bookingsAlert', 'Fehler beim Laden der Buchungen', 'error');
        }
    } catch (error) {
        showAlert('bookingsAlert', 'Verbindungsfehler', 'error');
    }
}

function displayBookings(bookings) {
    const tableBody = document.getElementById('bookingsTable');
    
    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Keine Buchungen vorhanden</td></tr>';
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>${booking.id.substring(0, 8)}...</td>
            <td>${booking.name}</td>
            <td>${booking.email}</td>
            <td>${booking.tour}</td>
            <td>${new Date(booking.date).toLocaleDateString('de-DE')}</td>
            <td>${booking.participants}</td>
            <td>${booking.totalPrice}€</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <button class="btn btn-success" onclick="updateBookingStatus('${booking.id}', 'confirmed')">✓</button>
                <button class="btn btn-danger" onclick="updateBookingStatus('${booking.id}', 'cancelled')">✗</button>
                <button class="btn btn-danger" onclick="deleteBooking('${booking.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('bookingsAlert', 'Status erfolgreich aktualisiert!', 'success');
            loadBookings();
            loadStatistics();
        } else {
            showAlert('bookingsAlert', result.error || 'Fehler beim Aktualisieren', 'error');
        }
    } catch (error) {
        showAlert('bookingsAlert', 'Verbindungsfehler', 'error');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Buchung wirklich löschen?')) return;
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('bookingsAlert', 'Buchung erfolgreich gelöscht!', 'success');
            loadBookings();
            loadStatistics();
        } else {
            showAlert('bookingsAlert', result.error || 'Fehler beim Löschen', 'error');
        }
    } catch (error) {
        showAlert('bookingsAlert', 'Verbindungsfehler', 'error');
    }
}

function refreshBookings() {
    loadBookings();
    showAlert('bookingsAlert', 'Buchungen aktualisiert!', 'success');
}

// Vouchers Management
async function loadVouchers() {
    try {
        const response = await fetch('/api/vouchers', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const vouchers = await response.json();
        
        if (response.ok) {
            displayVouchers(vouchers);
        } else {
            showAlert('vouchersAlert', 'Fehler beim Laden der Gutscheine', 'error');
        }
    } catch (error) {
        showAlert('vouchersAlert', 'Verbindungsfehler', 'error');
    }
}

function displayVouchers(vouchers) {
    const tableBody = document.getElementById('vouchersTable');
    
    if (vouchers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Keine Gutscheine vorhanden</td></tr>';
        return;
    }
    
    tableBody.innerHTML = vouchers.map(voucher => `
        <tr>
            <td><strong>${voucher.code}</strong></td>
            <td>${voucher.value}€</td>
            <td>${voucher.description}</td>
            <td>${voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString('de-DE') : 'Unbegrenzt'}</td>
            <td><span class="status-badge ${voucher.isActive ? 'status-confirmed' : 'status-cancelled'}">${voucher.isActive ? 'Aktiv' : 'Inaktiv'}</span></td>
            <td><span class="status-badge ${voucher.isRedeemed ? 'status-pending' : 'status-confirmed'}">${voucher.isRedeemed ? 'Ja' : 'Nein'}</span></td>
            <td>
                <button class="btn btn-danger" onclick="deleteVoucher('${voucher.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function showCreateVoucherModal() {
    document.getElementById('voucherModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Voucher Form Handler
document.getElementById('voucherForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        value: document.getElementById('voucherValue').value,
        description: document.getElementById('voucherDescription').value,
        expiryDate: document.getElementById('voucherExpiry').value || null
    };
    
    try {
        const response = await fetch('/api/vouchers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('voucherModalAlert', `Gutschein erstellt! Code: ${result.voucher.code}`, 'success');
            document.getElementById('voucherForm').reset();
            loadVouchers();
            loadStatistics();
            setTimeout(() => closeModal('voucherModal'), 2000);
        } else {
            showAlert('voucherModalAlert', result.error || 'Fehler beim Erstellen', 'error');
        }
    } catch (error) {
        showAlert('voucherModalAlert', 'Verbindungsfehler', 'error');
    }
});

async function deleteVoucher(voucherId) {
    if (!confirm('Gutschein wirklich löschen?')) return;
    
    try {
        const response = await fetch(`/api/vouchers/${voucherId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('vouchersAlert', 'Gutschein erfolgreich gelöscht!', 'success');
            loadVouchers();
            loadStatistics();
        } else {
            showAlert('vouchersAlert', result.error || 'Fehler beim Löschen', 'error');
        }
    } catch (error) {
        showAlert('vouchersAlert', 'Verbindungsfehler', 'error');
    }
}

// Discount Codes Management
async function loadDiscountCodes() {
    try {
        const response = await fetch('/api/discount-codes', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const discountCodes = await response.json();
        
        if (response.ok) {
            displayDiscountCodes(discountCodes);
        } else {
            showAlert('discountsAlert', 'Fehler beim Laden der Rabattcodes', 'error');
        }
    } catch (error) {
        showAlert('discountsAlert', 'Verbindungsfehler', 'error');
    }
}

function displayDiscountCodes(codes) {
    const tableBody = document.getElementById('discountsTable');
    
    if (codes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Keine Rabattcodes vorhanden</td></tr>';
        return;
    }
    
    tableBody.innerHTML = codes.map(code => `
        <tr>
            <td><strong>${code.code}</strong></td>
            <td>${code.value}${code.type === 'percentage' ? '%' : '€'}</td>
            <td>${code.type === 'percentage' ? 'Prozent' : 'Fest'}</td>
            <td>${code.description}</td>
            <td>${code.usedCount || 0}</td>
            <td>${code.usageLimit || '∞'}</td>
            <td>${code.expiryDate ? new Date(code.expiryDate).toLocaleDateString('de-DE') : 'Unbegrenzt'}</td>
            <td><span class="status-badge ${code.isActive ? 'status-confirmed' : 'status-cancelled'}">${code.isActive ? 'Aktiv' : 'Inaktiv'}</span></td>
            <td>
                <button class="btn" onclick="toggleDiscountCode('${code.id}', ${!code.isActive})">
                    ${code.isActive ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <button class="btn btn-danger" onclick="deleteDiscountCode('${code.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function showCreateDiscountModal() {
    document.getElementById('discountModal').style.display = 'block';
}

// Discount Code Form Handler
document.getElementById('discountForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        code: document.getElementById('discountCode').value.toUpperCase(),
        type: document.getElementById('discountType').value,
        value: document.getElementById('discountValue').value,
        description: document.getElementById('discountDescription').value,
        usageLimit: document.getElementById('discountLimit').value || null,
        expiryDate: document.getElementById('discountExpiry').value || null
    };
    
    try {
        const response = await fetch('/api/discount-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('discountModalAlert', 'Rabattcode erfolgreich erstellt!', 'success');
            document.getElementById('discountForm').reset();
            loadDiscountCodes();
            loadStatistics();
            setTimeout(() => closeModal('discountModal'), 2000);
        } else {
            showAlert('discountModalAlert', result.error || 'Fehler beim Erstellen', 'error');
        }
    } catch (error) {
        showAlert('discountModalAlert', 'Verbindungsfehler', 'error');
    }
});

async function toggleDiscountCode(codeId, isActive) {
    try {
        const response = await fetch(`/api/discount-codes/${codeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ isActive })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('discountsAlert', `Code erfolgreich ${isActive ? 'aktiviert' : 'deaktiviert'}!`, 'success');
            loadDiscountCodes();
            loadStatistics();
        } else {
            showAlert('discountsAlert', result.error || 'Fehler beim Aktualisieren', 'error');
        }
    } catch (error) {
        showAlert('discountsAlert', 'Verbindungsfehler', 'error');
    }
}

async function deleteDiscountCode(codeId) {
    if (!confirm('Rabattcode wirklich löschen?')) return;
    
    try {
        const response = await fetch(`/api/discount-codes/${codeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('discountsAlert', 'Rabattcode erfolgreich gelöscht!', 'success');
            loadDiscountCodes();
            loadStatistics();
        } else {
            showAlert('discountsAlert', result.error || 'Fehler beim Löschen', 'error');
        }
    } catch (error) {
        showAlert('discountsAlert', 'Verbindungsfehler', 'error');
    }
}

// Utility Functions
function showAlert(elementId, message, type) {
    const alertElement = document.getElementById(elementId);
    alertElement.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    setTimeout(() => {
        alertElement.innerHTML = '';
    }, 5000);
}

// === KONTAKT MANAGEMENT ===
async function loadContacts() {
    try {
        const response = await fetch('/api/contacts', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to load contacts');
        
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
        showAlert('contactsAlert', 'Fehler beim Laden der Kontaktanfragen', 'error');
    }
}

function displayContacts(contacts) {
    const tbody = document.getElementById('contactsTable');
    tbody.innerHTML = '';
    
    contacts.forEach(contact => {
        const row = document.createElement('tr');
        
        const date = new Date(contact.timestamp).toLocaleDateString('de-DE');
        const statusBadge = getStatusBadge(contact.status, contact.replied);
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${contact.name}</td>
            <td><a href="mailto:${contact.email}">${contact.email}</a></td>
            <td>${contact.subject}</td>
            <td title="${contact.message}">${contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-success" onclick="markAsReplied('${contact.id}')" ${contact.replied ? 'disabled' : ''}>
                    ${contact.replied ? '✅ Beantwortet' : '📧 Als beantwortet markieren'}
                </button>
                <button class="btn btn-danger" onclick="deleteContact('${contact.id}')">🗑️ Löschen</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function getStatusBadge(status, replied) {
    if (replied) {
        return '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">✅ Beantwortet</span>';
    } else if (status === 'new') {
        return '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">🆕 Neu</span>';
    } else {
        return '<span style="background: #ffc107; color: black; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">📖 In Bearbeitung</span>';
    }
}

async function markAsReplied(contactId) {
    try {
        const response = await fetch(`/api/contacts/${contactId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ replied: true, status: 'completed' })
        });
        
        if (!response.ok) throw new Error('Failed to update contact');
        
        showAlert('contactsAlert', 'Kontaktanfrage als beantwortet markiert', 'success');
        loadContacts();
        loadStatistics();
    } catch (error) {
        console.error('Error updating contact:', error);
        showAlert('contactsAlert', 'Fehler beim Aktualisieren der Kontaktanfrage', 'error');
    }
}

async function deleteContact(contactId) {
    if (!confirm('Möchten Sie diese Kontaktanfrage wirklich löschen?')) return;
    
    try {
        const response = await fetch(`/api/contacts/${contactId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) throw new Error('Failed to delete contact');
        
        showAlert('contactsAlert', 'Kontaktanfrage gelöscht', 'success');
        loadContacts();
        loadStatistics();
    } catch (error) {
        console.error('Error deleting contact:', error);
        showAlert('contactsAlert', 'Fehler beim Löschen der Kontaktanfrage', 'error');
    }
}

function refreshContacts() {
    loadContacts();
    showAlert('contactsAlert', 'Kontaktanfragen aktualisiert', 'success');
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});
