<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('????##')),
            'description' => $this->faker->sentence(),
            'discount_percent' => $this->faker->randomFloat(2, 5, 30),
            'scope' => 'all',
            'max_uses' => null,
            'used_count' => 0,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addDays(30),
            'is_active' => true,
        ];
    }

    public function expired(): self
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
            'starts_at' => now()->subDays(10),
        ]);
    }

    public function exhausted(): self
    {
        return $this->state(fn (array $attributes) => [
            'max_uses' => 1,
            'used_count' => 1,
        ]);
    }

    public function inactive(): self
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function forCategory(): self
    {
        return $this->state(fn (array $attributes) => [
            'scope' => 'category',
        ]);
    }

    public function forProduct(): self
    {
        return $this->state(fn (array $attributes) => [
            'scope' => 'product',
        ]);
    }
}
