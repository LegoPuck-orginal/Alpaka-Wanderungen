<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Services\CapacityService;
use Illuminate\Contracts\View\View;

class TourController extends Controller
{
    public function __construct(private readonly CapacityService $capacityService)
    {
    }

    public function index(): View
    {
        $tours = Tour::with('images')
            ->withCount(['slots as upcoming_slots_count' => function ($query) {
                $query->where('start', '>=', now());
            }])
            ->orderBy('title')
            ->get();

        return view('tours.index', [
            'tours' => $tours,
        ]);
    }

    public function show(Tour $tour): View
    {
        $tour->load([
            'images' => fn ($query) => $query->orderBy('position'),
            'slots' => fn ($query) => $query
                ->where('start', '>=', now()->startOfDay())
                ->orderBy('start')
                ->with(['bookings' => fn ($bookingQuery) => $bookingQuery
                    ->whereNotIn('status', [\App\Models\Booking::STATUS_CANCELED])
                ]),
        ]);

        $slots = $tour->slots->map(function ($slot) use ($tour) {
            $slot->setRelation('tour', $tour);
            $remaining = $this->capacityService->remainingCapacity($slot);

            return [
                'model' => $slot,
                'remaining' => $remaining,
            ];
        });

        return view('tours.show', [
            'tour' => $tour,
            'slots' => $slots,
        ]);
    }
}
