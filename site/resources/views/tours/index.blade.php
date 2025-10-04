<x-app-layout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
                <h1 class="text-4xl font-bold text-gray-900">Tourenübersicht</h1>
                <p class="mt-2 text-gray-600">Stöbere durch unser aktuelles Angebot an Alpaka-Wanderungen.</p>
            </div>
            <a href="{{ route('calendar.index') }}" class="inline-flex items-center rounded-md border border-amber-500 px-5 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50">Kalender anzeigen</a>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
            @forelse($tours as $tour)
                <article class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    @if ($tour->images->isNotEmpty())
                        <img src="{{ $tour->images->first()->url }}" alt="{{ $tour->images->first()->alt ?? $tour->title }}" class="h-56 w-full object-cover">
                    @endif
                    <div class="p-6 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-semibold text-gray-900">{{ $tour->title }}</h2>
                            <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{{ $tour->upcoming_slots_count }} Termine</span>
                        </div>
                        <p class="mt-3 text-gray-600 leading-relaxed">{{ \Illuminate\Support\Str::limit($tour->description, 220) }}</p>
                        <dl class="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <dt class="font-semibold text-gray-900">Dauer</dt>
                                <dd>{{ $tour->duration_min }} Minuten</dd>
                            </div>
                            <div>
                                <dt class="font-semibold text-gray-900">Kapazität</dt>
                                <dd>{{ $tour->capacity }} Personen</dd>
                            </div>
                            <div>
                                <dt class="font-semibold text-gray-900">Preis</dt>
                                <dd>{{ number_format($tour->price_cents / 100, 2, ',', '.') }} €</dd>
                            </div>
                        </dl>
                        <div class="mt-auto pt-6 flex justify-end">
                            <a href="{{ route('tours.show', $tour) }}" class="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600">Zur Tour</a>
                        </div>
                    </div>
                </article>
            @empty
                <p class="text-gray-500">Keine Touren gefunden.</p>
            @endforelse
        </div>
    </div>
</x-app-layout>
