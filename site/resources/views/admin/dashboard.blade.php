<x-app-layout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-center justify-between mb-10">
            <div>
                <h1 class="text-4xl font-bold text-gray-900">Admin-Dashboard</h1>
                <p class="mt-2 text-gray-600">Aktueller Überblick über Buchungen, Touren und Bewertungen.</p>
            </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p class="text-sm text-gray-500">Touren gesamt</p>
                <p class="mt-4 text-3xl font-bold text-gray-900">{{ $tourCount }}</p>
            </div>
            <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p class="text-sm text-gray-500">Kommende Termine</p>
                <p class="mt-4 text-3xl font-bold text-gray-900">{{ $upcomingSlots }}</p>
            </div>
            <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p class="text-sm text-gray-500">Offene Buchungen</p>
                <p class="mt-4 text-3xl font-bold text-gray-900">{{ $pendingBookings }}</p>
            </div>
            <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p class="text-sm text-gray-500">Bestätigte Buchungen</p>
                <p class="mt-4 text-3xl font-bold text-gray-900">{{ $confirmedBookings }}</p>
            </div>
            <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p class="text-sm text-gray-500">Sichtbare Reviews</p>
                <p class="mt-4 text-3xl font-bold text-gray-900">{{ $visibleReviews }}</p>
            </div>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-2">
            <a href="{{ route('admin.bookings.index') }}" class="block rounded-3xl border border-amber-200 bg-amber-50 p-6 hover:border-amber-300">
                <h2 class="text-xl font-semibold text-gray-900">Buchungen verwalten</h2>
                <p class="mt-2 text-sm text-gray-600">Alle Anfragen, Status und Details im Blick.</p>
            </a>
            <a href="{{ route('admin.reviews.index') }}" class="block rounded-3xl border border-amber-200 bg-amber-50 p-6 hover:border-amber-300">
                <h2 class="text-xl font-semibold text-gray-900">Bewertungen moderieren</h2>
                <p class="mt-2 text-sm text-gray-600">Einreichungen prüfen, veröffentlichen oder sortieren.</p>
            </a>
            <a href="{{ route('admin.tours.index') }}" class="block rounded-3xl border border-amber-200 bg-amber-50 p-6 hover:border-amber-300">
                <h2 class="text-xl font-semibold text-gray-900">Touren konfigurieren</h2>
                <p class="mt-2 text-sm text-gray-600">Beschreibung, Kapazitäten und Preise aktualisieren.</p>
            </a>
        </div>
    </div>
</x-app-layout>
