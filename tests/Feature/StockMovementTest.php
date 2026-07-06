<?php

use App\Enums\StockMovementReason;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\WithoutMiddleware;

uses(WithoutMiddleware::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('checkout creates a stock movement for each sold item', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 50.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $this->actingAs($user)->postJson(route('pos.checkout'), [
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
        'subtotal' => 150.00,
        'discount' => 0,
        'total' => 150.00,
        'payment_method' => 'pix',
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'user_id' => $user->id,
        'quantity_change' => -3,
        'reason' => StockMovementReason::Sale->value,
    ]);
});

test('manual stock adjustment creates a stock movement', function () {
    $user = User::factory()->create();
    $user->assignRole('Admin');

    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'stock' => 10,
    ]);

    $this->actingAs($user)->postJson(route('stock-adjustments.store'), [
        'product_id' => $product->id,
        'quantity_change' => 5,
        'notes' => 'Received new shipment',
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'user_id' => $user->id,
        'quantity_change' => 5,
        'reason' => StockMovementReason::ManualAdjustment->value,
        'notes' => 'Received new shipment',
    ]);

    $product->refresh();
    $this->assertEquals(15, $product->stock);
});

test('manual negative adjustment reduces stock correctly', function () {
    $user = User::factory()->create();
    $user->assignRole('Admin');

    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'stock' => 10,
    ]);

    $this->actingAs($user)->postJson(route('stock-adjustments.store'), [
        'product_id' => $product->id,
        'quantity_change' => -3,
        'notes' => 'Damaged goods written off',
    ]);

    $product->refresh();
    $this->assertEquals(7, $product->stock);
});

test('manual adjustment cannot reduce stock below zero', function () {
    $user = User::factory()->create();
    $user->assignRole('Admin');

    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'stock' => 2,
    ]);

    $response = $this->actingAs($user)->post(route('stock-adjustments.store'), [
        'product_id' => $product->id,
        'quantity_change' => -5,
        'notes' => 'Attempt to go negative',
    ]);

    // Controller redirects back with error flash when stock would go negative
    $response->assertRedirect();

    $product->refresh();
    $this->assertEquals(2, $product->stock);
});
