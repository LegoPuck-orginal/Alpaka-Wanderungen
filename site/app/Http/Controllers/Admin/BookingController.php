<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): View
    {
        /** @var LengthAwarePaginator $bookings */
        $bookings = Booking::with(['user', 'slot.tour'])
            ->orderByDesc('created_at')
            ->paginate(perPage: 20, page: $request->integer('page', 1));

        return view('admin.bookings.index', [
            'bookings' => $bookings,
        ]);
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', [
                Booking::STATUS_PENDING,
                Booking::STATUS_CONFIRMED,
                Booking::STATUS_CANCELED,
            ])],
        ]);

        $booking->update($validated);

        return redirect()->route('admin.bookings.index')->with('status', 'Buchung aktualisiert.');
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $booking->delete();

        return redirect()->route('admin.bookings.index')->with('status', 'Buchung gelöscht.');
    }
}
