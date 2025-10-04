<p align="center"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/1%20Stacked/2%20Red/laravel-logolockup-red.svg" alt="Laravel" width="320"></p>

# Alpaka‑Wanderungen – Laravel Neuaufbau

**Tourenverwaltung, Buchungssystem und Review-Workflow – komplett in Laravel 12 umgesetzt.**

## Überblick
- ✨ Geführte Alpaka-Touren mit Slots, Kapazitäten und Preisangaben
- 🧾 Buchungen mit eindeutigen Codes, Statusverwaltung und Zahlungsbelegen
- 🛡️ Authentifizierung via Laravel Breeze (Blade + Tailwind)
- 🐾 Admin-Backend für Touren, Buchungen und Reviews
- 💬 Automatisierte Review-Anfragen inkl. E-Mail-Template & Artisan-Command
- 📅 Öffentlicher Kalender mit Verfügbarkeiten und Warnhinweisen

Der frühere Next.js-Stack wurde ins Verzeichnis `legacy/` verschoben und dient nur noch als Referenz für das ursprüngliche Prisma-Schema.

## Technischer Stack
- **Backend:** PHP 8.3 · Laravel 12 · Eloquent (SQLite)
- **Frontend:** Blade, Tailwind CSS, Alpine.js, Vite
- **Auth:** Laravel Breeze mit Session-Login, optionale 2FA-Felder vorbereitet
- **Queue & Mail:** Datenbank-Queue, Mailable `ReviewRequestMail`, Log-Mailer als Default
- **Tests:** PHPUnit (`php artisan test`) + dedizierter Capacity-Service-Test

## Projektstruktur (Auszug)
```
site/
  app/
    Console/Commands/SendReviewRequests.php
    Http/Controllers/{Home,Tour,Booking,Calendar,Review}.php
    Http/Controllers/Admin/{Dashboard,Booking,Review,Tour}Controller.php
    Mail/ReviewRequestMail.php
    Models/{User,Tour,EventSlot,Booking,Payment,Review,Content,PageView}.php
    Services/CapacityService.php
  database/
    factories/*.php
    migrations/*.php
    seeders/DatabaseSeeder.php
  resources/views/
    home.blade.php, calendar/, tours/, reviews/, admin/, emails/
  routes/web.php, routes/console.php, routes/auth.php
  tests/Unit/CapacityServiceTest.php
  composer.json, package.json, vite.config.js
```

## Setup & Quickstart
```bash
cd site
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev   # oder: composer dev (parallel Server, Queue, Logs, Vite)
```

- Admin-Login aus Seeder: `admin@alpaka-wanderungen.de` / `password` (sofort ändern!)
- Lokale Datenbank: `database/database.sqlite` (wird bei Migration erzeugt)
- Testlauf: `php artisan test`

## Wichtige Features im Detail

### Kapazitätslogik & Warnungen
- `App\Services\CapacityService`: berechnet Restplätze eines Slots inklusive Alpakakapazität
- Warnungen bei Überbuchung oder mehr Personen als Alpakas
- Genutzt in `BookingController`, `TourController`, `CalendarController`
- Unit-Test: `tests/Unit/CapacityServiceTest.php`

### Review-Workflow
- Öffentliche Seite `/review?code=ALP-XXXXX` (`ReviewController@create/store`)
- Admin-Moderation unter `/admin/reviews` inkl. Sichtbarkeit & Reihenfolge-Umschaltung
- Automatischer E-Mail-Versand nach Tourende: `php artisan reviews:send-requests`
  - Dry-Run mit `--dry`
  - Verwendet `App\Mail\ReviewRequestMail` und Markdown-Template `resources/views/emails/review-request.blade.php`

### Kalender & Buchungen
- Kalenderseite `/calendar` mit AJAX-Daten (`CalendarController@data`)
- Tourdetailseite `/tours/{tour}` zeigt Slots, Restplätze, Warnhinweise
- Buchung (`BookingController@store`) prüft Restkapazität, erzeugt individuellen Buchungscode und optional Zahlungsbeleg

### Admin-Dashboard
- Gate `access-admin` in `AppServiceProvider` (Rolle `admin`)
- Geschützte Routen unter `/admin`
- CRUD für Touren, Buchungen, Reviews (Blade-Formulare, Flash-Nachrichten)

### Content & Seed-Daten
- Key-Value-Inhalte (`Content`-Modell) für Startseiten-Texte
- Seeder erzeugt Demodaten (Touren, Slots, Buchungen, Reviews, PageViews) mit lokalisiertem Faker (`de_DE`)

## Konfiguration
- `.env` basiert auf `.env.example` (deutsche Locale, Europe/Berlin, Log-Mailer)
- Mail-Versand aktivieren: `MAIL_MAILER=smtp` + Zugangsdaten setzen
- Queue: `QUEUE_CONNECTION=database` (Migration `php artisan queue:table` optional, für Testbetrieb genügt `database` mit vorhandener `jobs`-Tabelle)
- Horizon/Worker optional, Standard-Setup nutzt `php artisan queue:listen`

## Betrieb
- **Entwicklung:** `composer dev` startet PHP-Server, Queue, Log-Tail sowie Vite gleichzeitig
- **Produktion:**
  - `php artisan config:cache && php artisan route:cache`
  - `php artisan migrate --force`
  - PHP-FPM oder `php artisan serve --host=0.0.0.0 --port=8000`
  - Vite-Build: `npm run build` und statische Assets via `public/build`
- **Cron für Review-E-Mails:** `0 10 * * * php /pfad/zur/artisan reviews:send-requests`

## Tests & Qualitätssicherung
- `php artisan test` – führt PHPUnit-Suite aus (inkl. Kapazitäts-Test)
- `php artisan migrate:fresh --seed` – Reset der Demodaten (z. B. vor Demos)
- `vendor/bin/pint` – Code-Style (optional)

## Backups & Migration von Alt-Daten
- SQLite-Datei `database/database.sqlite` sichern (App zuvor stoppen)
- Uploads liegen in `public/storage` (falls `php artisan storage:link` genutzt wird)
- Altdaten aus der Next.js-Version sind in `legacy/prisma/` dokumentiert

## Nützliche Artisan-Befehle
- `php artisan make:model Tour -m` – Beispiel zum Erstellen neuer Module
- `php artisan reviews:send-requests --dry` – zeigt anstehende Review-Mails ohne Versand
- `php artisan queue:listen` – verarbeitet Queue-Jobs (Review-Mails, zukünftige Tasks)

## Wartung & Updates
- Composer-Updates: `composer outdated` → gezielt aktualisieren, anschließend `php artisan test`
- Frontend-Abhängigkeiten: `npm outdated` → `npm upgrade`
- Env-Änderungen unbedingt per `php artisan config:clear` übernehmen

---

**Lizenz:** MIT · © Alpaka-Wanderungen
