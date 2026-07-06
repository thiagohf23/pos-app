<?php

use App\Enums\SaleStatus;
use App\Enums\StockMovementReason;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('admin can cancel a completed sale', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $sale = Sale::factory()->create(['status' => 'completed']);

    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id, 'stock' => 5]);

    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 10.00,
        'product_name' => $product->name,
        'total' => 20.00,
    ]);

    $this->actingAs($admin)->patch(route('sales.cancel', $sale));

    $sale->refresh();
    expect($sale->status)->toBe(SaleStatus::Cancelled);
});

test('cancellation restores product stock', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $sale = Sale::factory()->create(['status' => 'completed']);

    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id, 'stock' => 5]);

    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'unit_price' => 10.00,
        'product_name' => $product->name,
        'total' => 30.00,
    ]);

    $this->actingAs($admin)->patch(route('sales.cancel', $sale));

    $product->refresh();
    expect($product->stock)->toBe(8); // 5 + 3 restored
});

test('cancellation creates stock movement records', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $sale = Sale::factory()->create(['status' => 'completed']);

    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id, 'stock' => 10]);

    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 10.00,
        'product_name' => $product->name,
        'total' => 20.00,
    ]);

    $this->actingAs($admin)->patch(route('sales.cancel', $sale));

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'sale_id' => $sale->id,
        'quantity_change' => 2,
        'reason' => StockMovementReason::SaleCancellation->value,
    ]);
});

test('already cancelled sale cannot be cancelled again', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $sale = Sale::factory()->create(['status' => 'cancelled']);
    $category = Category::factory()->create();
    $product = Product::factory()->create(['category_id' => $category->id, 'stock' => 10]);

    SaleItem::factory()->create([
        'sale_id' => $sale->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 10.00,
        'product_name' => $product->name,
        'total' => 20.00,
    ]);

    $this->actingAs($admin)->patch(route('sales.cancel', $sale));

    // Stock should not change
    $product->refresh();
    expect($product->stock)->toBe(10);

    // Only cancellation movement should not be created
    expect(StockMovement::where('sale_id', $sale->id)->count())->toBe(0);
});

test('non admin cannot cancel a sale', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $sale = Sale::factory()->create(['status' => 'completed']);

    $response = $this->actingAs($user)->patch(route('sales.cancel', $sale));

    $response->assertForbidden();
});
