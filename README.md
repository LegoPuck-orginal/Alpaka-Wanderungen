# 🦙 Alpaka Wanderungen Website

Eine moderne, sichere Website für Alpaka-Wanderungen mit vollständigem Admin-System.

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
