<?php

namespace Database\Factories;

use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'subtotal' => $this->faker->randomFloat(2, 10, 500),
            'discount' => 0,
            'total' => $this->faker->randomFloat(2, 10, 500),
            'status' => 'completed',
            'sold_at' => now(),
        ];
    }

    public function withDiscount(): self
    {
        return $this->state(fn (array $attributes) => [
            'discount' => $this->faker->randomFloat(2, 5, 50),
        ]);
    }
}
