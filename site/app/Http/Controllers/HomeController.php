<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Review;
use App\Models\Tour;
use Illuminate\Contracts\View\View;

class HomeController extends Controller
{
    public function __invoke(): View
    {
        $heroTitle = Content::where('key', 'homepage.hero.title')->value('value')
            ?? 'Alpaka-Wanderungen';

        $heroSubtitle = Content::where('key', 'homepage.hero.subtitle')->value('value')
            ?? 'Unvergessliche Touren mit freundlichen Alpakas.';

        $tours = Tour::with([
            'images' => fn ($query) => $query->orderBy('position'),
            'slots' => fn ($query) => $query
                ->where('start', '>=', now())
                ->orderBy('start')
                ->limit(3),
        ])->orderBy('title')->get();

        $reviews = Review::where('is_visible', true)
            ->orderBy('position')
            ->limit(5)
            ->get();

        return view('home', [
            'heroTitle' => $heroTitle,
            'heroSubtitle' => $heroSubtitle,
            'tours' => $tours,
            'reviews' => $reviews,
        ]);
    }
}
