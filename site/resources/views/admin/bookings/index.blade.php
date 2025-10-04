<x-app-layout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Buchungen</h1>
                <p class="mt-2 text-gray-600">Übersicht aller Anfragen mit Statusverwaltung.</p>
            </div>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center text-sm text-amber-600 hover:text-amber-700">Zurück zum Dashboard</a>
        </div>

        @if (session('status'))
            <div class="mb-6 rounded-md bg-green-50 p-4 text-green-800 text-sm">{{ session('status') }}</div>
        @endif

        <div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr class="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th class="px-4 py-3">Datum</th>
                        <th class="px-4 py-3">Tour</th>
                        <th class="px-4 py-3">Kunde</th>
                        <th class="px-4 py-3">Personen</th>
                        <th class="px-4 py-3">Kontakt</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3 text-right">Aktionen</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 text-sm text-gray-700">
                    @forelse ($bookings as $booking)
                        <tr>
                            <td class="px-4 py-4">
                                <div class="font-semibold text-gray-900">{{ $booking->slot->start->translatedFormat('d.m.Y H:i') }}</div>
                                <div class="text-xs text-gray-500">#{{ $booking->code }}</div>
                            </td>
                            <td class="px-4 py-4">
                                <div class="font-semibold text-gray-900">{{ $booking->slot->tour->title }}</div>
                            </td>
                            <td class="px-4 py-4">
                                <div class="font-semibold">{{ $booking->user->name }}</div>
                            </td>
                            <td class="px-4 py-4">{{ $booking->persons }}</td>
                            <td class="px-4 py-4">
                                <a href="mailto:{{ $booking->contact_email }}" class="text-amber-600 hover:text-amber-700">{{ $booking->contact_email }}</a>
                            </td>
                            <td class="px-4 py-4">
                                <form method="POST" action="{{ route('admin.bookings.update', $booking) }}" class="flex items-center gap-2">
                                    @csrf
                                    @method('PATCH')
                                    <select name="status" class="rounded-md border-gray-300 text-sm focus:border-amber-500 focus:ring-amber-500">
                                        @foreach ([\App\Models\Booking::STATUS_PENDING => 'Offen', \App\Models\Booking::STATUS_CONFIRMED => 'Bestätigt', \App\Models\Booking::STATUS_CANCELED => 'Storniert'] as $value => $label)
                                            <option value="{{ $value }}" @selected($booking->status === $value)> {{ $label }} </option>
                                        @endforeach
                                    </select>
                                    <button type="submit" class="inline-flex items-center rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600">Speichern</button>
                                </form>
                            </td>
                            <td class="px-4 py-4 text-right">
                                <form method="POST" action="{{ route('admin.bookings.destroy', $booking) }}" onsubmit="return confirm('Buchung wirklich löschen?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-xs font-semibold text-red-600 hover:text-red-700">Löschen</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-6 text-center text-gray-500">Keine Buchungen vorhanden.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-6">
            {{ $bookings->links() }}
        </div>
    </div>
</x-app-layout>
