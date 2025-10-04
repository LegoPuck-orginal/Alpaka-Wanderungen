<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TourController extends Controller
{
    public function index(): View
    {
        $tours = Tour::withCount(['slots as upcoming_slots_count' => function ($query) {
            $query->where('start', '>=', now());
        }])->orderBy('title')->get();

        return view('admin.tours.index', [
            'tours' => $tours,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateTour($request);

        Tour::create($validated);

        return redirect()->route('admin.tours.index')->with('status', 'Tour erstellt.');
    }

    public function update(Request $request, Tour $tour): RedirectResponse
    {
        $validated = $this->validateTour($request);

        $tour->update($validated);

        return redirect()->route('admin.tours.index')->with('status', 'Tour aktualisiert.');
    }

    public function destroy(Tour $tour): RedirectResponse
    {
        $tour->delete();

        return redirect()->route('admin.tours.index')->with('status', 'Tour gelöscht.');
    }

    private function validateTour(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'duration_min' => ['required', 'integer', 'min:30', 'max:1440'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'image_alt' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
