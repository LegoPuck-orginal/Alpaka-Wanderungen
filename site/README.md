
# Alpaka‑Wanderungen – Vollständige Dokumentation

Next.js 15 (App Router) · TypeScript · Prisma (SQLite) · NextAuth (Credentials) · Tailwind‑Utilities · Bildspeicher lokal/S3/Cloudinary.

Inhalt
- Überblick & Features
- Systemarchitektur & Projektstruktur
- Datenmodell (Prisma)
- Konfiguration (.env) und Secrets
- Quickstart (2–3 Befehle)
- Entwicklung (Dev)
- Betrieb (Prod): LAN, Nginx/Proxy, Cloudflare Tunnel
- Datenbank & Migrations
- Admin‑Anleitung (Benutzer, 2FA, Inhalte, Touren/Slots, Buchungen)
- API‑Endpunkte (Kurzreferenz)
- Medien‑Storage (lokal, S3, Cloudinary)
- Sicherheit (Passwörter, 2FA, Session/Cookies, CORS)
- Logging, Monitoring, Health‑Checks
- Backups & Wiederherstellung
- Troubleshooting (häufige Fehler)
- Wartung & Updates

## Überblick & Features
- Touren mit Terminslots (Kapazität, Personen pro Buchung min/max)
- Buchung pro Slot inkl. Personenanzahl, Status (pending/confirmed/canceled)
- Eindeutiger Buchungscode pro Bestellung
- Admin‑Bereich: Touren/Slots/Buchungen/Benutzer/Content/Stats
- Login via E‑Mail+Passwort, optional TOTP‑2FA (geplant/teilweise vorhanden)
- CMS‑artige Content‑Keys (Hero‑Texte etc.)
- Bild‑Uploads (lokal oder optional S3/Cloudinary) mit Resize/WebP

## Systemarchitektur & Projektstruktur
- App Router (`/app`): Seiten, API‑Routes
- Server Actions für Admin‑Formulare (CRUD)
- `lib/prisma.ts` Single Prisma Client Instance
- `lib/auth.ts` NextAuth Credentials‑Flow
- `lib/content.ts` Key‑Value‑Inhalte
- `lib/storage.ts` Medien‑Storage Provider (local/s3/cloudinary)

Verzeichnisbaum (auszug):
```
site/
  app/                # Seiten & API
  lib/                # Prisma, Auth, Content, Storage
  prisma/             # schema.prisma, migrations, seed.js
  public/             # statische Assets (uploads/)
  scripts/            # quickstart.cjs
  next.config.ts, tsconfig.json, package.json
```

## Datenmodell (vereinfacht)
- `User`: { id, email, name?, role, passwordHash, twoFactorEnabled, twoFactorSecret?, createdAt, updatedAt }
- `Tour`: { id, title, description, durationMin, priceCents, capacity, minPersonsPerBooking, maxPersonsPerBooking, imageUrl?, imageAlt?, ... }
- `EventSlot`: { id, tourId → Tour, start, end, capacity }
- `Booking`: { id, code?, userId → User, slotId → EventSlot, persons, contactEmail?, status, payment? }
- `Payment`: { id, bookingId → Booking, amountCents, currency, status }
- `Content`: { id, key, value }
- `TourImage`: { id, tourId → Tour, url, alt?, width?, height?, position }
- `PageView`: { id, path, sessionId, ... }

## Konfiguration (.env)
Minimal (LAN‑Beispiel):
```env
NODE_ENV=production
DATABASE_URL="file:/absoluter/pfad/zur/dev.db"   # absolut empfohlen
NEXTAUTH_URL=http://<SERVER_IP>:3000
NEXTAUTH_SECRET=<BASE64_32_BYTES>
```
Weitere optionale Variablen (Storage):
```env
STORAGE_BACKEND=local|s3|cloudinary
# S3
S3_BUCKET=...
S3_REGION=...
S3_PUBLIC_BASE=https://<bucket>.s3.<region>.amazonaws.com
# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Quickstart (2–3 Befehle)
```bash
cd /pfad/zu/Alpaka-Wanderungen/site
npm ci
npm run quickstart
```
Das Script:
- erzeugt `.env` falls nötig (inkl. absolutem `DATABASE_URL`)
- `prisma generate` + `prisma db push`
- seedet Admin (`admin@example.com` / `admin123`)
- baut und startet Next auf `0.0.0.0:3000`

Zugriff: `http://<SERVER_IP>:3000` · Login: `/login` · Admin: `/admin`

## Entwicklung (Dev)
```bash
npm ci
npm run dev
# http://localhost:3000
```

## Betrieb (Prod)
Manuell:
```bash
npm run build
npx next start -p 3000 -H 0.0.0.0
```
Nginx (optional Reverse Proxy mit TLS):
- Nginx vhost → Upstream `http://127.0.0.1:3000`
- TLS via Let’s Encrypt/Certbot

Cloudflare Tunnel (ohne offenen Port):
- `cloudflared` → Route öffentliche Domain → `http://127.0.0.1:3000`
- `NEXTAUTH_URL` auf die öffentliche URL setzen

## Datenbank & Migrationen
```bash
npx prisma generate
npx prisma db push
# Studio (optional):
npx prisma studio
```

## Admin‑Anleitung
- Benutzer: `/admin/users` (Rolle, Passwort setzen, 2FA verwalten)
- Sicherheit/2FA: `/admin/security` (Platzhalter; 2FA Logik in Users)
- Inhalte (Hero‑Texte): `/admin/content`
- Touren/Slots: `/admin` (Anlegen/Bearbeiten/Löschen, Uploads)
- Buchungen: `/admin/bookings` (Status/Payment)

Standard‑Login: `admin@example.com` · `admin123` (nach Start ändern!)
Passwort setzen per Einzeiler:
```bash
node -e "const{PrismaClient}=require('@prisma/client');(async()=>{const p=new PrismaClient();await p.user.update({where:{email:'admin@example.com'},data:{passwordHash:require('bcryptjs').hashSync('NEUESPASSWORT',10)}});console.log('Passwort geändert');await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})"
```

## API‑Endpunkte (Kurz)
- `GET /api/health` → { ok, db, users }
- `GET /api/tours` → Tourliste
- `GET /api/tours/[id]` → Tourdetails
- `POST /api/bookings` → Buchung anlegen (Gast/registriert)
- `GET/POST /api/auth/[...nextauth]` → NextAuth

## Medien‑Storage
Konfiguriert über `STORAGE_BACKEND` (siehe `.env`). Lokal speichert unter `public/uploads/` (mit Resize/WebP). S3/Cloudinary optional.

## Sicherheit
- Starke Passwörter; Admin‑Passwort direkt ändern
- `NEXTAUTH_URL` korrekt setzen (LAN/Domain)
- Optional 2FA per TOTP (Implementierung in `app/admin/users`)
- Firewall/UFW: nur notwendige Ports (3000 oder 80/443 via Proxy)

## Logging, Monitoring, Health
- Health: `GET /api/health`
- Next.js Logs im Prozess/PM2/Journalctl
- Optional: Nginx/Cloudflare Logs

## Backups
- SQLite‑Datei sichern (in `.env`: `DATABASE_URL`) – am besten Service vorher stoppen
- Uploads: `public/uploads/` mitsichern

## Troubleshooting
Nach Themen gruppiert – jeweils mit Symptomen, Ursache, Diagnose und Fix.

### 1) Environment/Config
- Symptom: „Environment variable not found: DATABASE_URL“
  - Ursache: `.env` fehlt oder key fehlt
  - Diagnose: `grep -n DATABASE_URL .env*`; `npx prisma generate`
  - Fix: `.env` anlegen; `DATABASE_URL` setzen; `npx prisma db push`
- Symptom: Login schlägt ohne Fehler fehl
  - Ursache: Falsche `NEXTAUTH_URL` (LAN vs Domain); Cookies „falsch“
  - Diagnose: `echo $NEXTAUTH_URL`; `curl -I http://IP:3000/api/auth/csrf`
  - Fix: `NEXTAUTH_URL` korrekt setzen; Browser‑Cookies löschen; neu anmelden
- Symptom: Server Actions blockiert (CORS/Origin)
  - Ursache: forwarded Host nicht whitelisted
  - Diagnose: Browser‑Netzwerk‑Tab; 403/400 bei Action
  - Fix: In `next.config.ts` Origins erweitern oder App hinter korrektem Host betreiben

### 2) Datenbank (SQLite/Prisma)
- Symptom: „Unable to open the database file“
  - Ursache: relative `DATABASE_URL`, Verzeichnis nicht existent, Rechte fehlen
  - Diagnose: `echo $DATABASE_URL`; `ls -l $(dirname <sqlite-path>)`
  - Fix: absoluten Pfad setzen; Verzeichnis anlegen; Rechte prüfen; `npx prisma db push`
- Symptom: Migration/Schema passt nicht zur DB
  - Ursache: Schema geändert, DB nicht aktualisiert
  - Diagnose: `npx prisma generate` Meldungen; App‑Fehler bei Abfragen
  - Fix: `npx prisma db push`; ggf. Backup und Neuaufbau

### 3) Build/Next.js
- Symptom: Build bricht bei Admin‑Seiten/SSR ab
  - Ursache: DB‑Zugriff zur Build‑Zeit
  - Diagnose: Build‑Logs; Stacktrace zeigt Prisma im Build
  - Fix: `app/admin/layout.tsx` setzt `dynamic='force-dynamic'` und `revalidate=0`
- Symptom: Startfehler „required-server-files.json“/Manifest fehlt
  - Ursache: Server vor Build gestartet oder Output gelöscht
  - Diagnose: prüfen: `.next/` existiert?
  - Fix: `npm run build` erneut; dann `npx next start`

### 4) Auth/NextAuth
- Symptom: „CSRF token mismatch“/„Callback URL mismatch“
  - Ursache: Falsche `NEXTAUTH_URL`/Proxy‑Header
  - Diagnose: `curl -I http://IP:3000/api/auth/csrf`
  - Fix: `NEXTAUTH_URL` korrigieren; bei Proxy `X-Forwarded-*` setzen
- Symptom: Passwort korrekt, dennoch kein Login
  - Ursache: Admin nicht vorhanden oder Hash anders
  - Diagnose: `node -e` Prisma‑Einzeiler (User prüfen)
  - Fix: Admin via Seed/Einzeiler upserten; Passwort neu setzen

### 5) Uploads/Bilder
- Symptom: Upload schlägt leise fehl
  - Ursache: MIME nicht erlaubt; >5MB; fehlende Storage‑ENV
  - Diagnose: Admin‑Form Rückmeldung; Server‑Logs
  - Fix: erlaubten Typ/JPG/PNG/WebP nutzen; <5MB; Storage‑ENV setzen (S3/Cloudinary)
- Symptom: Bilder werden nicht angezeigt
  - Ursache: Next Image remotePatterns fehlen
  - Diagnose: `next.config.ts` images‑Konfig prüfen
  - Fix: passende `remotePatterns` ergänzen

### 6) Netzwerk/Firewall/Proxy
- Symptom: LAN‑Clients erreichen Seite nicht
  - Ursache: Server bindet auf 127.0.0.1; UFW blockt Port
  - Diagnose: `ss -tulpn | grep 3000`; `sudo ufw status`
  - Fix: `-H 0.0.0.0` starten; UFW Port 3000 freigeben
- Symptom: Hinter Nginx 502/404
  - Ursache: falscher upstream/host header
  - Diagnose: Nginx‑Logs; Upstream Check
  - Fix: proxy_pass auf `http://127.0.0.1:3000`; `proxy_set_header Host $host;`

### 7) OS/Dateirechte
- Symptom: „EACCES: permission denied“ bei SQLite/Uploads
  - Ursache: falsche Owner/Rechte
  - Diagnose: `ls -la prisma/ public/uploads`
  - Fix: `chown -R <user>:<group>`; `chmod` ausreichend

### 8) Performance
- Symptom: Erste Anfrage langsam
  - Ursache: Cold start, DB‑Warming
  - Fix: Warmup‑Ping (Health‑Check), Caching (revalidate), Ressourcen prüfen
- Symptom: Bilder groß/langsam
  - Ursache: Originalgröße/keine Komprimierung
  - Fix: Upload‑Resize aktiv; WebP; CDN/Proxy‑Cache nutzen

### 9) Backups/Wiederherstellung
- Symptom: DB korrupt
  - Ursache: Crash beim Schreiben
  - Diagnose: `sqlite3 dev.db "PRAGMA integrity_check;"`
  - Fix: Restore aus Backup; Downtime‑Backup: Dienst stoppen, Datei kopieren

### 10) Sonstiges
- Symptom: 404 auf `/api/health`
  - Ursache: Build/Start nicht durchgelaufen
  - Fix: `npm run build && npx next start`
- Symptom: „Cannot specify encType…“ (React Warning)
  - Ursache: encType bei Server Actions
  - Fix: `encType` entfernen (bereits erledigt)

## Wartung & Updates
- Dependencies aktualisieren (vorsichtig): `npm outdated`, dann selektiv `npm i <pkg>@latest`
- Prisma: Schema ändern → `npx prisma db push`
- App neu bauen/starten

## Lizenz
MIT
