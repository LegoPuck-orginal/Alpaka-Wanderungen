<x-app-layout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Reviews verwalten</h1>
                <p class="mt-2 text-gray-600">Aktuell sichtbare Reviews: {{ $visibleCount }} / 5</p>
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
            <h2 class="text-xl font-semibold text-gray-900">Neue Review anlegen</h2>
            <form method="POST" action="{{ route('admin.reviews.store') }}" class="mt-6 grid gap-6 md:grid-cols-2">
                @csrf
                <div>
                    <label for="name" class="block text-sm font-semibold text-gray-700">Name</label>
                    <input type="text" id="name" name="name" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required />
                </div>
                <div>
                    <label for="rating" class="block text-sm font-semibold text-gray-700">Bewertung</label>
                    <select id="rating" name="rating" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        @for ($i = 5; $i >= 1; $i--)
                            <option value="{{ $i }}">{{ $i }} Sterne</option>
                        @endfor
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="text" class="block text-sm font-semibold text-gray-700">Text</label>
                    <textarea id="text" name="text" rows="4" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required></textarea>
                </div>
                <div class="md:col-span-2 flex items-center justify-between">
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" name="is_visible" value="1" class="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                        Sofort sichtbar (max. 5)
                    </label>
                    <button type="submit" class="inline-flex items-center rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600">Review speichern</button>
                </div>
            </form>
        </section>

        <section>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Vorhandene Reviews</h2>
            <div class="space-y-4">
                @forelse ($reviews as $review)
                    <article class="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p class="text-sm text-gray-500">Position {{ $review->position }}</p>
                                <h3 class="text-lg font-semibold text-gray-900">{{ $review->name }}</h3>
                                <p class="text-sm text-amber-600">Bewertung: {{ $review->rating }} / 5</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <form method="POST" action="{{ route('admin.reviews.reorder', $review) }}">
                                    @csrf
                                    <input type="hidden" name="direction" value="up">
                                    <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-gray-400">▲ Hoch</button>
                                </form>
                                <form method="POST" action="{{ route('admin.reviews.reorder', $review) }}">
                                    @csrf
                                    <input type="hidden" name="direction" value="down">
                                    <button type="submit" class="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-gray-400">▼ Runter</button>
                                </form>
                                <form method="POST" action="{{ route('admin.reviews.toggle', $review) }}">
                                    @csrf
                                    <button type="submit" class="inline-flex items-center rounded-md {{ $review->is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600' }} px-3 py-1 text-xs font-semibold">
                                        {{ $review->is_visible ? 'Sichtbar' : 'Versteckt' }}
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.reviews.destroy', $review) }}" onsubmit="return confirm('Review wirklich löschen?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-200">Löschen</button>
                                </form>
                            </div>
                        </header>
                        <form method="POST" action="{{ route('admin.reviews.update', $review) }}" class="mt-4 space-y-4">
                            @csrf
                            @method('PATCH')
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-500">Name</label>
                                    <input type="text" name="name" value="{{ old('name', $review->name) }}" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-500">Bewertung</label>
                                    <select name="rating" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                                        @for ($i = 5; $i >= 1; $i--)
                                            <option value="{{ $i }}" @selected($review->rating == $i)>{{ $i }} Sterne</option>
                                        @endfor
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-500">Text</label>
                                <textarea name="text" rows="4" class="mt-1 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" required>{{ old('text', $review->text) }}</textarea>
                            </div>
                            <div class="flex justify-end">
                                <button type="submit" class="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Änderungen speichern</button>
                            </div>
                        </form>
                    </article>
                @empty
                    <p class="text-gray-500">Es wurden noch keine Reviews angelegt.</p>
                @endforelse
            </div>
        </section>
    </div>
</x-app-layout>
