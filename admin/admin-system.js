// Echtes Admin-System mit localStorage-Speicherung
class AdminSystem {
  constructor() {
    this.currentUser = null;
    this.requests = [];
    this.bookings = [];
    this.users = {};
    this.statistics = {
      callCount: 0,
      lastWeekCalls: [],
      totalRevenue: 0,
      totalBookings: 0
    };
    
    this.init();
  }

  init() {
    this.loadData();
    this.checkAuthentication();
    this.initializeDefaultData();
  }

  // Authentifizierung
  checkAuthentication() {
    const userData = sessionStorage.getItem('alpaka_admin_user');
    if (!userData) {
      window.location.href = 'login.html';
      return;
    }
    
    this.currentUser = JSON.parse(userData);
    this.updateUserInfo();
  }

  updateUserInfo() {
    const nameElement = document.querySelector('.admin-name');
    const roleElement = document.querySelector('.admin-role');
    
    if (nameElement) nameElement.textContent = this.currentUser.name;
    if (roleElement) roleElement.textContent = this.getRoleDisplayName(this.currentUser.role);
  }

  getRoleDisplayName(role) {
    const roles = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'user': 'Benutzer'
    };
    return roles[role] || 'Unbekannt';
  }

  logout() {
    sessionStorage.removeItem('alpaka_admin_user');
    window.location.href = 'login.html';
  }

  // Daten-Management
  loadData() {
    // Lade gespeicherte Daten aus localStorage
    const savedRequests = localStorage.getItem('alpaka_requests');
    const savedBookings = localStorage.getItem('alpaka_bookings');
    const savedUsers = localStorage.getItem('alpaka_users');
    const savedStats = localStorage.getItem('alpaka_statistics');

    this.requests = savedRequests ? JSON.parse(savedRequests) : [];
    this.bookings = savedBookings ? JSON.parse(savedBookings) : [];
    this.users = savedUsers ? JSON.parse(savedUsers) : {};
    this.statistics = savedStats ? JSON.parse(savedStats) : {
      callCount: 0,
      lastWeekCalls: [],
      totalRevenue: 0,
      totalBookings: 0
    };
  }

  saveData() {
    localStorage.setItem('alpaka_requests', JSON.stringify(this.requests));
    localStorage.setItem('alpaka_bookings', JSON.stringify(this.bookings));
    localStorage.setItem('alpaka_users', JSON.stringify(this.users));
    localStorage.setItem('alpaka_statistics', JSON.stringify(this.statistics));
  }

  initializeDefaultData() {
    // Initialisiere Default-Users falls noch keine vorhanden
    if (Object.keys(this.users).length === 0) {
      this.users = {
        'admin': {
          password: 'alpaka123',
          role: 'admin',
          name: 'Administrator',
          email: 'admin@alpaka-wanderungen.de',
          created: new Date().toISOString(),
          lastLogin: null,
          permissions: ['all']
        },
        'astrid': {
          password: 'wanderung456',
          role: 'manager',
          name: 'Astrid Mustermann',
          email: 'astrid@alpaka-wanderungen.de',
          created: new Date().toISOString(),
          lastLogin: null,
          permissions: ['requests', 'bookings', 'statistics']
        }
      };
      this.saveData();
    }

    // Initialisiere Statistiken für die letzten 7 Tage
    if (this.statistics.lastWeekCalls.length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        this.statistics.lastWeekCalls.push({
          date: date.toISOString().split('T')[0],
          calls: Math.floor(Math.random() * 15) + 5,
          bookings: Math.floor(Math.random() * 8) + 2,
          revenue: (Math.floor(Math.random() * 400) + 100)
        });
      }
      this.saveData();
    }
  }

  // Kontaktanfragen-Management
  addRequest(requestData) {
    const request = {
      id: Date.now(),
      ...requestData,
      status: 'new',
      timestamp: new Date().toISOString(),
      unread: true,
      handledBy: null
    };
    
    this.requests.unshift(request);
    this.updateCallStatistics();
    this.saveData();
    return request;
  }

  updateRequestStatus(requestId, status) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
      request.handledBy = this.currentUser.username;
      request.updatedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  markRequestAsRead(requestId) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.unread = false;
      this.saveData();
      return true;
    }
    return false;
  }

  markAllRequestsAsRead() {
    this.requests.forEach(request => {
      request.unread = false;
    });
    this.saveData();
  }

  getUnreadRequestsCount() {
    return this.requests.filter(r => r.unread).length;
  }

  // Buchungs-Management
  addBooking(bookingData) {
    const booking = {
      id: Date.now(),
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      createdBy: this.currentUser.username
    };
    
    this.bookings.push(booking);
    this.statistics.totalBookings++;
    this.statistics.totalRevenue += bookingData.revenue || 0;
    this.saveData();
    return booking;
  }

  getBookingsForDate(date) {
    return this.bookings.filter(b => b.date === date);
  }

  getTodayBookings() {
    const today = new Date().toISOString().split('T')[0];
    return this.getBookingsForDate(today);
  }

  // User-Management
  addUser(userData) {
    if (this.users[userData.username]) {
      throw new Error('Benutzername bereits vergeben');
    }
    
    this.users[userData.username] = {
      ...userData,
      created: new Date().toISOString(),
      lastLogin: null
    };
    
    this.saveData();
    return true;
  }

  updateUser(username, userData) {
    if (this.users[username]) {
      this.users[username] = {
        ...this.users[username],
        ...userData,
        updated: new Date().toISOString()
      };
      this.saveData();
      return true;
    }
    return false;
  }

  deleteUser(username) {
    if (username === 'admin') {
      throw new Error('Admin-Benutzer kann nicht gelöscht werden');
    }
    
    if (this.users[username]) {
      delete this.users[username];
      this.saveData();
      return true;
    }
    return false;
  }

  getAllUsers() {
    return Object.entries(this.users).map(([username, data]) => ({
      username,
      ...data
    }));
  }

  // Statistiken
  updateCallStatistics() {
    this.statistics.callCount++;
    
    // Update heutige Statistiken
    const today = new Date().toISOString().split('T')[0];
    let todayStats = this.statistics.lastWeekCalls.find(s => s.date === today);
    
    if (!todayStats) {
      // Entferne ältesten Eintrag und füge neuen hinzu
      this.statistics.lastWeekCalls.shift();
      todayStats = {
        date: today,
        calls: 0,
        bookings: 0,
        revenue: 0
      };
      this.statistics.lastWeekCalls.push(todayStats);
    }
    
    todayStats.calls++;
  }

  getWeeklyStatistics() {
    return this.statistics.lastWeekCalls;
  }

  getTodayStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.statistics.lastWeekCalls.find(s => s.date === today);
    
    return {
      calls: todayStats?.calls || 0,
      bookings: this.getTodayBookings().length,
      revenue: this.getTodayBookings().reduce((sum, b) => sum + (b.revenue || 0), 0),
      unreadRequests: this.getUnreadRequestsCount()
    };
  }

  // Export-Funktionen
  exportData() {
    const exportData = {
      requests: this.requests,
      bookings: this.bookings,
      statistics: this.statistics,
      exportDate: new Date().toISOString(),
      exportedBy: this.currentUser.username
    };
    
    return exportData;
  }

  // Hilfsfunktionen
  formatDate(dateString) {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(dateString));
  }

  formatDateTime(dateString) {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }

  timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'vor wenigen Sekunden';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
    }
  }
}

// Status-Übersetzungen
const statusTranslations = {
  'new': 'Neu',
  'in-progress': 'In Bearbeitung',
  'completed': 'Abgeschlossen',
  'confirmed': 'Bestätigt',
  'pending': 'Ausstehend',
  'cancelled': 'Storniert'
};

// Globale Admin-System-Instanz
let adminSystem;
