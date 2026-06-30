<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;

uses(WithoutMiddleware::class);

test('authenticated user can view dashboard page with metrics', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    // Create products with different stocks
    Product::factory()->create([
        'category_id' => $category->id,
        'stock' => 0,
        'is_active' => true,
    ]);
    Product::factory()->create([
        'category_id' => $category->id,
        'stock' => 3,
        'is_active' => true,
    ]);
    Product::factory()->create([
        'category_id' => $category->id,
        'stock' => 15,
        'is_active' => true,
    ]);

    // Create a sale
    Sale::create([
        'user_id' => $user->id,
        'subtotal' => 100.00,
        'discount' => 10.00,
        'total' => 90.00,
        'status' => 'completed',
        'payment_method' => 'cash',
        'cash_tendered' => 100.00,
        'change_amount' => 10.00,
    ]);

    $response = $this->actingAs($user)
        ->get(route('dashboard'));

    $response->assertStatus(200);
});
