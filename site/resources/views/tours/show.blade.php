<x-app-layout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2">
                <a href="{{ route('tours.index') }}" class="inline-flex items-center text-sm text-amber-600 hover:text-amber-700">
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7 7-7" />
                    </svg>
                    Zurück zur Übersicht
                </a>
                <h1 class="mt-4 text-4xl font-bold text-gray-900">{{ $tour->title }}</h1>
                <p class="mt-4 text-lg text-gray-700 leading-relaxed">{{ $tour->description }}</p>

                <dl class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <dt class="text-sm text-gray-500">Dauer</dt>
                        <dd class="mt-2 text-xl font-semibold text-gray-900">{{ $tour->duration_min }} Minuten</dd>
                    </div>
                    <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <dt class="text-sm text-gray-500">Kapazität</dt>
                        <dd class="mt-2 text-xl font-semibold text-gray-900">{{ $tour->capacity }} Personen</dd>
                    </div>
                    <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <dt class="text-sm text-gray-500">Preis pro Person</dt>
                        <dd class="mt-2 text-xl font-semibold text-gray-900">{{ number_format($tour->price_cents / 100, 2, ',', '.') }} €</dd>
                    </div>
                </dl>

                @if ($tour->images->isNotEmpty())
                    <div class="mt-10 grid sm:grid-cols-2 gap-4">
                        @foreach ($tour->images as $image)
                            <img src="{{ $image->url }}" alt="{{ $image->alt ?? $tour->title }}" class="rounded-2xl object-cover h-56 w-full">
                        @endforeach
                    </div>
                @endif
            </div>

            <div class="lg:col-span-1">
                <div class="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 sticky top-24">
                    <h2 class="text-2xl font-semibold text-gray-900">Termine & Buchung</h2>

                    @if (session('status'))
                        <div class="mt-4 rounded-md bg-green-50 p-4 text-green-800 text-sm">
                            {{ session('status') }}
                        </div>
                    @endif

                    @foreach ((array) session('warnings') as $warning)
                        <div class="mt-3 rounded-md bg-amber-50 p-3 text-amber-700 text-sm flex items-start gap-2">
                            <span class="text-lg">⚠️</span>
                            <span>{{ $warning }}</span>
                        </div>
                    @endforeach

                    @if ($errors->any())
                        <div class="mt-4 space-y-2">
                            @foreach ($errors->all() as $error)
                                <div class="rounded-md bg-red-50 p-3 text-red-700 text-sm">{{ $error }}</div>
                            @endforeach
                        </div>
                    @endif

                    <div class="mt-6 space-y-4">
                        @if ($slots->isEmpty())
                            <p class="text-gray-500 text-sm">Aktuell sind keine Termine verfügbar. Schau später erneut vorbei oder kontaktiere uns direkt.</p>
                        @else
                            @foreach ($slots as $slotData)
                                @php($slot = $slotData['model'])
                                <div class="border border-gray-200 rounded-2xl p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm text-gray-500">{{ $slot->start->translatedFormat('l, d.m.Y') }}</p>
                                            <p class="text-lg font-semibold text-gray-900">{{ $slot->start->format('H:i') }} - {{ $slot->end->format('H:i') }} Uhr</p>
                                        </div>
                                        <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{{ $slotData['remaining'] }} Plätze frei</span>
                                    </div>

                                    @auth
                                        <form method="POST" action="{{ route('tours.bookings.store', ['tour' => $tour, 'slot' => $slot]) }}" class="mt-4 space-y-3">
                                            @csrf
                                            <div>
                                                <label for="persons-{{ $slot->id }}" class="block text-sm font-medium text-gray-700">Personen</label>
                                                <input type="number" id="persons-{{ $slot->id }}" name="persons" min="1" max="50" required value="{{ old('persons', 2) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                                            </div>
                                            <div>
                                                <label for="contact_email-{{ $slot->id }}" class="block text-sm font-medium text-gray-700">Kontakt-E-Mail</label>
                                                <input type="email" id="contact_email-{{ $slot->id }}" name="contact_email" required value="{{ old('contact_email', auth()->user()->email) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                                            </div>
                                            <button type="submit" class="w-full inline-flex justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">Buchung anfragen</button>
                                        </form>
                                    @else
                                        <p class="mt-4 text-sm text-gray-600">Bitte <a href="{{ route('login') }}" class="text-amber-600 font-semibold">melde dich an</a>, um eine Buchung anzufragen.</p>
                                    @endauth
                                </div>
                            @endforeach
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
