<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\TourController as AdminTourController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TourController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('/tours', [TourController::class, 'index'])->name('tours.index');
Route::get('/tours/{tour}', [TourController::class, 'show'])->name('tours.show');
Route::post('/tours/{tour}/slots/{slot}/book', [BookingController::class, 'store'])
    ->middleware('auth')
    ->name('tours.bookings.store');

Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
Route::get('/calendar/data', [CalendarController::class, 'data'])->name('calendar.data');

Route::get('/review', [ReviewController::class, 'create'])->name('reviews.create');
Route::post('/review', [ReviewController::class, 'store'])->name('reviews.store');
Route::get('/review/danke', [ReviewController::class, 'thankyou'])->name('reviews.thankyou');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('admin')
    ->middleware(['auth', 'can:access-admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');

        Route::resource('tours', AdminTourController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::resource('bookings', AdminBookingController::class)->only(['index', 'update', 'destroy']);

        Route::resource('reviews', AdminReviewController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('reviews/{review}/toggle', [AdminReviewController::class, 'toggleVisibility'])
            ->name('reviews.toggle');
        Route::post('reviews/{review}/reorder', [AdminReviewController::class, 'reorder'])
            ->name('reviews.reorder');
    });

require __DIR__.'/auth.php';
