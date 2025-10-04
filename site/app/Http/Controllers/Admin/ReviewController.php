<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(): View
    {
        $reviews = Review::orderBy('position')->get();

        return view('admin.reviews.index', [
            'reviews' => $reviews,
            'visibleCount' => $reviews->where('is_visible', true)->count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'text' => ['required', 'string', 'max:2000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'is_visible' => ['sometimes', 'boolean'],
        ]);

        $position = (Review::max('position') ?? 0) + 1;

        $isVisible = $validated['is_visible'] ?? false;

        if ($isVisible && Review::where('is_visible', true)->count() >= 5) {
            return back()->withErrors([
                'is_visible' => 'Es können maximal 5 Reviews gleichzeitig sichtbar sein.',
            ])->withInput();
        }

        Review::create([
            'name' => $validated['name'],
            'text' => $validated['text'],
            'rating' => $validated['rating'],
            'position' => $position,
            'is_visible' => $isVisible,
        ]);

        return redirect()->route('admin.reviews.index')->with('status', 'Review erstellt.');
    }

    public function update(Request $request, Review $review): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'text' => ['required', 'string', 'max:2000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $review->update($validated);

        return redirect()->route('admin.reviews.index')->with('status', 'Review aktualisiert.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return redirect()->route('admin.reviews.index')->with('status', 'Review gelöscht.');
    }

    public function toggleVisibility(Review $review): RedirectResponse
    {
        if (! $review->is_visible && Review::where('is_visible', true)->count() >= 5) {
            return back()->withErrors([
                'is_visible' => 'Es können maximal 5 Reviews gleichzeitig sichtbar sein.',
            ]);
        }

        $review->update([
            'is_visible' => ! $review->is_visible,
        ]);

        return redirect()->route('admin.reviews.index')->with('status', 'Sichtbarkeit aktualisiert.');
    }

    public function reorder(Request $request, Review $review): RedirectResponse
    {
        $validated = $request->validate([
            'direction' => ['required', 'in:up,down'],
        ]);

        $swapReview = Review::where('position', $review->position + ($validated['direction'] === 'up' ? -1 : 1))->first();

        if (! $swapReview) {
            return back();
        }

        $currentPosition = $review->position;
        $review->update(['position' => $swapReview->position]);
        $swapReview->update(['position' => $currentPosition]);

        return redirect()->route('admin.reviews.index')->with('status', 'Reihenfolge aktualisiert.');
    }
}
