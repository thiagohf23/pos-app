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
        $total = $this->faker->randomFloat(2, 10, 500);

        return [
            'user_id' => null,
            'subtotal' => $total,
            'discount' => 0,
            'total' => $total,
            'status' => 'completed',
            'payment_method' => $this->faker->randomElement(['credit_card', 'debit_card', 'pix']),
            'cash_tendered' => null,
            'change_amount' => null,
            'notes' => null,
            'sold_at' => now(),
        ];
    }

    public function paidWithCash(): self
    {
        return $this->state(function (array $attributes) {
            $change = $this->faker->randomFloat(2, 1, 100);

            return [
                'payment_method' => 'cash',
                'cash_tendered' => $attributes['total'] + $change,
                'change_amount' => $change,
            ];
        });
    }

    public function withDiscount(): self
    {
        return $this->state(fn (array $attributes) => [
            'discount' => $this->faker->randomFloat(2, 5, 50),
        ]);
    }
}
