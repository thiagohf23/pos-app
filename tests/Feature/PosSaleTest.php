<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;

uses(WithoutMiddleware::class);

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
            'payment_method' => 'credit_card',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['sale' => ['id', 'total']]);

    $this->assertDatabaseHas('sales', [
        'user_id' => $user->id,
        'total' => 100.00,
        'payment_method' => 'credit_card',
    ]);

    $this->assertDatabaseHas('sale_items', [
        'sale_id' => $response->json('sale.id'),
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
            'payment_method' => 'debit_card',
        ]);

    $product->refresh();
    $this->assertEquals(2, $product->stock);
});

test('can view sale receipt', function () {
    $user = User::factory()->create();
    $sale = Sale::factory()->create(['user_id' => $user->id]);

    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_name' => 'Test Product',
        'unit_price' => 50.00,
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
            'payment_method' => 'pix',
        ]);

    $response->assertJsonPath('sale.discount', '10.00');
});

test('checkout with cash calculates change correctly', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 40.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'subtotal' => 80.00,
            'discount' => 0,
            'total' => 80.00,
            'payment_method' => 'cash',
            'cash_tendered' => 100.00,
        ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('sales', [
        'id' => $response->json('sale.id'),
        'payment_method' => 'cash',
        'cash_tendered' => 100.00,
        'change_amount' => 20.00,
    ]);
});

test('checkout with cash without change has zero change', function () {
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
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'subtotal' => 50.00,
            'discount' => 0,
            'total' => 50.00,
            'payment_method' => 'cash',
            'cash_tendered' => 50.00,
        ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('sales', [
        'id' => $response->json('sale.id'),
        'payment_method' => 'cash',
        'change_amount' => 0.00,
    ]);
});

test('non-cash sale stores null cash fields', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 30.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'subtotal' => 30.00,
            'discount' => 0,
            'total' => 30.00,
            'payment_method' => 'pix',
        ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('sales', [
        'id' => $response->json('sale.id'),
        'payment_method' => 'pix',
        'cash_tendered' => null,
        'change_amount' => null,
    ]);
});

test('sale stores optional notes', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 20.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'subtotal' => 20.00,
            'discount' => 0,
            'total' => 20.00,
            'payment_method' => 'credit_card',
            'notes' => 'Customer requested gift wrap',
        ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('sales', [
        'id' => $response->json('sale.id'),
        'notes' => 'Customer requested gift wrap',
    ]);
});

test('pos index page loads successfully', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->get(route('pos.index'));

    $response->assertStatus(200);
});
