# 🦙 Alpaka-Wanderungen - Ordnerstruktur

## 📁 Projektstruktur

```
Alpaka-Wanderungen/
├── 📄 index.html              # Hauptwebsite
├── 📄 server.js               # Express Server (Node.js)
├── 📄 package.json            # NPM Abhängigkeiten
├── 📄 README.md               # Diese Datei
├── 📄 LICENSE                 # Lizenz
├── 📄 agb.html               # AGB Seite
├── 📄 datenschutz.html       # Datenschutz Seite
├── 📄 impressum.html         # Impressum Seite
│
├── 📂 public/                 # Öffentliche Dateien
│   ├── 📂 css/               # Stylesheets
│   │   └── styles.css        # Haupt-CSS
│   ├── 📂 js/                # JavaScript Dateien
│   │   └── main.js           # Haupt-JavaScript
│   └── 📂 images/            # Bilder und Assets
│       └── alpacker-logo.png # Logo
│
├── 📂 admin-panel/           # Admin Panel (AKTIV)
│   └── index.html            # Funktionierendes Admin Panel
│
├── 📂 data/                  # JSON Datenbank
│   ├── bookings.json        # Buchungen
│   ├── contacts.json        # Kontaktanfragen
│   ├── vouchers.json        # Gutscheine
│   └── discount-codes.json  # Rabattcodes
│
├── 📂 backup/                # Backup & Archiv
│   └── 📂 old-files/        # Alte/nicht verwendete Dateien
│
├── 📂 temp/                  # Temporäre Test-Dateien
│
└── 📂 docs/                  # Dokumentation
```

## 🚀 Wichtige URLs

### Hauptwebsite
- **Website**: http://localhost:3000
- **AGB**: http://localhost:3000/agb.html
- **Datenschutz**: http://localhost:3000/datenschutz.html
- **Impressum**: http://localhost:3000/impressum.html

### Admin Panel
- **Admin Panel**: http://localhost:3000/admin
- **Admin Login**: http://localhost:3000/admin/new
- **Passwort**: `admin123`

## 🔧 Server starten

```bash
npm start
```

## 📊 Admin Panel Features

Das Admin Panel unter `/admin-panel/index.html` bietet:

- ✅ **Login-System** mit Token-Authentifizierung
- ✅ **Statistiken** (Buchungen, Kontakte, Gutscheine)
- ✅ **Kontakt-Management** (Anzeigen, Beantworten, Löschen)
- ✅ **Buchungsübersicht** (Alle Buchungen einsehen)
- ✅ **Responsive Design** mit neuer Farbpalette

## 🎨 Design System

**Farbpalette:**
- Primär: `#33984b` (Alpaka-Grün)
- Sekundär: `#1e6f50` (Dunkelgrün)
- Akzent: `#134c4c` (Dunkelgrau-Grün)
- Hell: `#f6ca9f` (Warmes Beige)
- Hintergrund: `#f9e6cf` (Helles Beige)

## 📝 Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `index.html` | Hauptwebsite mit Alpaka-Tours |
| `server.js` | Express Server mit allen APIs |
| `admin-panel/index.html` | Funktionierendes Admin Panel |
| `public/css/styles.css` | Haupt-Stylesheet |
| `public/js/main.js` | Frontend JavaScript |
| `data/*.json` | JSON-Datenbank Dateien |

## 🔄 Aufräum-Änderungen

- ✅ Alte Test-Dateien in `temp/` verschoben
- ✅ Nicht verwendete Admin-Dateien in `backup/old-files/`
- ✅ CSS/JS in `public/` Ordner strukturiert
- ✅ Logo in `public/images/` verschoben
- ✅ Funktinierendes Admin Panel in `admin-panel/`
- ✅ Pfade in allen Dateien aktualisiert

## 🎯 Nächste Schritte

1. **Testen**: Admin Panel unter http://localhost:3000/admin
2. **Backup**: Alte Dateien in `backup/` können gelöscht werden
3. **Deploy**: Projekt ist bereit für Deployment

---

**Status**: ✅ Vollständig funktionsfähig und aufgeräumt
