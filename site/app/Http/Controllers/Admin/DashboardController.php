<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\EventSlot;
use App\Models\Review;
use App\Models\Tour;
use Illuminate\Contracts\View\View;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        return view('admin.dashboard', [
            'tourCount' => Tour::count(),
            'upcomingSlots' => EventSlot::where('start', '>=', now())->count(),
            'pendingBookings' => Booking::where('status', Booking::STATUS_PENDING)->count(),
            'confirmedBookings' => Booking::where('status', Booking::STATUS_CONFIRMED)->count(),
            'visibleReviews' => Review::where('is_visible', true)->count(),
        ]);
    }
}
