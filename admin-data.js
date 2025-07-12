// Demo-Daten für das Admin Panel
const demoRequests = [
  {
    id: 1,
    vorname: "Maria",
    nachname: "Schmidt",
    email: "maria.schmidt@email.de",
    telefon: "0151 12345678",
    zeit: "10:00",
    personen: 6,
    tag: "2025-07-15",
    extras: "Familienausflug mit 2 Kindern (8 und 12 Jahre). Gibt es besondere Regeln für Kinder?",
    status: "new",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // vor 5 Minuten
    unread: true
  },
  {
    id: 2,
    vorname: "Peter",
    nachname: "Wagner",
    email: "p.wagner@firma.de",
    telefon: "040 98765432",
    zeit: "15:00",
    personen: 12,
    tag: "2025-07-20",
    extras: "Betriebsausflug für unser Team. Können wir danach noch grillen?",
    status: "in-progress",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // vor 2 Stunden
    unread: false
  },
  {
    id: 3,
    vorname: "Sarah",
    nachname: "Müller",
    email: "sarah.mueller@web.de",
    telefon: "0173 98765432",
    zeit: "16:00",
    personen: 2,
    tag: "2025-07-18",
    extras: "Romantischer Ausflug zu zweit. Mein Freund ist etwas nervös wegen Tieren - sind die Alpakas sehr zutraulich?",
    status: "new",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // vor 30 Minuten
    unread: true
  },
  {
    id: 4,
    vorname: "Thomas",
    nachname: "Klein",
    email: "t.klein@gmail.com",
    telefon: "069 11223344",
    zeit: "9:00",
    personen: 4,
    tag: "2025-07-16",
    extras: "Geburtstagstour für meine Tochter (16 Jahre). Sie liebt Tiere über alles!",
    status: "completed",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // vor 1 Tag
    unread: false
  },
  {
    id: 5,
    vorname: "Anna",
    nachname: "Becker",
    email: "anna.becker@outlook.de",
    telefon: "0162 55667788",
    zeit: "10:00",
    personen: 8,
    tag: "2025-07-22",
    extras: "Junggesellinnenabschied! Können wir Fotos machen und gibt es einen Ort zum Picknicken?",
    status: "new",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // vor 1 Stunde
    unread: true
  },
  {
    id: 6,
    vorname: "Michael",
    nachname: "Weber",
    email: "m.weber@web.de",
    telefon: "0178 99887766",
    zeit: "15:00",
    personen: 3,
    tag: "2025-07-14",
    extras: "Meine Frau hat Geburtstag und liebt Alpakas. Überraschung geplant!",
    status: "in-progress",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // vor 3 Stunden
    unread: false
  },
  {
    id: 7,
    vorname: "Lisa",
    nachname: "Hoffmann",
    email: "lisa.hoffmann@email.de",
    telefon: "030 44556677",
    zeit: "16:00",
    personen: 5,
    tag: "2025-07-19",
    extras: "Haben Sie auch Alpaka-Wolle zum Kaufen? Würde gerne etwas als Andenken mitnehmen.",
    status: "new",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // vor 15 Minuten
    unread: true
  }
];

// Demo-Buchungen für den Kalender
const demoBookings = [
  {
    id: 1,
    date: "2025-07-14",
    time: "10:00",
    customers: "Familie Schmidt",
    persons: 6,
    status: "confirmed",
    revenue: 150
  },
  {
    id: 2,
    date: "2025-07-14",
    time: "15:00",
    customers: "Peter Wagner & Team",
    persons: 12,
    status: "confirmed",
    revenue: 300
  },
  {
    id: 3,
    date: "2025-07-15",
    time: "10:00",
    customers: "Sarah & Mark",
    persons: 2,
    status: "pending",
    revenue: 50
  },
  {
    id: 4,
    date: "2025-07-16",
    time: "16:00",
    customers: "Thomas Klein",
    persons: 4,
    status: "confirmed",
    revenue: 100
  },
  {
    id: 5,
    date: "2025-07-18",
    time: "9:00",
    customers: "Anna & Friends",
    persons: 8,
    status: "confirmed",
    revenue: 200
  }
];

// Demo-Aktivitäten
const demoActivities = [
  {
    id: 1,
    type: "request",
    icon: "📧",
    title: "Neue Kontaktanfrage",
    description: "Maria Schmidt - Familientour für 6 Personen",
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 2,
    type: "booking",
    icon: "✅",
    title: "Buchung bestätigt",
    description: "Peter Wagner - 15.07.2025, 10:00 Uhr",
    timestamp: new Date(Date.now() - 12 * 60 * 1000)
  },
  {
    id: 3,
    type: "payment",
    icon: "💰",
    title: "Zahlung erhalten",
    description: "120€ für Alpaka-Tour (4 Personen)",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: "review",
    icon: "⭐",
    title: "Neue Bewertung",
    description: "5 Sterne von Familie Müller",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 5,
    type: "cancellation",
    icon: "❌",
    title: "Stornierung",
    description: "Buchung für 13.07. wurde storniert",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
];

// Statistik-Daten
const demoStats = {
  today: {
    requests: 24,
    bookings: 12,
    revenue: 1240,
    rating: 4.9
  },
  changes: {
    requests: 15,
    bookings: 8,
    revenue: 22,
    rating: 0
  },
  chartData: {
    bookings: [5, 8, 12, 15, 18, 22, 25, 30, 28, 32, 35, 40],
    revenue: [125, 200, 300, 375, 450, 550, 625, 750, 700, 800, 875, 1000]
  }
};

// Status-Übersetzungen
const statusTranslations = {
  'new': 'Neu',
  'in-progress': 'In Bearbeitung', 
  'completed': 'Abgeschlossen'
};

// Hilfsfunktionen
function formatDate(date) {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function timeAgo(date) {
  const now = new Date();
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

// Exportiere Daten für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    demoRequests,
    demoBookings,
    demoActivities,
    demoStats,
    statusTranslations,
    formatDate,
    formatTime,
    formatDateTime,
    timeAgo
  };
}
