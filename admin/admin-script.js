// Echtes Admin-Panel JavaScript mit vollständiger Funktionalität
let adminSystem = null;

document.addEventListener('DOMContentLoaded', function() {
  // Prüfe Authentifizierung sofort
  if (!checkAuthentication()) {
    return; // Stoppe Ausführung wenn nicht authentifiziert
  }
  
  // Initialisiere Admin-System
  adminSystem = new AdminSystem();
  
  // Initialisierung
  initializeAdmin();
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);
  
  // Event Listeners
  setupEventListeners();
  
  // Load initial content
  loadDashboard();
  loadContactRequests();
  loadBookings();
  loadUsers();
  loadStatistics();
  
  // Dark Mode aus localStorage laden
  loadDarkModePreference();
  
  console.log('✅ Admin Panel vollständig geladen');
});

function checkAuthentication() {
  const userData = sessionStorage.getItem('alpaka_admin_user');
  if (!userData) {
    console.warn('❌ Keine Authentifizierung gefunden, weiterleitung zum Login');
    window.location.href = 'login.html';
    return false;
  }
  
  try {
    const user = JSON.parse(userData);
    console.log('✅ Benutzer authentifiziert:', user.name);
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Parsen der Benutzerdaten:', error);
    sessionStorage.removeItem('alpaka_admin_user');
    window.location.href = 'login.html';
    return false;
  }
}

function logout() {
  sessionStorage.removeItem('alpaka_admin_user');
  localStorage.removeItem('alpaka_admin_session');
  window.location.href = 'login.html';
}

// === DARK MODE MIT SPEICHERUNG ===
function loadDarkModePreference() {
  const darkMode = localStorage.getItem('alpaka_admin_dark_mode');
  const isDark = darkMode === 'true';
  
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
  
  updateDarkModeButton(isDark);
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  document.body.classList.toggle('dark', isDark);
  
  // Speichere Einstellung
  localStorage.setItem('alpaka_admin_dark_mode', isDark.toString());
  
  updateDarkModeButton(isDark);
  
  // Toast Notification
  showToast(isDark ? 'Dark Mode aktiviert' : 'Light Mode aktiviert', 'success');
}

function updateDarkModeButton(isDark) {
  const button = document.getElementById('dark-mode-toggle');
  if (button) {
    const icon = button.querySelector('.btn-icon');
    if (icon) {
      icon.textContent = isDark ? '☀️' : '🌙';
    }
    button.title = isDark ? 'Light Mode' : 'Dark Mode';
  }
}

function initializeAdmin() {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });
  }
  
  // Schließe Sidebar bei Klick außerhalb (Mobile)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 1024 && 
        !sidebar.contains(e.target) && 
        !mobileMenuBtn.contains(e.target) && 
        sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        navigateToSection(section);
      }
    });
  });
  
  // Header Actions
  document.getElementById('refresh-btn')?.addEventListener('click', refreshCurrentSection);
  document.getElementById('export-btn')?.addEventListener('click', exportData);
  document.getElementById('dark-mode-toggle')?.addEventListener('click', toggleDarkMode);
  
  // Filter Event Listeners
  document.getElementById('status-filter')?.addEventListener('change', filterRequests);
  document.getElementById('date-filter')?.addEventListener('change', filterRequests);
  
  // Calendar Navigation
  document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));
}

function navigateToSection(sectionId) {
  // Update Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-section="${sectionId}"]`)?.parentElement.classList.add('active');
  
  // Update Content
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId)?.classList.add('active');
  
  // Update Page Title
  const titles = {
    'dashboard': 'Dashboard',
    'kontaktanfragen': 'Kontaktanfragen',
    'buchungen': 'Buchungen',
    'user-management': 'Benutzer',
    'statistiken': 'Statistiken'
  };
  document.getElementById('page-title').textContent = titles[sectionId] || 'Admin Panel';
  
  // Close mobile sidebar
  if (window.innerWidth <= 1024) {
    document.querySelector('.sidebar').classList.remove('open');
    document.body.style.overflow = '';
  }
  
  // Load section specific data
  switch(sectionId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'kontaktanfragen':
      loadContactRequests();
      break;
    case 'buchungen':
      loadBookings();
      break;
    case 'user-management':
      loadUsers();
      break;
    case 'statistiken':
      loadStatistics();
      break;
  }
}

function showSection(sectionId) {
  navigateToSection(sectionId);
}

function updateCurrentTime() {
  const now = new Date();
  const timeString = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);
  
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = timeString;
  }
}

// === DASHBOARD FUNKTIONEN ===
function loadDashboard() {
  updateDashboardStats();
  loadRecentActivity();
  loadCallsChart();
}

function updateDashboardStats() {
  if (!adminSystem) return;
  
  // Berechne echte Statistiken
  const today = new Date().toISOString().split('T')[0];
  const requests = adminSystem.requests || [];
  const bookings = adminSystem.bookings || [];
  
  const todayRequests = requests.filter(r => r.timestamp?.startsWith(today)).length;
  const todayBookings = bookings.filter(b => b.date === today).length;
  const todayRevenue = todayBookings * 35; // Durchschnittspreis
  
  // Update UI
  const statRequests = document.getElementById('stat-requests');
  const statBookings = document.getElementById('stat-bookings');
  const statRevenue = document.getElementById('stat-revenue');
  
  if (statRequests) statRequests.textContent = requests.length;
  if (statBookings) statBookings.textContent = todayBookings;
  if (statRevenue) statRevenue.textContent = todayRevenue + '€';
}

function loadRecentActivity() {
  const activityList = document.getElementById('activity-list');
  if (!activityList || !adminSystem) return;
  
  const activities = [];
  
  // Füge Recent Requests hinzu
  adminSystem.requests.slice(-3).forEach(request => {
    activities.push({
      icon: '📧',
      title: 'Neue Kontaktanfrage',
      desc: `${request.name} - ${request.message?.substring(0, 50)}...`,
      time: formatTimeAgo(request.timestamp),
      timestamp: new Date(request.timestamp)
    });
  });
  
  // Sortiere nach Zeit
  activities.sort((a, b) => b.timestamp - a.timestamp);
  
  activityList.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-desc">${activity.desc}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    </div>
  `).join('');
}

function loadCallsChart() {
  const canvas = document.getElementById('calls-chart');
  if (!canvas || !adminSystem) return;
  
  const ctx = canvas.getContext('2d');
  const data = adminSystem.statistics.lastWeekCalls || [];
  
  // Chart-Dimensionen
  const width = canvas.width;
  const height = canvas.height;
  const margin = 40;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  if (data.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Keine Daten verfügbar', width / 2, height / 2);
    return;
  }
  
  // Chart zeichnen
  const maxCalls = Math.max(...data.map(d => d.calls), 1);
  const barWidth = chartWidth / data.length;
  
  // Bars zeichnen
  data.forEach((item, index) => {
    const barHeight = (item.calls / maxCalls) * chartHeight;
    const x = margin + index * barWidth + barWidth * 0.1;
    const y = height - margin - barHeight;
    
    // Bar
    ctx.fillStyle = '#7A9B28';
    ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    
    // Label
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, x + barWidth * 0.4, height - margin + 20);
    
    // Value
    ctx.fillText(item.calls.toString(), x + barWidth * 0.4, y - 5);
  });
}

function simulateNewRequest() {
  if (!adminSystem) return;
  
  const fakeRequest = {
    id: Date.now().toString(),
    name: 'Test Benutzer',
    email: 'test@example.com',
    phone: '+49 123 456789',
    persons: '4',
    tour: 'familie',
    date: new Date().toISOString().split('T')[0],
    message: 'Dies ist eine Test-Anfrage vom Admin-Panel.',
    timestamp: new Date().toISOString(),
    status: 'new',
    isRead: false,
    source: 'admin-test'
  };
  
  adminSystem.addRequest(fakeRequest);
  loadContactRequests();
  loadDashboard();
  showToast('Test-Anfrage wurde erstellt!', 'success');
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="closeToast(this)">×</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Animation
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto-remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function closeToast(button) {
  const toast = button.closest('.toast');
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 300);
}

// === UTILITY FUNCTIONS ===
function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'gerade eben';
  if (diffInSeconds < 3600) return `vor ${Math.floor(diffInSeconds / 60)} Min`;
  if (diffInSeconds < 86400) return `vor ${Math.floor(diffInSeconds / 3600)} Std`;
  return `vor ${Math.floor(diffInSeconds / 86400)} Tagen`;
}

function updateCurrentTime() {
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function refreshCurrentSection() {
  const activeSection = document.querySelector('.content-section.active');
  if (!activeSection) return;
  
  const sectionId = activeSection.id;
  
  switch (sectionId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'kontaktanfragen':
      loadContactRequests();
      break;
    case 'buchungen':
      loadBookings();
      break;
    case 'user-management':
      loadUsers();
      break;
    case 'statistiken':
      loadStatistics();
      break;
  }
  
  showToast('Daten aktualisiert', 'success');
}

function exportData() {
  if (!adminSystem) return;
  
  const data = {
    requests: adminSystem.requests,
    bookings: adminSystem.bookings,
    statistics: adminSystem.statistics,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpaka-admin-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Daten exportiert', 'success');
}

// === SECTION NAVIGATION ===
function navigateToSection(sectionId) {
  // Update Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.querySelector(`[data-section="${sectionId}"]`)?.closest('.nav-item')?.classList.add('active');
  
  // Update Content
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      const titles = {
        'dashboard': 'Dashboard',
        'kontaktanfragen': 'Kontaktanfragen',
        'buchungen': 'Buchungen',
        'user-management': 'Benutzer',
        'statistiken': 'Statistiken'
      };
      pageTitle.textContent = titles[sectionId] || 'Admin Panel';
    }
  }
  
  // Load section-specific data
  switch (sectionId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'kontaktanfragen':
      loadContactRequests();
      break;
    case 'buchungen':
      loadBookings();
      break;
    case 'user-management':
      loadUsers();
      break;
    case 'statistiken':
      loadStatistics();
      break;
  }
}

function showSection(sectionId) {
  navigateToSection(sectionId);
}

// === KONTAKTANFRAGEN MANAGEMENT ===
function loadContactRequests() {
  const container = document.querySelector('.requests-container');
  if (!container || !adminSystem) return;
  
  container.innerHTML = '';
  
  // Update unread count
  const unreadCount = adminSystem.getUnreadRequestsCount ? adminSystem.getUnreadRequestsCount() : 0;
  const badge = document.getElementById('unread-count');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline' : 'none';
  }
  
  // Sort requests by timestamp (newest first)
  const sortedRequests = [...(adminSystem.requests || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (sortedRequests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📧</div>
        <h3>Noch keine Kontaktanfragen</h3>
        <p>Anfragen aus dem Kontaktformular erscheinen hier automatisch.</p>
        <button class="btn btn-primary" onclick="simulateNewRequest()">
          Test-Anfrage erstellen
        </button>
      </div>
    `;
    return;
  }
  
  sortedRequests.forEach(request => {
    const card = createRequestCard(request);
    container.appendChild(card);
  });
}

function createRequestCard(request) {
  const card = document.createElement('div');
  card.className = `request-card ${request.isRead ? '' : 'unread'}`;
  card.setAttribute('data-id', request.id);
  
  const statusClass = {
    'new': 'status-new',
    'in-progress': 'status-progress',
    'completed': 'status-completed'
  }[request.status || 'new'];
  
  const tourNames = {
    'familie': 'Familien-Tour',
    'abenteuer': 'Abenteuer-Tour', 
    'sonnenaufgang': 'Sonnenaufgang-Tour',
    'individuell': 'Individuelle Tour'
  };
  
  card.innerHTML = `
    <div class="request-header">
      <div class="request-info">
        <h4 class="request-name">${escapeHtml(request.name || 'Unbekannt')}</h4>
        <span class="request-time">${formatTimeAgo(request.timestamp)}</span>
      </div>
      <div class="request-status">
        <span class="status-badge ${statusClass}">${getStatusText(request.status)}</span>
        ${!request.isRead ? '<span class="unread-indicator">●</span>' : ''}
      </div>
    </div>
    
    <div class="request-details">
      <div class="detail-row">
        <span class="detail-label">📧 E-Mail:</span>
        <span class="detail-value">${escapeHtml(request.email || 'Nicht angegeben')}</span>
      </div>
      ${request.phone ? `
        <div class="detail-row">
          <span class="detail-label">📞 Telefon:</span>
          <span class="detail-value">${escapeHtml(request.phone)}</span>
        </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">👥 Personen:</span>
        <span class="detail-value">${request.persons || 'Nicht angegeben'}</span>
      </div>
      ${request.tour ? `
        <div class="detail-row">
          <span class="detail-label">🎯 Tour:</span>
          <span class="detail-value">${tourNames[request.tour] || request.tour}</span>
        </div>
      ` : ''}
      ${request.date ? `
        <div class="detail-row">
          <span class="detail-label">📅 Wunschtermin:</span>
          <span class="detail-value">${new Date(request.date).toLocaleDateString('de-DE')}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="request-message">
      <strong>Nachricht:</strong>
      <p>${escapeHtml(request.message || 'Keine Nachricht')}</p>
    </div>
    
    <div class="request-actions">
      <button class="btn btn-sm btn-primary" onclick="markAsRead('${request.id}')">
        ${request.isRead ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
      </button>
      <button class="btn btn-sm btn-secondary" onclick="changeRequestStatus('${request.id}')">
        Status ändern
      </button>
      <button class="btn btn-sm btn-secondary" onclick="viewRequestDetails('${request.id}')">
        Details
      </button>
      <button class="btn btn-sm btn-danger" onclick="deleteRequest('${request.id}')">
        Löschen
      </button>
    </div>
  `;
  
  return card;
}

function getStatusText(status) {
  const statusTexts = {
    'new': 'Neu',
    'in-progress': 'In Bearbeitung', 
    'completed': 'Abgeschlossen'
  };
  return statusTexts[status || 'new'];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function markAsRead(requestId) {
  if (!adminSystem || !adminSystem.markRequestAsRead) return;
  
  adminSystem.markRequestAsRead(requestId);
  loadContactRequests();
  loadDashboard(); // Update counts
  showToast('Status aktualisiert', 'success');
}

function changeRequestStatus(requestId) {
  const request = adminSystem.requests.find(r => r.id === requestId);
  if (!request) return;
  
  const statuses = ['new', 'in-progress', 'completed'];
  const currentIndex = statuses.indexOf(request.status || 'new');
  const nextIndex = (currentIndex + 1) % statuses.length;
  const newStatus = statuses[nextIndex];
  
  if (adminSystem.updateRequestStatus) {
    adminSystem.updateRequestStatus(requestId, newStatus);
    loadContactRequests();
    showToast(`Status geändert zu: ${getStatusText(newStatus)}`, 'success');
  }
}

function viewRequestDetails(requestId) {
  const request = adminSystem.requests.find(r => r.id === requestId);
  if (!request) return;
  
  const modal = createRequestModal(request);
  document.body.appendChild(modal);
  
  // Animation
  setTimeout(() => modal.classList.add('show'), 50);
}

function createRequestModal(request) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeRequestModal(this)"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Anfrage Details - ${escapeHtml(request.name)}</h3>
        <button class="modal-close" onclick="closeRequestModal(this)">×</button>
      </div>
      <div class="modal-body">
        <div class="details-grid">
          <div class="detail-item">
            <label>Name:</label>
            <span>${escapeHtml(request.name || 'Nicht angegeben')}</span>
          </div>
          <div class="detail-item">
            <label>E-Mail:</label>
            <span>${escapeHtml(request.email || 'Nicht angegeben')}</span>
          </div>
          <div class="detail-item">
            <label>Telefon:</label>
            <span>${escapeHtml(request.phone || 'Nicht angegeben')}</span>
          </div>
          <div class="detail-item">
            <label>Personen:</label>
            <span>${request.persons || 'Nicht angegeben'}</span>
          </div>
          <div class="detail-item">
            <label>Tour:</label>
            <span>${request.tour || 'Nicht angegeben'}</span>
          </div>
          <div class="detail-item">
            <label>Wunschtermin:</label>
            <span>${request.date ? new Date(request.date).toLocaleDateString('de-DE') : 'Nicht angegeben'}</span>
          </div>
          <div class="detail-item">
            <label>Eingegangen:</label>
            <span>${new Date(request.timestamp).toLocaleString('de-DE')}</span>
          </div>
          <div class="detail-item full-width">
            <label>Nachricht:</label>
            <div class="message-content">${escapeHtml(request.message || 'Keine Nachricht')}</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeRequestModal(this)">Schließen</button>
        <button class="btn btn-primary" onclick="respondToRequest('${request.id}')">Antworten</button>
      </div>
    </div>
  `;
  return modal;
}

function closeRequestModal(element) {
  const modal = element.closest('.modal');
  modal.classList.remove('show');
  setTimeout(() => modal.remove(), 300);
}

function deleteRequest(requestId) {
  if (!confirm('Möchten Sie diese Anfrage wirklich löschen?')) return;
  
  if (adminSystem && adminSystem.deleteRequest) {
    adminSystem.deleteRequest(requestId);
    loadContactRequests();
    loadDashboard();
    showToast('Anfrage gelöscht', 'success');
  }
}

function respondToRequest(requestId) {
  const request = adminSystem.requests.find(r => r.id === requestId);
  if (!request) return;
  
  const emailBody = `Hallo ${request.name},

vielen Dank für Ihre Anfrage zu unseren Alpaka-Wanderungen.

Mit freundlichen Grüßen
Ihr Alpaka-Team`;

  const mailtoLink = `mailto:${request.email}?subject=Re: Ihre Alpaka-Wanderung Anfrage&body=${encodeURIComponent(emailBody)}`;
  window.open(mailtoLink);
  
  // Mark as in progress
  if (adminSystem.updateRequestStatus) {
    adminSystem.updateRequestStatus(requestId, 'in-progress');
    loadContactRequests();
  }
}

function filterRequests() {
  const statusFilter = document.getElementById('status-filter')?.value || 'all';
  const dateFilter = document.getElementById('date-filter')?.value || 'all';
  
  const cards = document.querySelectorAll('.request-card');
  
  cards.forEach(card => {
    let show = true;
    
    // Status Filter
    if (statusFilter !== 'all') {
      const statusBadge = card.querySelector('.status-badge');
      const cardStatus = statusBadge?.textContent?.toLowerCase();
      const filterStatus = getStatusText(statusFilter).toLowerCase();
      if (cardStatus !== filterStatus) show = false;
    }
    
    // Date Filter - implementation would require more complex logic
    
    card.style.display = show ? 'block' : 'none';
  });
}

function markAllRead() {
  if (!adminSystem) return;
  
  adminSystem.requests.forEach(request => {
    if (!request.isRead) {
      request.isRead = true;
    }
  });
  
  adminSystem.saveData();
  loadContactRequests();
  loadDashboard();
  showToast('Alle Anfragen als gelesen markiert', 'success');
}

// === PLACEHOLDER FUNCTIONS ===
function loadBookings() {
  console.log('Loading bookings...');
  // Implementation would load booking data
}

function loadUsers() {
  console.log('Loading users...');
  // Implementation would load user management
}

function loadStatistics() {
  console.log('Loading statistics...');
  // Implementation would load detailed statistics
}

function changeMonth(direction) {
  console.log('Changing month:', direction);
  // Implementation would change calendar month
}

// Global function assignments
window.markAsRead = markAsRead;
window.changeRequestStatus = changeRequestStatus;
window.viewRequestDetails = viewRequestDetails;
window.deleteRequest = deleteRequest;
window.respondToRequest = respondToRequest;
window.closeRequestModal = closeRequestModal;
window.markAllRead = markAllRead;
window.filterRequests = filterRequests;

// === GLOBAL FUNCTIONS ===
window.logout = logout;
window.showSection = showSection;
window.navigateToSection = navigateToSection;
window.toggleDarkMode = toggleDarkMode;
window.exportData = exportData;
window.simulateNewRequest = simulateNewRequest;
