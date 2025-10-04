<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $persons = fake()->numberBetween(1, 6);

        return [
            'code' => sprintf('ALP-%s', strtoupper(Str::random(5))),
            'user_id' => \App\Models\User::factory(),
            'slot_id' => \App\Models\EventSlot::factory(),
            'persons' => $persons,
            'contact_email' => fake()->safeEmail(),
            'status' => fake()->randomElement([
                \App\Models\Booking::STATUS_PENDING,
                \App\Models\Booking::STATUS_CONFIRMED,
                \App\Models\Booking::STATUS_CANCELED,
            ]),
        ];
    }
}
