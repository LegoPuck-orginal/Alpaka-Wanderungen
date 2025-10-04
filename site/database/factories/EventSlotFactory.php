<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventSlot>
 */
class EventSlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+1 days', '+60 days');
        $end = (clone $start)->modify('+2 hours');

        return [
            'tour_id' => \App\Models\Tour::factory(),
            'start' => $start,
            'end' => $end,
            'capacity' => fake()->numberBetween(4, 12),
        ];
    }
}
