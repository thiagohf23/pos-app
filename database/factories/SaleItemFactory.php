<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleItem>
 */
class SaleItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'product_name' => $this->faker->words(2, true),
            'unit_price' => $this->faker->randomFloat(2, 5, 100),
            'quantity' => $this->faker->numberBetween(1, 5),
            'total' => $this->faker->randomFloat(2, 5, 500),
        ];
    }
}
