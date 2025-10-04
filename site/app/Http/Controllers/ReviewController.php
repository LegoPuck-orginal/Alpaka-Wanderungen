<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function create(Request $request): View
    {
        return view('reviews.create', [
            'code' => $request->query('code'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'name' => ['required', 'string', 'max:120'],
            'text' => ['required', 'string', 'max:2000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $booking = Booking::where('code', $validated['code'])
            ->where('status', Booking::STATUS_CONFIRMED)
            ->first();

        if (! $booking) {
            return back()->withErrors([
                'code' => 'Der angegebene Buchungscode wurde nicht gefunden oder ist noch nicht bestätigt.',
            ])->withInput();
        }

        $position = (Review::max('position') ?? 0) + 1;

        Review::create([
            'name' => $validated['name'],
            'text' => $validated['text'],
            'rating' => $validated['rating'],
            'position' => $position,
            'is_visible' => false,
        ]);

        return redirect()
            ->route('reviews.thankyou')
            ->with('status', 'Vielen Dank für dein Feedback!');
    }

    public function thankyou(): View
    {
        return view('reviews.thankyou');
    }
}
