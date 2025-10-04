<x-app-layout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Touren verwalten</h1>
                <p class="mt-2 text-gray-600">Lege neue Touren an oder passe bestehende Angaben an.</p>
            </div>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center text-sm text-amber-600 hover:text-amber-700">Zurück zum Dashboard</a>
        </div>

        @if ($errors->any())
            <div class="space-y-2">
                @foreach ($errors->all() as $error)
                    <div class="rounded-md bg-red-50 p-3 text-red-700 text-sm">{{ $error }}</div>
                @endforeach
            </div>
        @endif

        @if (session('status'))
            <div class="rounded-md bg-green-50 p-3 text-green-700 text-sm">{{ session('status') }}</div>
        @endif

        <section class="bg-white border border-gray-200 rounded-3xl shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900">Neue Tour erstellen</h2>
            <form method="POST" action="{{ route('admin.tours.store') }}" class="mt-6 grid gap-6 md:grid-cols-2">
                @csrf
                <div>
                    <label class="block text-sm font-semibold text-gray-700">Titel</label>
                    <input type="text" name="title" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700">Dauer (Minuten)</label>
                    <input type="number" name="duration_min" min="30" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700">Kapazität</label>
                    <input type="number" name="capacity" min="1" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700">Preis (in Cent)</label>
                    <input type="number" name="price_cents" min="0" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700">Beschreibung</label>
                    <textarea name="description" rows="4" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required></textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700">Bild-URL</label>
                    <input type="url" name="image_url" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700">Bildbeschreibung</label>
                    <input type="text" name="image_alt" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                </div>
                <div class="md:col-span-2 flex justify-end">
                    <button type="submit" class="inline-flex items-center rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600">Tour anlegen</button>
                </div>
            </form>
        </section>

        <section>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Bestehende Touren</h2>
            <div class="space-y-6">
                @forelse ($tours as $tour)
                    <article class="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">{{ $tour->title }}</h3>
                                <p class="text-sm text-gray-500">{{ $tour->upcoming_slots_count }} kommende Termine</p>
                            </div>
                            <form method="POST" action="{{ route('admin.tours.destroy', $tour) }}" onsubmit="return confirm('Tour wirklich löschen?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-200">Löschen</button>
                            </form>
                        </header>
                        <form method="POST" action="{{ route('admin.tours.update', $tour) }}" class="mt-4 grid gap-6 md:grid-cols-2">
                            @csrf
                            @method('PATCH')
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Titel</label>
                                <input type="text" name="title" value="{{ old('title', $tour->title) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Dauer (Minuten)</label>
                                <input type="number" name="duration_min" value="{{ old('duration_min', $tour->duration_min) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Kapazität</label>
                                <input type="number" name="capacity" value="{{ old('capacity', $tour->capacity) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Preis (in Cent)</label>
                                <input type="number" name="price_cents" value="{{ old('price_cents', $tour->price_cents) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-semibold text-gray-500">Beschreibung</label>
                                <textarea name="description" rows="4" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">{{ old('description', $tour->description) }}</textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Bild-URL</label>
                                <input type="url" name="image_url" value="{{ old('image_url', $tour->image_url) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Bildbeschreibung</label>
                                <input type="text" name="image_alt" value="{{ old('image_alt', $tour->image_alt) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            </div>
                            <div class="md:col-span-2 flex justify-end">
                                <button type="submit" class="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Änderungen speichern</button>
                            </div>
                        </form>
                    </article>
                @empty
                    <p class="text-gray-500">Es sind noch keine Touren angelegt.</p>
                @endforelse
            </div>
        </section>
    </div>
</x-app-layout>
