<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'text' => fake()->paragraph(),
            'rating' => fake()->numberBetween(4, 5),
            'position' => fake()->numberBetween(0, 100),
            'is_visible' => fake()->boolean(80),
        ];
    }
}
