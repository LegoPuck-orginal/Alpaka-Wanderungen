<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\EventSlot;
use App\Models\Tour;
use App\Services\CapacityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private readonly CapacityService $capacityService)
    {
    }

    public function store(Request $request, Tour $tour, EventSlot $slot): RedirectResponse
    {
        abort_unless($slot->tour_id === $tour->id, 404);

        $validated = $request->validate([
            'persons' => ['required', 'integer', 'min:1', 'max:50'],
            'contact_email' => ['required', 'email'],
        ]);

        $slot->setRelation('tour', $tour);
        $remaining = $this->capacityService->remainingCapacity($slot);

        if ($validated['persons'] > $remaining) {
            return back()
                ->withErrors([
                    'persons' => sprintf('Für diesen Termin sind nur noch %d Plätze verfügbar.', $remaining),
                ])
                ->withInput();
        }

        $warnings = $this->capacityService->warningsFor($slot, $validated['persons']);

        $booking = Booking::create([
            'slot_id' => $slot->id,
            'user_id' => $request->user()->id,
            'persons' => $validated['persons'],
            'contact_email' => $validated['contact_email'],
            'status' => Booking::STATUS_PENDING,
        ]);

        return redirect()
            ->route('tours.show', $tour)
            ->with('status', 'Buchung erfolgreich angefragt!')
            ->with('warnings', $warnings);
    }
}
