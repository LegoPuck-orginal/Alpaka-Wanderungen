<x-app-layout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold text-gray-900">Bewertung abgeben</h1>
        <p class="mt-3 text-gray-600">Teile deine Erfahrung nach der Wanderung mit uns. Der Buchungscode steht in deiner Bestätigungs-E-Mail.</p>

        @if ($errors->any())
            <div class="mt-6 space-y-2">
                @foreach ($errors->all() as $error)
                    <div class="rounded-md bg-red-50 p-3 text-red-700 text-sm">{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('reviews.store') }}" class="mt-8 space-y-6 bg-white border border-gray-200 rounded-3xl shadow p-8">
            @csrf
            <div>
                <label for="code" class="block text-sm font-semibold text-gray-700">Buchungscode</label>
                <input type="text" id="code" name="code" value="{{ old('code', $code) }}" required class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" placeholder="ALP-XXXXX">
            </div>
            <div class="grid sm:grid-cols-2 gap-6">
                <div>
                    <label for="name" class="block text-sm font-semibold text-gray-700">Dein Name</label>
                    <input type="text" id="name" name="name" value="{{ old('name') }}" required class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                </div>
                <div>
                    <label for="rating" class="block text-sm font-semibold text-gray-700">Bewertung</label>
                    <select id="rating" name="rating" class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        @for ($i = 5; $i >= 1; $i--)
                            <option value="{{ $i }}" @selected(old('rating') == $i)>{{ $i }} Sterne</option>
                        @endfor
                    </select>
                </div>
            </div>
            <div>
                <label for="text" class="block text-sm font-semibold text-gray-700">Dein Feedback</label>
                <textarea id="text" name="text" rows="6" required class="mt-2 w-full rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500" placeholder="Was hat dir besonders gefallen?">{{ old('text') }}</textarea>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">Deine Bewertung wird nach Prüfung veröffentlicht.</p>
                <button type="submit" class="inline-flex items-center rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                    Bewertung senden
                </button>
            </div>
        </form>
    </div>
</x-app-layout>
