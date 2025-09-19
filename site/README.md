# Alpaka-Wanderungen – Setup & Betrieb

Next.js 15 (App Router) + Prisma (SQLite) + NextAuth (Credentials). Dieses README führt dich von 0 auf produktiv – lokal, im LAN oder über Cloudflare Tunnel.

Inhalte:
- Voraussetzungen
- Lokale Entwicklung
- Environment Variablen (.env)
- Datenbank (Prisma/SQLite)
- Build & Start
- Betrieb: nur im LAN, optional Cloudflare Zero Trust
- Prozessmanager (PM2)
- Firewall (UFW)
- Admin-User anlegen / Passwort setzen
- Troubleshooting

## Voraussetzungen
- Node.js 22.x, npm
- Ubuntu/Debian Server (oder Dev-Container)
- Git

## Lokale Entwicklung
```bash
cd site
npm ci
npm run dev
# Öffne: http://localhost:3000
```

Optional schnellerer Dev-Server (Turbopack):
```bash
npm run dev -- --turbo
```

## Environment Variablen (.env)
Lege im Ordner `site/` eine `.env` an. Für LAN-Betrieb trage die LAN-IP deines Servers ein.

Beispiel LAN (.env und .env.production):
```env
NODE_ENV=production
DATABASE_URL="file:/root/alpaka/site/prisma/data.db" # absoluter Pfad auf Server
NEXTAUTH_URL=http://192.168.188.39:3000              # LAN-IP:Port
NEXTAUTH_SECRET=<GEHEIMES_TOKEN>
```
Secret erzeugen:
```bash
openssl rand -base64 32
```

Hinweise:
- Prisma CLI liest `.env`. Next.js Build liest `.env`, `.env.production`, `.env.local`.
- Bei Änderung von `NEXTAUTH_URL` Cookies im Browser löschen.

## Datenbank (Prisma/SQLite)
```bash
cd site
npx prisma generate
npx prisma db push
# legt die Datei unter prisma/data.db an (bei obiger DATABASE_URL absolut)
```

## Build & Start (Produktion)
```bash
cd site
npm run build
npx next start -p 3000 -H 0.0.0.0   # im LAN erreichbar
# Test
curl -I http://127.0.0.1:3000
```

## Betrieb: LAN-only oder über Cloudflare Tunnel

Variante A – nur im LAN erreichbar:
- `NEXTAUTH_URL` auf `http://LAN-IP:3000`
- App mit `-H 0.0.0.0` starten
- UFW für Port 3000 nur aus deinem Subnetz erlauben

Variante B – lokal laufend, extern nur via Cloudflare Zero Trust:
- `NEXTAUTH_URL` auf deine Domain (z. B. `https://alpaka.example.com`)
- App auf `127.0.0.1` binden
- UFW alle eingehenden Ports blocken
- `cloudflared` Tunnel auf `http://127.0.0.1:3000` konfigurieren

## Prozessmanager (PM2)
```bash
sudo npm i -g pm2
cd site
pm2 start "npm start -- -p 3000 -H 0.0.0.0" --name alpaka
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME"
# Logs
pm2 logs alpaka
```

## Firewall (UFW)
Nur SSH aus dem LAN erlauben, 3000 nur fürs LAN freigeben:
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.188.0/24 to any port 22 proto tcp
sudo ufw allow from 192.168.188.0/24 to any port 3000 proto tcp
sudo ufw deny 80/tcp
sudo ufw deny 443/tcp
sudo ufw --force enable
sudo ufw status
```

## Admin-User anlegen / Passwort setzen
Schnellstart (setzt/erstellt `admin@example.com` mit `admin123`):
```bash
node -e "const{PrismaClient}=require('@prisma/client');const b=require('bcryptjs');(async()=>{const p=new PrismaClient();const hash=await b.hash('admin123',10);await p.user.upsert({where:{email:'admin@example.com'},update:{passwordHash:hash,role:'admin'},create:{email:'admin@example.com',passwordHash:hash,role:'admin'}});console.log('Admin bereit');await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})"
```

2FA (TOTP) vorübergehend deaktivieren:
```bash
node -e "const{PrismaClient}=require('@prisma/client');(async()=>{const p=new PrismaClient();await p.user.update({where:{email:'admin@example.com'},data:{twoFactorEnabled:false,twoFactorSecret:null}});console.log('2FA aus');await p.$disconnect()})().catch(e=>{console.error(e);process.exit(1)})"
```

## Troubleshooting
- Fehler „Environment variable not found: DATABASE_URL“: `.env` fehlt oder falscher Pfad in `DATABASE_URL`.
- Fehler „Unable to open the database file“: Pfad absolut setzen und `npx prisma db push` ausführen; Verzeichnisrechte prüfen.
- Build bricht ab, weil Admin-Seiten die DB beim Build abfragen: In `app/admin/layout.tsx` einmalig definieren:
	```ts
	export const dynamic = 'force-dynamic';
	export const revalidate = 0;
	export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
	```
- Login schlägt fehl:
	- `NEXTAUTH_URL` prüfen, Cookies löschen
	- Admin-Passwort neu setzen (siehe oben)
	- 2FA deaktivieren (siehe oben)
	- API-Check: `curl -I http://LAN-IP:3000/api/auth/csrf` (200 erwartet)

## Lizenz
Interne Projektunterlagen. Falls du veröffentlichen willst, bitte Lizenz ergänzen.
