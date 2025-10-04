<?php

namespace App\Http\Controllers;

use App\Models\EventSlot;
use App\Services\CapacityService;
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function __construct(private readonly CapacityService $capacityService)
    {
    }

    public function index(Request $request): View
    {
        [$month, $year] = $this->resolvePeriod($request);

        $data = $this->buildCalendarData($month, $year);

        return view('calendar.index', [
            'calendar' => $data,
            'month' => $month,
            'year' => $year,
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        [$month, $year] = $this->resolvePeriod($request);

        return response()->json(
            $this->buildCalendarData($month, $year)
        );
    }

    private function resolvePeriod(Request $request): array
    {
        $now = now();
        $month = (int) $request->input('month', $now->month);
        $year = (int) $request->input('year', $now->year);

        return [$month, $year];
    }

    private function buildCalendarData(int $month, int $year): array
    {
        $start = Carbon::create($year, $month)->startOfMonth();
        $end = (clone $start)->endOfMonth();

        $slots = EventSlot::with(['tour', 'bookings' => function ($query) {
            $query->whereNotIn('status', [\App\Models\Booking::STATUS_CANCELED]);
        }])
            ->whereBetween('start', [$start, $end])
            ->orderBy('start')
            ->get();

        $days = [];

        foreach ($slots as $slot) {
            $slot->setRelation('tour', $slot->tour);
            $remaining = $this->capacityService->remainingCapacity($slot);
            $key = $slot->start->format('Y-m-d');

            $days[$key][] = [
                'id' => $slot->id,
                'tour_id' => $slot->tour->id,
                'tour' => $slot->tour->title,
                'start' => $slot->start->toIso8601String(),
                'end' => $slot->end->toIso8601String(),
                'remaining' => $remaining,
                'capacity' => min($slot->capacity, $slot->tour->capacity),
            ];
        }

        return [
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'days' => $days,
        ];
    }
}
