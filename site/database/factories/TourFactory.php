<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tour>
 */
class TourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(4),
            'duration_min' => fake()->numberBetween(60, 240),
            'price_cents' => fake()->numberBetween(2500, 15000),
            'capacity' => fake()->numberBetween(4, 12),
            'image_url' => fake()->imageUrl(1280, 720, 'animals'),
            'image_alt' => fake()->sentence(6),
        ];
    }
}
