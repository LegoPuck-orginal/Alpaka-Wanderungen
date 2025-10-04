# Alpaka‑Wanderungen

> Moderne Plattform für Alpaka-Touren mit Komplett-Admin, automatischer Terminlogik und angenehmem Dark-Design.

<p align="center">
  <strong>Next.js 15 · TypeScript · Prisma · NextAuth · Tailwind Utilities · SQLite</strong>
</p>

---

## 📚 Inhaltsverzeichnis

1. [Projektüberblick](#-projektüberblick)
2. [Technologie-Stack & Architektur](#-technologie-stack--architektur)
3. [Installation & Setup](#-installation--setup)
4. [Alltagsaufgaben & Admin](#-alltagsaufgaben--admin)
5. [Bugfix-Playbook](#-bugfix-playbook)
6. [Betrieb & Wartung](#-betrieb--wartung)
7. [Sicherheit & Compliance](#-sicherheit--compliance)
8. [Datenmodell](#-datenmodell)
9. [API-Kurzreferenz](#-api-kurzreferenz)
10. [Medien- & Speicheroptionen](#-medien--speicheroptionen)
11. [Troubleshooting-Lexikon](#-troubleshooting-lexikon)
12. [Anhang](#-anhang)

---

## 🐾 Projektüberblick

### Highlights
- Dauerhaft buchbare Touren – Termine generieren sich automatisch (Vormittag/Nachmittag)
- Live-Verfügbarkeiten mit deutlichem Farbcode (weiß/gelb/rot)
- Mehrstufiges Buchungssystem inkl. Buchungscode, Personenanzahl und Statusverwaltung
- Vollständiges Admin-Backoffice: Touren, Buchungen, Bewertungen, Benutzer, Inhalte
- CMS-gestützte Texte für alle öffentlichen Seiten
- Flexible Bildspeicherung (lokal, S3, Cloudinary) mit automatischer Optimierung

### Zielgruppen
- **Besitzer:innen / Admins** – verwalten Touren, Inhalte und Buchungen
- **Gäste** – informieren sich, buchen Termine, lassen Bewertungen da
- **Entwickler:innen** – erweitern Features, pflegen Betrieb, beheben Bugs

---

## 🧭 Technologie-Stack & Architektur

| Ebene | Technologien | Notizen |
| --- | --- | --- |
| Frontend | Next.js App Router, React Server Components, Tailwind Utilities | Dark Default Theme, modulare Komponenten |
| Backend | Next.js API Routes, Server Actions, NextAuth Credentials | TOTP-fähige Auth, Session Cookies |
| Datenhaltung | Prisma Client, SQLite | Einfache Migration/Backup, lokal eingebettet |
| Storage | Datei-System · S3 · Cloudinary | via `STORAGE_BACKEND` umschaltbar |

### Projektstruktur (Auszug)
```
site/
  app/                # Seiten, Layouts, API-Routen
  components/         # UI-Komponenten (Kalender, Inputs, Navigation)
  lib/                # Prisma, Auth, Content-Registry, Default-Slots
  prisma/             # schema.prisma, seed, Migrationen
  public/             # statische Assets & Uploads
  scripts/            # Automation & Quickstart
```

---

## ⚙️ Installation & Setup

### Voraussetzungen
- Node.js ≥ 20
- npm ≥ 10
- (optional) `sqlite3` CLI, `cloudflared`, `nginx`

### Quickstart (3 Schritte)
```bash
cd /pfad/zu/Alpaka-Wanderungen/site
npm ci
npm run quickstart
```
> Erststart legt `.env` an, führt Prisma-Befehle aus, erstellt einen Admin-User (`admin@example.com` / `admin123`) und startet die App auf `http://0.0.0.0:3000`.

### Lokale Entwicklung
```bash
npm ci
npm run dev
# erreichbar unter http://localhost:3000
```

### Production Build & Start
```bash
npm run build
npx next start -p 3000 -H 0.0.0.0
```

### Konfiguration (.env)
```env
NODE_ENV=production
DATABASE_URL="file:/absoluter/pfad/zur/dev.db"
NEXTAUTH_URL=http://<SERVER_ODER_DOMAIN>:3000
NEXTAUTH_SECRET=<BASE64_32_BYTES>

# optionaler Medien-Storage
STORAGE_BACKEND=local|s3|cloudinary
S3_BUCKET=...
S3_REGION=...
S3_PUBLIC_BASE=https://<bucket>.s3.<region>.amazonaws.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Netzwerk-Varianten
- **LAN / Heimnetz:** Direktzugriff über `http://<IP>:3000`, ggf. UFW-Port freigeben
- **Reverse Proxy (nginx):** Upstream `http://127.0.0.1:3000`, TLS mit Let’s Encrypt
- **Cloudflare Tunnel:** `cloudflared` → öffentliche Domain, `NEXTAUTH_URL` anpassen

---

## 🛠️ Alltagsaufgaben & Admin

| Bereich | Route | Aufgaben |
| --- | --- | --- |
| Inhalte | `/admin/content` | CMS-Keys pflegen (Hero, Kalendertexte, etc.) |
| Touren & Slots | `/admin` | Tourdaten, Bilder, Kapazitäten – Slots generieren sich automatisch |
| Buchungen | `/admin/bookings` | Status verwalten (pending/confirmed/canceled), Zahlungen überblicken |
| Bewertungen | `/admin/reviews` | Sichtbare Testimonials kuratieren |
| Benutzer & 2FA | `/admin/users` | Rollen setzen, 2FA aktivieren, Passwörter zurücksetzen |

**Standard-Admin:** `admin@example.com` / `admin123` → nach dem ersten Login Kennwort ändern!  
Passwort-Reset per Einzeiler:
```bash
node -e "const{PrismaClient}=require('@prisma/client');(async()=>{const p=new PrismaClient();await p.user.update({where:{email:'admin@example.com'},data:{passwordHash:require('bcryptjs').hashSync('NEUESPASSWORT',10)}});console.log('Passwort geändert');await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})"
```

---

## 🐛 Bugfix-Playbook

### Schnelle Checkliste
1. **Fehlermeldung sammeln** – Log, Browser-Konsole, Terminalausgabe dokumentieren
2. **Status prüfen** – `npm run lint`, `npm run build`, `GET /api/health`
3. **Reproduktion** – minimalen Testfall aufsetzen (URL, Input, Konto)
4. **Fix umsetzen** – Tests/Checks aktualisieren, Code-Style einhalten
5. **Regression vermeiden** – relevante Seiten im Browser abklopfen, ggf. `npm run test`

### Diagnose-Tools
- **Health-Check:** `curl http://localhost:3000/api/health`
- **Prisma Studio:** `npx prisma studio`
- **Slot-Verfügbarkeit:** `curl "http://localhost:3000/api/slots/calendar?start=...&end=..."`
- **Lint/Test:** `npm run lint`, `npm run test`

### Typische Fehlerbilder & Sofortmaßnahmen

| Symptom | Ursache | Diagnose | Fix |
| --- | --- | --- | --- |
| Login schlägt kommentarlos fehl | `NEXTAUTH_URL` falsch | `echo $NEXTAUTH_URL` | `.env` aktualisieren, Server neu starten |
| „Environment variable not found: DATABASE_URL“ | `.env` fehlt | `ls -a` im Projekt | `.env` anlegen, absolute DB-Pfade nutzen |
| Slot wirkt überbucht | Alte Slot-Daten | `npx prisma studio` (Bookings) | Buchung anpassen, automatische Slots regenerieren lassen |
| Upload landet nicht | MIME/Size unzulässig | Server-Log, Browser-DevTools | Bildgröße <5MB, erlaubte Typen (JPG/PNG/WebP) nutzen |

### Checkliste nach dem Fix
- [ ] `npm run lint` erfolgreich
- [ ] Relevante Seite manuell getestet
- [ ] README/Docs aktualisiert (falls Verhalten geändert)
- [ ] Deployment-Anweisungen beachtet

---

## 🧭 Betrieb & Wartung

### Deployment-Strategie
- **Manuell:** Build → Start (siehe [Installation & Setup](#-installation--setup))
- **Process Manager:** `pm2 start npm --name alpaka -- run start`
- **Zero-Downtime:** Zweite Instanz starten, Proxy umswitchen, alte Instanz schließen

### Datenbank & Migrationen
```bash
npx prisma generate
npx prisma db push
npx prisma migrate dev --name <beschreibung>
# optional: npx prisma studio
```

### Backups & Restore
- SQLite-Datei aus `DATABASE_URL` sichern (Dienst kurz stoppen!)
- Uploads in `public/uploads/` kopieren
- Restore: Datei zurückspielen → `npx prisma db push`

### Monitoring & Logging
- Next.js-Logs im Terminal/PM2/Journalctl
- Health-Endpunkt für Uptime-Monitoring einsetzen
- Proxy-/Tunnel-Logs (nginx, Cloudflare) zur Außensicht

### Updates
- `npm outdated` prüfen → gezielt aktualisieren
- Nach Dependency-Updates: `npm run lint`, `npm run build`

---

## 🛡️ Sicherheit & Compliance
- Starke Passwörter für alle Benutzer:innen, regelmäßig wechseln
- Sofort nach Erststart Admin-Passwort ändern
- Optional 2FA aktivieren (TOTP)
- `NEXTAUTH_SECRET` 32 Bytes Base64, niemals committen
- Firewall: nur Ports 80/443 (bzw. 3000 intern) freigeben
- Datenschutz: Impressum/Datenschutzseiten unter `/datenschutz` etc. pflegen

---

## 🗃️ Datenmodell

| Tabelle | Wichtigste Felder | Beschreibung |
| --- | --- | --- |
| `User` | E-Mail, Rolle, Passwort-Hash, 2FA-Status | Admins & Kund:innen |
| `Tour` | Titel, Beschreibung, Preis, Kapazität | Grundlage jeder Buchung |
| `EventSlot` | Start, Ende, Kapazität, tourId | Automatisch generierte Zeitfenster |
| `Booking` | slotId, persons, status, code | Reservierung + Zahlungsvorbereitung |
| `Payment` | bookingId, amountCents, status | Platzhalter für spätere Integration |
| `Content` | key, value | CMS-ähnliche Textverwaltung |
| `Review` | Name, Text, Rating, position | Öffentliche Kundenstimmen |
| `TourImage` | URL, Alt-Text, Position | Zusatzbilder pro Tour |
| `PageView` | Pfad, Session, Meta | Einfaches Tracking/Statistik |

---

## 🔌 API-Kurzreferenz

| Endpoint | Methode | Beschreibung |
| --- | --- | --- |
| `/api/health` | GET | Health-Status (App, DB, Nutzerzahl) |
| `/api/tours` | GET | Öffentliche Tourenliste |
| `/api/tours/[id]` | GET | Detailinfos inkl. Slots |
| `/api/bookings` | POST | Neue Buchung anlegen |
| `/api/slots/calendar` | GET | Aggregierte Slots (inkl. Vormittag/Nachmittag) |
| `/api/slots/[id]/availability` | GET | Live-Verfügbarkeit eines Slots |

Authentifizierung via NextAuth (`/api/auth/[...nextauth]`).

---

## 🖼️ Medien- & Speicheroptionen

| Backend | Einsatz | Besonderheiten |
| --- | --- | --- |
| `local` | Standard | Speicherung unter `public/uploads/`, ideal für kleine Setups |
| `s3` | AWS-kompatible Buckets | `S3_*` Variablen setzen, `next.config.ts` remotePatterns erweitern |
| `cloudinary` | CDNs & Optimierung | Cloudinary-Credentials eintragen, Upload über SDK |

Uploads werden automatisch auf WebP/kleinere Varianten optimiert.

---

## 🧰 Troubleshooting-Lexikon

> Nach Themen geordnet – jeweils Symptom → Ursache → Diagnose → Lösung.

### Konfiguration & Environment
- **Fehlende `DATABASE_URL`** → `.env` prüfen, absoluten Pfad setzen → `npx prisma db push`
- **Falsche `NEXTAUTH_URL`** → Domain/LAN anpassen, Cookies löschen, erneut anmelden

### Datenbank & Prisma
- **„Unable to open the database file“** → Pfad/Permissions prüfen, Ordner anlegen, Rechte setzen
- **Schema-Mismatch** → `npx prisma db push`, ggf. Migration neu ausführen

### Build & Runtime
- **Build bricht ab** → Prüfen, ob Server-Only Code in `generateStaticParams` o.ä. läuft → dynamisieren
- **`.next` fehlt** → Build erneut starten, danach `next start`

### Authentifizierung
- **CSRF/Callback Fehler** → `NEXTAUTH_URL`, Proxy-Header `X-Forwarded-*` setzen
- **Passwort korrekt, Login scheitert** → Benutzer existiert? Prisma-Einzeiler ausführen

### Uploads & Medien
- **Uploads schlagen fehl** → Dateityp/Größe, Storage-ENV prüfen
- **Bilder nicht sichtbar** → `next.config.ts` remotePatterns ergänzen

### Netzwerk & Proxy
- **Kein Zugriff aus LAN** → Server auf `0.0.0.0` binden, Firewall-Port öffnen
- **502 hinter Nginx** → Upstream-URL/Headers korrigieren

### Betriebssystem & Rechte
- **EACCES bei SQLite/Uploads** → `chown`/`chmod` anpassen

### Performance
- **Kalte Starts langsam** → Warmup-Requests, Caching, Ressourcen checken
- **Große Bilder** → Optimierung aktiv lassen, ggf. CDN vorschalten

---

## 📎 Anhang

### Befehls-Referenz
```bash
# Lint & Tests
npm run lint
npm run test

# Prisma
npx prisma generate
npx prisma db push
npx prisma studio

# Produktionsstart
npm run build
npx next start -p 3000 -H 0.0.0.0
```

### Nützliche Ressourcen
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)

---

## 📄 Lizenz

MIT
