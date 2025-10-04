<x-app-layout>
    @php
        $current = \Carbon\Carbon::create($year, $month, 1);
        $prev = $current->copy()->subMonth();
        $next = $current->copy()->addMonth();
        $startOfCalendar = $current->copy()->startOfMonth()->startOfWeek();
        $endOfCalendar = $current->copy()->endOfMonth()->endOfWeek();
    @endphp
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
                <h1 class="text-4xl font-bold text-gray-900">Verfügbare Termine</h1>
                <p class="mt-2 text-gray-600">Finde den passenden Tag für deine Alpaka-Wanderung.</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('calendar.index', ['month' => $prev->month, 'year' => $prev->year]) }}" class="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    ← {{ $prev->translatedFormat('F Y') }}
                </a>
                <a href="{{ route('calendar.index', ['month' => $next->month, 'year' => $next->year]) }}" class="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {{ $next->translatedFormat('F Y') }} →
                </a>
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-3xl shadow overflow-hidden">
            <div class="grid grid-cols-7 bg-amber-50 text-xs font-semibold uppercase tracking-wide text-amber-700">
                @foreach (['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as $weekday)
                    <div class="px-4 py-3 text-center">{{ $weekday }}</div>
                @endforeach
            </div>
            <div class="grid grid-cols-7 divide-x divide-y divide-gray-200">
                @for ($date = $startOfCalendar->copy(); $date <= $endOfCalendar; $date->addDay())
                    @php
                        $key = $date->toDateString();
                        $slots = $calendar['days'][$key] ?? [];
                        $isCurrentMonth = $date->month === $current->month;
                        $isToday = $date->isToday();
                    @endphp
                    <div class="min-h-[120px] p-3 {{ $isCurrentMonth ? 'bg-white' : 'bg-gray-50' }}">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-semibold {{ $isCurrentMonth ? 'text-gray-900' : 'text-gray-400' }}">{{ $date->day }}</span>
                            @if ($isToday)
                                <span class="text-xs font-semibold text-blue-600">Heute</span>
                            @endif
                        </div>
                        <div class="mt-3 space-y-2">
                            @foreach ($slots as $slot)
                                @php
                                    $isFull = $slot['remaining'] === 0;
                                @endphp
                                <a href="{{ route('tours.show', $slot['tour_id']) }}"
                                   class="block rounded-lg px-3 py-2 text-xs border {{ $isFull ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300' }}">
                                    <div class="font-semibold truncate">{{ $slot['tour'] }}</div>
                                    <div class="mt-1 flex justify-between">
                                        <span>{{ \Carbon\Carbon::parse($slot['start'])->format('H:i') }} Uhr</span>
                                        <span>{{ $slot['remaining'] }} frei</span>
                                    </div>
                                </a>
                            @endforeach
                            @if (empty($slots))
                                <p class="text-xs text-gray-400">Keine Termine</p>
                            @endif
                        </div>
                    </div>
                @endfor
            </div>
        </div>
    </div>
</x-app-layout>
