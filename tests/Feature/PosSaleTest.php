<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('authenticated user can complete a sale', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 50.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'subtotal' => 100.00,
            'discount' => 0,
            'total' => 100.00,
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['sale' => ['id', 'total']]);

    $this->assertDatabaseHas('sales', [
        'user_id' => $user->id,
        'total' => 100.00,
    ]);

    $this->assertDatabaseHas('sale_items', [
        'sale_id' => $response.json('sale.id'),
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $product->refresh();
    $this->assertEquals(8, $product->stock);
});

test('checkout decreases product stock', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 25.00,
        'stock' => 5,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
            'subtotal' => 75.00,
            'discount' => 0,
            'total' => 75.00,
        ]);

    $product->refresh();
    $this->assertEquals(2, $product->stock);
});

test('can view sale receipt', function () {
    $user = User::factory()->create();
    $sale = \App\Models\Sale::factory()->create(['user_id' => $user->id]);
    
    \App\Models\SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_name' => 'Test Product',
        'price' => 50.00,
        'quantity' => 1,
        'total' => 50.00,
    ]);

    $response = $this->actingAs($user)
        ->get(route('pos.receipt', $sale));

    $response->assertStatus(200);
});

test('checkout applies discount correctly', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 200.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'subtotal' => 200.00,
            'discount' => 10.00,
            'total' => 190.00,
        ]);

    $response->assertJsonPath('sale.discount', 10.00);
});
