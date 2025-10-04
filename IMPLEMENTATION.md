# Umsetzung & Feature-Status (Laravel-Version)

## 🚀 Neue Architektur
- Komplettumstieg auf **Laravel 12 (Blade + Breeze)**
- SQLite als Standard-Datenbank (ULIDs für alle Kern-Modelle)
- Tailwind + Alpine.js via Vite
- Queue- und Mail-Infrastruktur für Review-Erinnerungen

## ✅ Fertiggestellte Kernfeatures

### 1. Automatisierte Review-Anfragen
- **Dateien:**
  - `app/Console/Commands/SendReviewRequests.php`
  - `app/Mail/ReviewRequestMail.php`
  - `resources/views/emails/review-request.blade.php`
- **Funktionsweise:**
  - Findet bestätigte Buchungen, deren Slot seit ≥1 h beendet ist
  - Versendet Review-Mail (oder zeigt sie bei `--dry` nur an)
  - Setzt `review_requested_at`, damit keine Doppelversand erfolgt
- **Trigger:** `php artisan reviews:send-requests` (Cron-Eintrag empfohlen)

### 2. Intelligente Kapazitätsprüfung & Warnungen
- **Dateien:**
  - `app/Services/CapacityService.php`
  - `app/Http/Controllers/{Booking, Tour, Calendar}Controller.php`
  - `tests/Unit/CapacityServiceTest.php`
- **Details:**
  - Restplätze berechnen inkl. Tour-Kapazität als Alpaka-Limit
  - Warnungen bei zu vielen Personen oder knappen Restplätzen
  - Serverseitige Validierung verhindert Überbuchungen

### 3. Öffentlicher Kalender
- **Dateien:**
  - `app/Http/Controllers/CalendarController.php`
  - `resources/views/calendar/index.blade.php`
- **Features:**
  - Monatsübersicht mit AJAX-Reload (`/calendar/data`)
  - Tageskarten mit Slots, verbleibenden Plätzen & Tour-Name
  - Navigation per Query-Param `?month=&year=`

### 4. Review-System (Kunden + Admin)
- **Kundenseite:** `ReviewController@create/store/thankyou`, View `resources/views/reviews`
- **Admin:** `Admin\ReviewController` mit Sichtbarkeits- und Sortierlogik
- **Limits:** Max. 5 sichtbare Reviews; neue Einreichungen sind unsichtbar

### 5. Startseite & Content-Management
- Inhalts-Keys über `Content`-Modell (`homepage.hero.*`)
- Home-Seite zieht Touren, kommende Slots und Reviews
- Seeder liefert Beispieltexte & Daten

### 6. Admin-Dashboard & Ressourcenverwaltung
- Gate `access-admin` in `AppServiceProvider`
- Admin-Routen (`/admin`) für Touren, Buchungen, Reviews
- Übersichtliche KPI-Kacheln im Dashboard

## 🛠️ Datenmodell (Eloquent)
- `User`: Rollen (`user`/`admin`), optionale 2FA-Felder
- `Tour`: Beschreibung, Dauer, Preis, Kapazität, Bilder
- `EventSlot`: Tour-Zuordnung, Start/Ende, Kapazität
- `Booking`: Personen, Status, eindeutiger Code, `review_requested_at`
- `Payment`: Bezug zur Buchung, Betrag, Status
- `Review`: Text, Rating, Position, Sichtbarkeit
- `Content`: Key-Value-Texte
- `PageView`: einfache Tracking-Tabelle

## 🧪 Tests & Qualität
- `php artisan test` prüft Kapazitäts-Service (weitere Tests erweiterbar)
- Seeder (`DatabaseSeeder`) erzeugt realistische Demodaten mit `de_DE` Faker

## 🔄 Geplante/Optionale Weiterarbeit
- Mail-Transport auf produktives SMTP umstellen (`MAIL_MAILER=smtp`)
- Cronjob für `reviews:send-requests` in Deployment integrieren
- Erweiterte Testsuites für Controller & Form-Validierungen

---

Alle Kernanforderungen aus der ursprünglichen Next.js-Version sind in Laravel repliziert bzw. verbessert. Weitere technische Details siehe `README.md` im Projektroot.
