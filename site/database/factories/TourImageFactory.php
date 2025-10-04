<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TourImage>
 */
class TourImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tour_id' => \App\Models\Tour::factory(),
            'url' => fake()->imageUrl(1280, 720, 'animals'),
            'alt' => fake()->sentence(6),
            'width' => 1280,
            'height' => 720,
            'position' => fake()->numberBetween(0, 5),
        ];
    }
}
