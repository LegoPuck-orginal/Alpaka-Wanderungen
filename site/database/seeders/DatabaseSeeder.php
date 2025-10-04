<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Content;
use App\Models\EventSlot;
use App\Models\PageView;
use App\Models\Review;
use App\Models\Tour;
use App\Models\TourImage;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as FakerFactory;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $faker = FakerFactory::create('de_DE');

        $admin = User::factory()
            ->admin()
            ->create([
                'name' => 'Admin Alpaka',
                'email' => 'admin@alpaka-wanderungen.de',
                'password' => bcrypt('password'),
            ]);

        $users = User::factory(10)->create();

        $tours = Tour::factory(3)->create();

        foreach ($tours as $tour) {
            TourImage::factory(3)->create([
                'tour_id' => $tour->id,
            ]);

            $slots = EventSlot::factory()
                ->count(6)
                ->sequence(fn ($sequence) => [
                    'start' => now()->startOfDay()->addDays($sequence->index + 1)->setTime(10, 0),
                    'end' => now()->startOfDay()->addDays($sequence->index + 1)->setTime(12, 0),
                ])
                ->create([
                    'tour_id' => $tour->id,
                    'capacity' => $tour->capacity,
                ]);

            foreach ($slots as $slot) {
                $bookings = Booking::factory($faker->numberBetween(0, 3))->create(function () use ($slot, $users) {
                    $user = $users->random();

                    return [
                        'slot_id' => $slot->id,
                        'user_id' => $user->id,
                        'contact_email' => $user->email,
                    ];
                });

                foreach ($bookings as $booking) {
                    if ($booking->status === Booking::STATUS_CONFIRMED) {
                        $booking->payment()->create([
                            'amount_cents' => $tour->price_cents * $booking->persons,
                            'currency' => 'EUR',
                            'status' => 'paid',
                        ]);
                    }
                }
            }
        }

        Review::factory(8)->create();

        Content::factory()->create([
            'key' => 'homepage.hero.title',
            'value' => 'Alpaka-Wanderungen im schönen Schwarzwald',
        ]);

        Content::factory()->create([
            'key' => 'homepage.hero.subtitle',
            'value' => 'Erlebe unvergessliche Touren mit unseren sanften Alpakas.',
        ]);

        PageView::factory(50)->create();
    }
}
