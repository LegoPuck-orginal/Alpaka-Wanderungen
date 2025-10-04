<p align="center"><img src="/public/logo.svg" alt="Alpaka Wanderungen" width="180"></p>

# Alpaka Wanderungen (Laravel)

Dies ist der Laravel‑Teil der Anwendung. Alle Projektinfos findest du in der README im Repository‑Root; hier sind die wichtigsten Kurzbefehle für das Arbeiten im `site/`‑Ordner zusammengefasst.

## Setup
```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

## Entwicklung starten
- PHP-Server & Vite zusammen: `composer dev`
- Nur PHP-Server: `php artisan serve`
- Vite einzeln: `npm run dev`

## Nützliche Artisan-Befehle
- `php artisan migrate:fresh --seed` – Datenbank zurücksetzen
- `php artisan reviews:send-requests --dry` – Review-Mails simulieren
- `php artisan test` – vollständige Testsuite

## Tests & Qualität
- PHPUnit: `php artisan test`
- Laravel Pint (optional): `./vendor/bin/pint`

Weitere Details zu Architektur, Featureübersicht und Deployment stehen in der Projektbeschreibung auf Root-Ebene.
