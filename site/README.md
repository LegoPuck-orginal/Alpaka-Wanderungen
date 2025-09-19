
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
- „Unable to open the database file“ → `DATABASE_URL` absolut + `npx prisma db push`; Verzeichnisrechte prüfen
- Login scheitert → `NEXTAUTH_URL` auf LAN/Domain setzen, Browser‑Cookies löschen, Passwort neu setzen
- Build bricht mit Admin‑Seiten ab → `app/admin/layout.tsx` ist bereits dynamisch (kein Prerender)
- 404 auf `/api/health` → Build/Start prüfen, Route existiert unter `app/api/health/route.ts`

## Wartung & Updates
- Dependencies aktualisieren (vorsichtig): `npm outdated`, dann selektiv `npm i <pkg>@latest`
- Prisma: Schema ändern → `npx prisma db push`
- App neu bauen/starten

## Lizenz
MIT
