<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PageView>
 */
class PageViewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'path' => fake()->randomElement(['/','/tours','/calendar','/admin']),
            'session_id' => fake()->uuid(),
            'referrer' => fake()->optional()->url(),
            'user_agent' => fake()->userAgent(),
            'ip' => fake()->ipv4(),
        ];
    }
}
