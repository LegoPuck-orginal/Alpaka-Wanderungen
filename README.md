# Alpaka-Wanderungen 🦙

Premium Alpaka-Wanderungen Website mit modernem Node.js Backend

## 🚀 Features

### Frontend
- **Responsive Design** - Mobile-First Ansatz
- **Interactive UI** - Tour Filter, Modals, Smooth Scrolling
- **Modern CSS** - CSS Grid, Flexbox, Animationen
- **Progressive Enhancement** - Funktioniert auch ohne JavaScript

### Backend (Node.js/Express)
- **RESTful API** - Saubere API Endpoints
- **JWT Authentication** - Sichere Admin-Authentifizierung
- **Email Integration** - Nodemailer für Buchungsbestätigungen
- **Data Persistence** - JSON-basierte Datenspeicherung
- **Security** - Helmet.js, CORS, Input Validation

### Development Tools
- **Webpack** - Module Bundling
- **Babel** - ES6+ Transpilation
- **PostCSS** - CSS Preprocessing
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Nodemon** - Auto-Restart Development

## 📋 Voraussetzungen

- Node.js >= 16.0.0
- npm >= 8.0.0

## 🛠 Installation

```bash
# Dependencies installieren
npm install

# Environment konfigurieren
cp .env.example .env
```

## 🚀 Entwicklung

```bash
# Development Server starten
npm run dev

# Produktions-Build erstellen  
npm run build

# Code formatieren
npm run format

# Code linting
npm run lint
```

## 📝 Verfügbare Scripts

- `npm start` - Produktions-Server starten
- `npm run dev` - Development Server mit Auto-Reload
- `npm run build` - Produktions-Build erstellen
- `npm run watch` - CSS/JS im Watch-Modus
- `npm run lint` - Code Linting
- `npm run format` - Code formatieren

## 🔐 Admin Panel

**Standard Login:**
- Benutzername: `admin`
- Passwort: `admin123`

## 📁 Projektstruktur

```
/
├── admin/                  # Admin-Panel (Login erforderlich)
│   ├── index.html         # Admin Dashboard
│   ├── login.html         # Login-Seite
│   ├── admin-script.js    # Frontend-Logik
│   ├── admin-system.js    # Backend-System
│   └── admin-styles.css   # Admin-Styling
├── assets/                # Bilder und Medien
│   └── alpacker-logo.png  # Website Logo
├── css/                   # Website Stylesheets
│   ├── main.css          # Hauptstyles
│   ├── navigation.css    # Navigation
│   ├── sections.css      # Sektionen
│   └── contact.css       # Kontaktbereich
├── js/                    # Website JavaScript
│   └── main.js           # Hauptskript
├── docs/                  # Dokumentation
│   ├── README.md         # Vollständige Dokumentation
│   ├── SECURITY.md       # Sicherheitsrichtlinien
│   └── TESTPROTOKOLL.md  # Testprotokoll
├── backup/                # Backup-Dateien
├── index.html            # Hauptwebsite
└── LICENSE               # Lizenz

```

## 🚀 Schnellstart

1. **Website starten:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Website öffnen:** [http://localhost:8000](http://localhost:8000)

3. **Admin-Login:** [http://localhost:8000/admin/login.html](http://localhost:8000/admin/login.html)
   - **Admin:** `admin` / `alpaka123`
   - **Manager:** `astrid` / `wanderung456`

## ✨ Features

- 🌐 **Moderne Website** mit responsivem Design
- 🔐 **Sicheres Admin-System** mit Authentifizierung
- 🌙 **Dark Mode** mit lokaler Speicherung
- 📱 **Mobile-first** Design
- 🛡️ **Sicherheitsfeatures** (CSRF, XSS-Schutz)
- 📊 **Statistiken** und Verwaltung

## 📚 Weitere Dokumentation

Siehe `docs/` Ordner für:
- Vollständige Installationsanleitung
- Sicherheitsrichtlinien  
- API-Dokumentation
- Testprotokolle

---
*© 2025 Alpaka Wanderungen. Alle Rechte vorbehalten.*
