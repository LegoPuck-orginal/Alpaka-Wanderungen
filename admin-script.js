// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialisierung
  initializeAdmin();
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000); // Aktualisiere Zeit jede Minute
  
  // Event Listeners
  setupEventListeners();
  
  // Load initial content
  loadDashboard();
  loadContactRequests();
  loadBookings();
  
  // Dark Mode aus localStorage laden
  loadDarkModePreference();
});

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

function loadDashboard() {
  // Update Stats
  updateStatCards();
  updateRecentActivity();
}

function updateStatCards() {
  const stats = demoStats.today;
  const changes = demoStats.changes;
  
  // Update stat numbers and changes
  const statElements = document.querySelectorAll('.stat-card');
  if (statElements.length >= 4) {
    // Neue Anfragen
    statElements[0].querySelector('.stat-number').textContent = stats.requests;
    statElements[0].querySelector('.stat-change').textContent = `+${changes.requests}%`;
    
    // Buchungen
    statElements[1].querySelector('.stat-number').textContent = stats.bookings;
    statElements[1].querySelector('.stat-change').textContent = `+${changes.bookings}%`;
    
    // Umsatz
    statElements[2].querySelector('.stat-number').textContent = `${stats.revenue.toLocaleString('de-DE')}€`;
    statElements[2].querySelector('.stat-change').textContent = `+${changes.revenue}%`;
    
    // Bewertung
    statElements[3].querySelector('.stat-number').textContent = stats.rating;
    statElements[3].querySelector('.stat-change').textContent = `±${changes.rating}%`;
  }
}

function updateRecentActivity() {
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;
  
  activityList.innerHTML = '';
  
  demoActivities.slice(0, 5).forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-desc">${activity.description}</div>
        <div class="activity-time">${timeAgo(activity.timestamp)}</div>
      </div>
    `;
    activityList.appendChild(activityItem);
  });
}

function loadContactRequests() {
  const container = document.querySelector('.requests-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Update unread count
  const unreadCount = demoRequests.filter(req => req.unread).length;
  const badge = document.getElementById('unread-count');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline' : 'none';
  }
  
  // Sort requests by timestamp (newest first)
  const sortedRequests = [...demoRequests].sort((a, b) => b.timestamp - a.timestamp);
  
  sortedRequests.forEach(request => {
    const card = createRequestCard(request);
    container.appendChild(card);
  });
}

function createRequestCard(request) {
  const card = document.createElement('div');
  card.className = `request-card ${request.unread ? 'unread' : ''}`;
  card.setAttribute('data-id', request.id);
  
  card.innerHTML = `
    <div class="request-header">
      <div class="request-info">
        <div class="request-name">${request.vorname} ${request.nachname}</div>
        <div class="request-email">${request.email}</div>
      </div>
      <div class="request-status ${request.status}">${statusTranslations[request.status]}</div>
    </div>
    
    <div class="request-details">
      <div class="detail-item">
        <div class="detail-label">Telefon</div>
        <div class="detail-value">${request.telefon}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Wunschtermin</div>
        <div class="detail-value">${formatDate(new Date(request.tag))} um ${request.zeit}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Teilnehmer</div>
        <div class="detail-value">${request.personen} Person${request.personen !== 1 ? 'en' : ''}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Eingegangen</div>
        <div class="detail-value">${timeAgo(request.timestamp)}</div>
      </div>
    </div>
    
    ${request.extras ? `
      <div class="request-message">
        "${request.extras}"
      </div>
    ` : ''}
    
    <div class="request-actions">
      <button class="action-btn-sm action-btn-primary" onclick="openRequestModal(${request.id})">
        Details anzeigen
      </button>
      <button class="action-btn-sm action-btn-secondary" onclick="markAsRead(${request.id})">
        ${request.unread ? 'Als gelesen markieren' : 'Gelesen'}
      </button>
      <button class="action-btn-sm action-btn-secondary" onclick="respondToRequest(${request.id})">
        Antworten
      </button>
    </div>
  `;
  
  return card;
}

function openRequestModal(requestId) {
  const request = demoRequests.find(r => r.id === requestId);
  if (!request) return;
  
  const modal = document.getElementById('request-modal');
  const modalBody = document.getElementById('modal-body');
  
  modalBody.innerHTML = `
    <div class="modal-request-details">
      <h4>${request.vorname} ${request.nachname}</h4>
      <p><strong>E-Mail:</strong> ${request.email}</p>
      <p><strong>Telefon:</strong> ${request.telefon}</p>
      <p><strong>Wunschtermin:</strong> ${formatDate(new Date(request.tag))} um ${request.zeit}</p>
      <p><strong>Teilnehmer:</strong> ${request.personen} Person${request.personen !== 1 ? 'en' : ''}</p>
      <p><strong>Status:</strong> ${statusTranslations[request.status]}</p>
      <p><strong>Eingegangen:</strong> ${formatDateTime(request.timestamp)}</p>
      ${request.extras ? `
        <div style="margin-top: 16px;">
          <strong>Weitere Angaben:</strong>
          <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; margin-top: 8px; font-style: italic;">
            "${request.extras}"
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  modal.classList.add('show');
  
  // Mark as read when opening
  if (request.unread) {
    markAsRead(requestId);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
}

function markAsRead(requestId) {
  const request = demoRequests.find(r => r.id === requestId);
  if (request) {
    request.unread = false;
    loadContactRequests(); // Refresh the view
    showToast('success', 'Markiert', 'Anfrage als gelesen markiert');
  }
}

function markAllRead() {
  demoRequests.forEach(request => {
    request.unread = false;
  });
  loadContactRequests();
  showToast('success', 'Erledigt', 'Alle Anfragen als gelesen markiert');
}

function respondToRequest(requestId) {
  const request = demoRequests.find(r => r.id === requestId);
  if (!request) return;
  
  // Hier würde normalerweise ein E-Mail-Client oder ein Antwort-Modal geöffnet
  const emailSubject = encodeURIComponent(`Re: Alpaka-Tour Anfrage vom ${formatDate(request.timestamp)}`);
  const emailBody = encodeURIComponent(`Hallo ${request.vorname},\n\nvielen Dank für Ihre Anfrage zu unseren Alpaka-Wanderungen.\n\n...`);
  
  window.open(`mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`);
  
  // Update status
  request.status = 'in-progress';
  if (request.unread) {
    request.unread = false;
  }
  
  loadContactRequests();
  showToast('success', 'E-Mail geöffnet', 'Antwort-E-Mail wurde vorbereitet');
}

function filterRequests() {
  const statusFilter = document.getElementById('status-filter')?.value || 'all';
  const dateFilter = document.getElementById('date-filter')?.value || 'all';
  
  let filteredRequests = [...demoRequests];
  
  // Status Filter
  if (statusFilter !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
  }
  
  // Date Filter
  if (dateFilter !== 'all') {
    const now = new Date();
    filteredRequests = filteredRequests.filter(req => {
      const requestDate = req.timestamp;
      switch(dateFilter) {
        case 'today':
          return requestDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return requestDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return requestDate >= monthAgo;
        default:
          return true;
      }
    });
  }
  
  // Update display
  const container = document.querySelector('.requests-container');
  if (container) {
    container.innerHTML = '';
    filteredRequests.sort((a, b) => b.timestamp - a.timestamp).forEach(request => {
      const card = createRequestCard(request);
      container.appendChild(card);
    });
  }
}

let currentDate = new Date();

function loadBookings() {
  updateCalendar();
  updateTodayBookings();
}

function updateCalendar() {
  const calendar = document.getElementById('calendar');
  const currentMonthElement = document.getElementById('current-month');
  
  if (!calendar || !currentMonthElement) return;
  
  // Update month display
  currentMonthElement.textContent = new Intl.DateTimeFormat('de-DE', { 
    month: 'long', 
    year: 'numeric' 
  }).format(currentDate);
  
  // Clear calendar
  calendar.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = day;
    header.style.cssText = `
      background-color: var(--bg-tertiary);
      color: var(--text-muted);
      font-weight: 600;
      padding: 12px 8px;
      text-align: center;
      font-size: 14px;
    `;
    calendar.appendChild(header);
  });
  
  // Get first day of month and number of days
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  
  // Adjust to Monday start (getDay() returns 0 for Sunday, 1 for Monday, etc.)
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
  startDate.setDate(firstDay.getDate() - dayOfWeek);
  
  // Generate calendar days
  const today = new Date();
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = date.toDateString() === today.toDateString();
    const hasBooking = demoBookings.some(booking => 
      booking.date === date.toISOString().split('T')[0]
    );
    
    if (!isCurrentMonth) {
      dayElement.style.opacity = '0.3';
    }
    
    if (isToday) {
      dayElement.classList.add('today');
    }
    
    if (hasBooking) {
      dayElement.classList.add('has-booking');
    }
    
    dayElement.innerHTML = `
      <span>${date.getDate()}</span>
      ${hasBooking ? '<div class="booking-indicator"></div>' : ''}
    `;
    
    calendar.appendChild(dayElement);
  }
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  updateCalendar();
}

function updateTodayBookings() {
  const bookingItems = document.querySelector('.booking-items');
  if (!bookingItems) return;
  
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = demoBookings.filter(booking => booking.date === today);
  
  bookingItems.innerHTML = '';
  
  if (todayBookings.length === 0) {
    bookingItems.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 24px;">Keine Buchungen für heute</p>';
    return;
  }
  
  todayBookings.forEach(booking => {
    const bookingElement = document.createElement('div');
    bookingElement.className = 'booking-item';
    bookingElement.style.cssText = `
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    bookingElement.innerHTML = `
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">${booking.time} - ${booking.customers}</div>
        <div style="color: var(--text-secondary); font-size: 14px;">${booking.persons} Person${booking.persons !== 1 ? 'en' : ''} • ${booking.revenue}€</div>
      </div>
      <div class="booking-status ${booking.status}" style="
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        text-transform: uppercase;
        ${booking.status === 'confirmed' ? 'background-color: #D1FAE5; color: #059669;' : 'background-color: #FEF3C7; color: #D97706;'}
      ">
        ${booking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
      </div>
    `;
    
    bookingItems.appendChild(bookingElement);
  });
}

function loadStatistics() {
  // Hier würden normalerweise Charts geladen werden
  showToast('info', 'Statistiken', 'Chart-Funktionalität in Entwicklung');
}

function refreshCurrentSection() {
  const activeSection = document.querySelector('.content-section.active');
  if (!activeSection) return;
  
  const sectionId = activeSection.id;
  
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
    case 'statistiken':
      loadStatistics();
      break;
  }
  
  showToast('success', 'Aktualisiert', 'Daten wurden erfolgreich aktualisiert');
}

function exportData() {
  // Demo export functionality
  const data = {
    requests: demoRequests,
    bookings: demoBookings,
    stats: demoStats,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpaka-admin-export-${formatDate(new Date()).replace(/\./g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('success', 'Export', 'Daten wurden erfolgreich exportiert');
}

function addBooking() {
  showToast('info', 'Neue Buchung', 'Buchungsfunktion in Entwicklung');
}

function sendNewsletter() {
  showToast('info', 'Newsletter', 'Newsletter-Funktion in Entwicklung');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  const button = document.getElementById('dark-mode-toggle');
  
  if (button) {
    button.querySelector('.btn-icon').textContent = isDark ? '☀️' : '🌙';
    button.title = isDark ? 'Light Mode' : 'Dark Mode';
  }
  
  // Save preference
  localStorage.setItem('admin-dark-mode', isDark);
  
  showToast('success', 'Design', `${isDark ? 'Dunkler' : 'Heller'} Modus aktiviert`);
}

function loadDarkModePreference() {
  const savedMode = localStorage.getItem('admin-dark-mode');
  const button = document.getElementById('dark-mode-toggle');
  
  if (savedMode === 'true') {
    document.body.classList.add('dark');
    if (button) {
      button.querySelector('.btn-icon').textContent = '☀️';
      button.title = 'Light Mode';
    }
  }
}

function showToast(type, title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (container.contains(toast)) {
      toast.style.animation = 'slideInFromRight 0.3s ease reverse';
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
}
