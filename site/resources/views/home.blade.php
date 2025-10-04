<x-app-layout>
    <section class="bg-gradient-to-r from-amber-50 to-orange-100 py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-wide text-amber-600">Alpaka-Wanderungen</p>
                    <h1 class="mt-3 text-4xl sm:text-5xl font-bold text-gray-900">{{ $heroTitle }}</h1>
                    <p class="mt-6 text-lg text-gray-700 leading-relaxed">{{ $heroSubtitle }}</p>
                    <div class="mt-8 flex flex-wrap gap-4">
                        <a href="{{ route('tours.index') }}" class="inline-flex items-center justify-center rounded-md bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                            Verfügbare Touren ansehen
                        </a>
                        <a href="{{ route('calendar.index') }}" class="inline-flex items-center justify-center rounded-md border border-amber-500 px-6 py-3 text-base font-semibold text-amber-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                            Kalender öffnen
                        </a>
                    </div>
                </div>
                <div class="relative">
                    <div class="absolute inset-0 -skew-y-3 bg-amber-300/50 rounded-3xl"></div>
                    <div class="relative bg-white rounded-3xl shadow-lg overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1542365885-bc9df25ebdf4?auto=format&fit=crop&w=900&q=80" alt="Gruppe mit Alpakas" class="w-full h-72 object-cover">
                        <div class="p-6">
                            <p class="text-sm uppercase tracking-wide text-amber-600">Perfekt für Teams & Familien</p>
                            <p class="mt-2 text-gray-700">Geführte Touren mit liebevollen Alpakas, inklusive Einführung, Fotopausen und regionalen Snacks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-3xl font-bold text-gray-900">Unsere Touren</h2>
                <a href="{{ route('tours.index') }}" class="text-amber-600 hover:text-amber-700">Alle Touren</a>
            </div>
            <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                @forelse ($tours as $tour)
                    <article class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        @if ($tour->images->isNotEmpty())
                            <img src="{{ $tour->images->first()->url }}" alt="{{ $tour->images->first()->alt ?? $tour->title }}" class="h-48 w-full object-cover">
                        @endif
                        <div class="p-6 flex-1 flex flex-col">
                            <h3 class="text-xl font-semibold text-gray-900">{{ $tour->title }}</h3>
                            <p class="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">{{ \Illuminate\Support\Str::limit($tour->description, 160) }}</p>
                            <dl class="mt-4 space-y-1 text-sm text-gray-500">
                                <div class="flex justify-between"><dt>Dauer</dt><dd>{{ $tour->duration_min }} Minuten</dd></div>
                                <div class="flex justify-between"><dt>Kapazität</dt><dd>{{ $tour->capacity }} Personen</dd></div>
                                <div class="flex justify-between"><dt>Preis</dt><dd>{{ number_format($tour->price_cents / 100, 2, ',', '.') }} €</dd></div>
                            </dl>
                            <div class="mt-6 flex items-center justify-between">
                                <span class="text-xs font-medium text-amber-600 uppercase tracking-wide">{{ $tour->upcoming_slots_count }} kommende Termine</span>
                                <a href="{{ route('tours.show', $tour) }}" class="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold">
                                    Details ansehen
                                    <svg class="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </article>
                @empty
                    <p class="text-gray-500">Aktuell sind keine Touren verfügbar.</p>
                @endforelse
            </div>
        </div>
    </section>

    <section class="bg-amber-50 py-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                    <p class="text-sm uppercase font-semibold text-amber-600">Erfahrungen</p>
                    <h2 class="text-3xl font-bold text-gray-900">Das sagen unsere Gäste</h2>
                </div>
                <a href="{{ route('reviews.create') }}" class="inline-flex items-center rounded-md bg-white px-5 py-2 text-sm font-semibold text-amber-600 shadow hover:bg-amber-100">Eigene Bewertung abgeben</a>
            </div>
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                @forelse ($reviews as $review)
                    <blockquote class="bg-white rounded-2xl shadow p-6 flex flex-col">
                        <div class="flex items-center gap-1 text-amber-400">
                            @for ($i = 0; $i < $review->rating; $i++)
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            @endfor
                        </div>
                        <p class="mt-4 text-gray-700 leading-relaxed">{{ $review->text }}</p>
                        <footer class="mt-6 text-sm font-semibold text-gray-900">{{ $review->name }}</footer>
                    </blockquote>
                @empty
                    <p class="text-gray-500">Noch keine Bewertungen vorhanden.</p>
                @endforelse
            </div>
        </div>
    </section>
</x-app-layout>
