<x-app-layout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div class="bg-white border border-gray-200 rounded-3xl shadow-lg p-12">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 class="mt-6 text-3xl font-bold text-gray-900">Vielen Dank!</h1>
            <p class="mt-4 text-gray-600">Wir haben deine Bewertung erhalten und melden uns, sobald sie veröffentlicht wurde.</p>
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="{{ route('home') }}" class="inline-flex items-center rounded-md bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600">Zur Startseite</a>
                <a href="{{ route('tours.index') }}" class="inline-flex items-center text-sm text-amber-600 hover:text-amber-700">Weitere Touren entdecken</a>
            </div>
        </div>
    </div>
</x-app-layout>
