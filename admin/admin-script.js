// Echtes Admin-Panel JavaScript mit vollständiger Funktionalität
document.addEventListener('DOMContentLoaded', function() {
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

function loadDashboard() {
  updateStatCards();
  updateRecentActivity();
}

function updateStatCards() {
  const stats = adminSystem.getTodayStatistics();
  
  // Update stat numbers
  const statElements = document.querySelectorAll('.stat-card');
  if (statElements.length >= 4) {
    // Neue Anfragen
    statElements[0].querySelector('.stat-number').textContent = stats.unreadRequests;
    
    // Buchungen
    statElements[1].querySelector('.stat-number').textContent = stats.bookings;
    
    // Umsatz
    statElements[2].querySelector('.stat-number').textContent = `${stats.revenue.toLocaleString('de-DE')}€`;
    
    // Bewertung (statisch für Demo)
    statElements[3].querySelector('.stat-number').textContent = '4.9';
  }
}

function updateRecentActivity() {
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;
  
  activityList.innerHTML = '';
  
  // Zeige letzte 5 Anfragen als Aktivität
  const recentRequests = adminSystem.requests.slice(0, 3);
  
  recentRequests.forEach(request => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <div class="activity-icon">📧</div>
      <div class="activity-content">
        <div class="activity-title">Neue Kontaktanfrage</div>
        <div class="activity-desc">${request.vorname} ${request.nachname} - ${request.personen} Person${request.personen !== 1 ? 'en' : ''}</div>
        <div class="activity-time">${adminSystem.timeAgo(request.timestamp)}</div>
      </div>
    `;
    activityList.appendChild(activityItem);
  });
  
  // Falls keine Anfragen vorhanden
  if (recentRequests.length === 0) {
    activityList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 24px;">Noch keine Aktivitäten</p>';
  }
}

function loadContactRequests() {
  const container = document.querySelector('.requests-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Update unread count
  const unreadCount = adminSystem.getUnreadRequestsCount();
  const badge = document.getElementById('unread-count');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline' : 'none';
  }
  
  // Sort requests by timestamp (newest first)
  const sortedRequests = [...adminSystem.requests].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (sortedRequests.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 48px; font-size: 18px;">Noch keine Kontaktanfragen vorhanden.<br><br>📧 Anfragen aus dem Kontaktformular erscheinen hier automatisch.</p>';
    return;
  }
  
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
        <div class="detail-value">${adminSystem.formatDate(request.tag)} um ${request.zeit}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Teilnehmer</div>
        <div class="detail-value">${request.personen} Person${request.personen !== 1 ? 'en' : ''}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Eingegangen</div>
        <div class="detail-value">${adminSystem.timeAgo(request.timestamp)}</div>
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
  const request = adminSystem.requests.find(r => r.id === requestId);
  if (!request) return;
  
  const modal = document.getElementById('request-modal');
  const modalBody = document.getElementById('modal-body');
  
  modalBody.innerHTML = `
    <div class="modal-request-details">
      <h4>${request.vorname} ${request.nachname}</h4>
      <p><strong>E-Mail:</strong> ${request.email}</p>
      <p><strong>Telefon:</strong> ${request.telefon}</p>
      <p><strong>Wunschtermin:</strong> ${adminSystem.formatDate(request.tag)} um ${request.zeit}</p>
      <p><strong>Teilnehmer:</strong> ${request.personen} Person${request.personen !== 1 ? 'en' : ''}</p>
      <p><strong>Status:</strong> ${statusTranslations[request.status]}</p>
      <p><strong>Eingegangen:</strong> ${adminSystem.formatDateTime(request.timestamp)}</p>
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
  if (adminSystem.markRequestAsRead(requestId)) {
    loadContactRequests(); // Refresh the view
    showToast('success', 'Markiert', 'Anfrage als gelesen markiert');
  }
}

function markAllRead() {
  adminSystem.markAllRequestsAsRead();
  loadContactRequests();
  showToast('success', 'Erledigt', 'Alle Anfragen als gelesen markiert');
}

function respondToRequest(requestId) {
  const request = adminSystem.requests.find(r => r.id === requestId);
  if (!request) return;
  
  // Hier würde normalerweise ein E-Mail-Client oder ein Antwort-Modal geöffnet
  const emailSubject = encodeURIComponent(`Re: Alpaka-Tour Anfrage vom ${adminSystem.formatDate(request.timestamp)}`);
  const emailBody = encodeURIComponent(`Hallo ${request.vorname},\n\nvielen Dank für Ihre Anfrage zu unseren Alpaka-Wanderungen.\n\n...`);
  
  window.open(`mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`);
  
  // Update status
  adminSystem.updateRequestStatus(requestId, 'in-progress');
  loadContactRequests();
  showToast('success', 'E-Mail geöffnet', 'Antwort-E-Mail wurde vorbereitet');
}

function filterRequests() {
  const statusFilter = document.getElementById('status-filter')?.value || 'all';
  const dateFilter = document.getElementById('date-filter')?.value || 'all';
  
  let filteredRequests = [...adminSystem.requests];
  
  // Status Filter
  if (statusFilter !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
  }
  
  // Date Filter
  if (dateFilter !== 'all') {
    const now = new Date();
    filteredRequests = filteredRequests.filter(req => {
      const requestDate = new Date(req.timestamp);
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
    if (filteredRequests.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 48px;">Keine Anfragen für die gewählten Filter gefunden.</p>';
    } else {
      filteredRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(request => {
        const card = createRequestCard(request);
        container.appendChild(card);
      });
    }
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
    const dateString = date.toISOString().split('T')[0];
    const hasBooking = adminSystem.getBookingsForDate(dateString).length > 0;
    
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
  
  const todayBookings = adminSystem.getTodayBookings();
  
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
        ${statusTranslations[booking.status]}
      </div>
    `;
    
    bookingItems.appendChild(bookingElement);
  });
}

function loadUsers() {
  const usersGrid = document.getElementById('users-grid');
  if (!usersGrid) return;
  
  usersGrid.innerHTML = '';
  
  const users = adminSystem.getAllUsers();
  
  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    userCard.style.cssText = `
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;
    
    userCard.innerHTML = `
      <div class="user-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div class="user-avatar" style="
          width: 48px;
          height: 48px;
          background: ${user.role === 'admin' ? '#7A9B28' : user.role === 'manager' ? '#5A9BCC' : '#C4976A'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
        ">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div class="user-name" style="font-weight: 600; color: var(--text-primary);">${user.name}</div>
          <div class="user-username" style="color: var(--text-secondary); font-size: 14px;">@${user.username}</div>
        </div>
      </div>
      
      <div class="user-details" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 14px;">E-Mail:</span>
          <span style="color: var(--text-primary); font-size: 14px;">${user.email}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted); font-size: 14px;">Rolle:</span>
          <span style="color: var(--text-primary); font-size: 14px;">${adminSystem.getRoleDisplayName(user.role)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted); font-size: 14px;">Erstellt:</span>
          <span style="color: var(--text-primary); font-size: 14px;">${adminSystem.formatDate(user.created)}</span>
        </div>
      </div>
      
      <div class="user-actions" style="display: flex; gap: 8px;">
        <button class="action-btn-sm action-btn-secondary" onclick="editUser('${user.username}')">
          Bearbeiten
        </button>
        ${user.username !== 'admin' ? `
          <button class="action-btn-sm" style="background: #EF4444; color: white;" onclick="deleteUser('${user.username}')">
            Löschen
          </button>
        ` : ''}
      </div>
    `;
    
    usersGrid.appendChild(userCard);
  });
}

function showAddUserModal() {
  document.getElementById('user-modal-title').textContent = 'Neuer Benutzer';
  document.getElementById('user-form').reset();
  document.getElementById('user-username').disabled = false;
  document.getElementById('user-modal').classList.add('show');
}

function editUser(username) {
  const user = adminSystem.users[username];
  if (!user) return;
  
  document.getElementById('user-modal-title').textContent = 'Benutzer bearbeiten';
  document.getElementById('user-username').value = username;
  document.getElementById('user-username').disabled = true;
  document.getElementById('user-name').value = user.name;
  document.getElementById('user-email').value = user.email;
  document.getElementById('user-role').value = user.role;
  document.getElementById('user-password').value = user.password;
  document.getElementById('user-password-confirm').value = user.password;
  
  document.getElementById('user-modal').classList.add('show');
}

function saveUser() {
  const form = document.getElementById('user-form');
  const formData = new FormData(form);
  
  const username = document.getElementById('user-username').value;
  const name = document.getElementById('user-name').value;
  const email = document.getElementById('user-email').value;
  const role = document.getElementById('user-role').value;
  const password = document.getElementById('user-password').value;
  const passwordConfirm = document.getElementById('user-password-confirm').value;
  
  // Validierung
  if (!username || !name || !email || !password) {
    showToast('error', 'Fehler', 'Bitte füllen Sie alle Felder aus');
    return;
  }
  
  if (password !== passwordConfirm) {
    showToast('error', 'Fehler', 'Passwörter stimmen nicht überein');
    return;
  }
  
  try {
    const isEdit = document.getElementById('user-username').disabled;
    
    if (isEdit) {
      adminSystem.updateUser(username, { name, email, role, password });
      showToast('success', 'Gespeichert', 'Benutzer wurde aktualisiert');
    } else {
      adminSystem.addUser({ username, name, email, role, password });
      showToast('success', 'Erstellt', 'Neuer Benutzer wurde erstellt');
    }
    
    closeModal('user-modal');
    loadUsers();
  } catch (error) {
    showToast('error', 'Fehler', error.message);
  }
}

function deleteUser(username) {
  if (confirm(`Benutzer "${username}" wirklich löschen?`)) {
    try {
      adminSystem.deleteUser(username);
      showToast('success', 'Gelöscht', 'Benutzer wurde entfernt');
      loadUsers();
    } catch (error) {
      showToast('error', 'Fehler', error.message);
    }
  }
}

function loadStatistics() {
  drawCallsChart();
  drawBookingsChart();
  drawRevenueChart();
}

function drawCallsChart() {
  const canvas = document.getElementById('calls-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const weeklyStats = adminSystem.getWeeklyStatistics();
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Chart dimensions
  const margin = 40;
  const chartWidth = canvas.width - 2 * margin;
  const chartHeight = canvas.height - 2 * margin;
  
  // Data
  const calls = weeklyStats.map(s => s.calls);
  const maxCalls = Math.max(...calls);
  const labels = weeklyStats.map(s => {
    const date = new Date(s.date);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  });
  
  // Draw chart
  ctx.strokeStyle = '#7A9B28';
  ctx.fillStyle = 'rgba(122, 155, 40, 0.1)';
  ctx.lineWidth = 3;
  
  ctx.beginPath();
  
  calls.forEach((call, index) => {
    const x = margin + (index * chartWidth / (calls.length - 1));
    const y = margin + chartHeight - (call / maxCalls * chartHeight);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Draw point
    ctx.fillStyle = '#7A9B28';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = '#556B70';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x, canvas.height - 10);
    ctx.fillText(call.toString(), x, y - 10);
  });
  
  ctx.strokeStyle = '#7A9B28';
  ctx.stroke();
}

function drawBookingsChart() {
  const canvas = document.getElementById('bookings-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const weeklyStats = adminSystem.getWeeklyStatistics();
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Chart dimensions
  const margin = 40;
  const chartWidth = canvas.width - 2 * margin;
  const chartHeight = canvas.height - 2 * margin;
  
  // Data
  const bookings = weeklyStats.map(s => s.bookings);
  const maxBookings = Math.max(...bookings);
  const labels = weeklyStats.map(s => {
    const date = new Date(s.date);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  });
  
  // Draw bars
  ctx.fillStyle = '#5A9BCC';
  
  bookings.forEach((booking, index) => {
    const barWidth = chartWidth / bookings.length * 0.7;
    const x = margin + (index * chartWidth / bookings.length) + (chartWidth / bookings.length - barWidth) / 2;
    const barHeight = booking / maxBookings * chartHeight;
    const y = margin + chartHeight - barHeight;
    
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw label
    ctx.fillStyle = '#556B70';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 10);
    ctx.fillText(booking.toString(), x + barWidth / 2, y - 5);
    
    ctx.fillStyle = '#5A9BCC';
  });
}

function drawRevenueChart() {
  const canvas = document.getElementById('revenue-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const weeklyStats = adminSystem.getWeeklyStatistics();
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Chart dimensions
  const margin = 40;
  const chartWidth = canvas.width - 2 * margin;
  const chartHeight = canvas.height - 2 * margin;
  
  // Data
  const revenues = weeklyStats.map(s => s.revenue);
  const maxRevenue = Math.max(...revenues);
  const labels = weeklyStats.map(s => {
    const date = new Date(s.date);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  });
  
  // Draw area chart
  ctx.fillStyle = 'rgba(196, 151, 106, 0.3)';
  ctx.strokeStyle = '#C4976A';
  ctx.lineWidth = 3;
  
  ctx.beginPath();
  
  // Start from bottom left
  ctx.moveTo(margin, margin + chartHeight);
  
  revenues.forEach((revenue, index) => {
    const x = margin + (index * chartWidth / (revenues.length - 1));
    const y = margin + chartHeight - (revenue / maxRevenue * chartHeight);
    ctx.lineTo(x, y);
  });
  
  // Close area
  ctx.lineTo(margin + chartWidth, margin + chartHeight);
  ctx.closePath();
  ctx.fill();
  
  // Draw line
  ctx.beginPath();
  revenues.forEach((revenue, index) => {
    const x = margin + (index * chartWidth / (revenues.length - 1));
    const y = margin + chartHeight - (revenue / maxRevenue * chartHeight);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Draw point
    ctx.fillStyle = '#C4976A';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw labels
    ctx.fillStyle = '#556B70';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x, canvas.height - 10);
    ctx.fillText(revenue + '€', x, y - 10);
  });
  
  ctx.stroke();
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
    case 'user-management':
      loadUsers();
      break;
    case 'statistiken':
      loadStatistics();
      break;
  }
  
  showToast('success', 'Aktualisiert', 'Daten wurden erfolgreich aktualisiert');
}

function exportData() {
  const data = adminSystem.exportData();
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alpaka-admin-export-${adminSystem.formatDate(new Date()).replace(/\./g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('success', 'Export', 'Daten wurden erfolgreich exportiert');
}

function addBooking() {
  const customerName = prompt('Kunde:');
  const date = prompt('Datum (YYYY-MM-DD):');
  const time = prompt('Zeit (HH:MM):');
  const persons = parseInt(prompt('Anzahl Personen:'));
  const revenue = parseInt(prompt('Umsatz (€):'));
  
  if (customerName && date && time && persons && revenue) {
    adminSystem.addBooking({
      customers: customerName,
      date: date,
      time: time,
      persons: persons,
      revenue: revenue
    });
    
    loadBookings();
    loadDashboard();
    showToast('success', 'Erstellt', 'Neue Buchung wurde hinzugefügt');
  }
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

function logout() {
  if (confirm('Wirklich abmelden?')) {
    adminSystem.logout();
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

// Simuliere eingehende Kontaktanfrage (Demo-Zwecke)
function simulateNewRequest() {
  const demoRequest = {
    vorname: 'Demo',
    nachname: 'User',
    email: 'demo@test.de',
    telefon: '0123 456789',
    zeit: '10:00',
    personen: 2,
    tag: new Date().toISOString().split('T')[0],
    extras: 'Das ist eine Demo-Anfrage für Testzwecke.'
  };
  
  adminSystem.addRequest(demoRequest);
  loadContactRequests();
  loadDashboard();
  showToast('info', 'Demo', 'Demo-Anfrage wurde hinzugefügt');
}

// Exponiere Funktion für Testing
window.simulateNewRequest = simulateNewRequest;
