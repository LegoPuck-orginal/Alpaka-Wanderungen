
# Alpaka-Wanderungen – Quickstart & Betrieb

**Next.js 15 (App Router) + Prisma (SQLite) + NextAuth (Credentials).**

## Schnellstart (empfohlen)

```bash
cd /pfad/zu/Alpaka-Wanderungen/site
npm ci
npm run quickstart
```

- Erstellt `.env` und initialisiert die Datenbank.
- Legt einen Admin-User an (`admin@example.com` / `admin123`).
- Baut und startet die App auf `0.0.0.0:3000`.

## Zugriff
- App: `http://<SERVER_IP>:3000`
- Login: `http://<SERVER_IP>:3000/login`
- Admin: `http://<SERVER_IP>:3000/admin`

## Login-Daten (Standard)
- E-Mail: `admin@example.com`
- Passwort: `admin123`
- Ändere das Passwort nach dem ersten Login im Admin-Bereich!

## Health-Check
Prüfe, ob die App und Datenbank laufen:
```bash
curl -sS http://<SERVER_IP>:3000/api/health
```
Erwartet: `{ "ok": true, "db": true, "users": 1 }`

## Environment (.env)
Wird automatisch angelegt. Prüfe ggf.:
```
NODE_ENV=production
DATABASE_URL="file:/absoluter/pfad/zur/prisma/data.db"
NEXTAUTH_URL="http://<SERVER_IP>:3000"
NEXTAUTH_SECRET=<GEHEIM>
```

## Datenbank (Prisma/SQLite)
```bash
npx prisma generate
npx prisma db push
```

## Build & Start (manuell)
```bash
npm run build
npx next start -p 3000 -H 0.0.0.0
```

## LAN-Betrieb
- Setze `NEXTAUTH_URL` auf deine LAN-IP.
- Firewall öffnen:
```bash
sudo ufw allow 3000/tcp
```

## Admin-User anlegen / Passwort setzen
```bash
node -e "const{PrismaClient}=require('@prisma/client');(async()=>{const p=new PrismaClient();await p.user.update({where:{email:'admin@example.com'},data:{passwordHash:require('bcryptjs').hashSync('NEUESPASSWORT',10)}});console.log('Passwort geändert');await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})"
```

## Troubleshooting
- **Fehler 'Unable to open the database file':**
  - Prüfe, ob `DATABASE_URL` absolut ist und das Verzeichnis existiert.
  - Führe `npx prisma db push` aus.
- **Login schlägt fehl:**
  - Prüfe `NEXTAUTH_URL` und lösche Browser-Cookies.
  - Setze das Admin-Passwort neu (siehe oben).
- **Health-Check schlägt fehl:**
  - Prüfe DB-Pfad und Rechte.
  - Starte die App im Vordergrund, um Logs zu sehen.

## Lizenz
MIT

---

**Fragen?**
- LAN-Setup, Cloudflare-Tunnel, PM2, UFW, Admin-Reset: Siehe README oder frage nach weiteren Details!
