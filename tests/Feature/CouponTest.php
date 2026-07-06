<?php

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(fn () => $this->seed(RolesAndPermissionsSeeder::class));

// ── CRUD ──────────────────────────────────────────────────────────────────────

test('authenticated user can create a coupon with scope all', function () {
    $user = User::factory()->create()->assignRole('Admin');

    $response = $this->actingAs($user)
        ->post(route('coupons.store'), [
            'code' => 'SAVE10',
            'description' => 'Save 10 percent',
            'discount_percent' => 10,
            'scope' => 'all',
            'starts_at' => now()->subDay()->toDateString(),
            'expires_at' => now()->addDays(30)->toDateString(),
            'is_active' => true,
        ]);

    $response->assertRedirect(route('coupons.index'));

    $this->assertDatabaseHas('coupons', ['code' => 'SAVE10', 'scope' => 'all']);
});

test('creating a category-scoped coupon syncs the coupon_category pivot', function () {
    $user = User::factory()->create()->assignRole('Admin');
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();

    $this->actingAs($user)->post(route('coupons.store'), [
        'code' => 'CAT10',
        'discount_percent' => 10,
        'scope' => 'category',
        'starts_at' => now()->subDay()->toDateString(),
        'expires_at' => now()->addDays(30)->toDateString(),
        'is_active' => true,
        'category_ids' => [$categoryA->id, $categoryB->id],
    ]);

    $coupon = Coupon::where('code', 'CAT10')->firstOrFail();

    expect($coupon->categories()->count())->toBe(2);
});

test('coupon code must be unique', function () {
    $user = User::factory()->create()->assignRole('Admin');
    Coupon::factory()->create(['code' => 'UNIQUE10']);

    // WithoutMiddleware + FormRequest redirects with session errors instead of 422 JSON,
    // so we assert the duplicate was not created rather than checking the status code.
    $this->actingAs($user)->post(route('coupons.store'), [
        'code' => 'UNIQUE10',
        'discount_percent' => 10,
        'scope' => 'all',
        'starts_at' => now()->subDay()->toDateString(),
        'expires_at' => now()->addDays(30)->toDateString(),
        'is_active' => true,
    ]);

    $this->assertDatabaseCount('coupons', 1);
});

test('user can update a coupon and scope change re-syncs pivots', function () {
    $user = User::factory()->create()->assignRole('Admin');
    $categoryA = Category::factory()->create();
    $product = Product::factory()->create(['is_active' => true]);

    $coupon = Coupon::factory()->forCategory()->create();
    $coupon->categories()->attach($categoryA->id);

    $this->actingAs($user)->put(route('coupons.update', $coupon), [
        'code' => $coupon->code,
        'description' => 'Updated description',
        'discount_percent' => 15,
        'scope' => 'product',
        'starts_at' => now()->subDay()->toDateString(),
        'expires_at' => now()->addDays(30)->toDateString(),
        'is_active' => true,
        'product_ids' => [$product->id],
    ]);

    $coupon->refresh();

    $this->assertDatabaseHas('coupons', [
        'id' => $coupon->id,
        'scope' => 'product',
    ]);

    expect($coupon->categories()->count())->toBe(0);
    expect($coupon->products()->count())->toBe(1);
});

test('user can delete a coupon', function () {
    $user = User::factory()->create()->assignRole('Admin');
    $coupon = Coupon::factory()->create();

    $this->actingAs($user)->delete(route('coupons.destroy', $coupon));

    $this->assertSoftDeleted('coupons', ['id' => $coupon->id]);
});

// ── Validation endpoint ───────────────────────────────────────────────────────

test('valid coupon returns computed discount', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 200.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->create(['discount_percent' => 10, 'scope' => 'all']);

    $response = $this->actingAs($user)
        ->postJson(route('pos.coupon'), [
            'code' => $coupon->code,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]);

    $response->assertStatus(200);
    expect((float) $response->json('discount'))->toBe(20.0);
});

test('expired coupon returns 422', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->expired()->create();

    $this->actingAs($user)
        ->postJson(route('pos.coupon'), [
            'code' => $coupon->code,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertStatus(422);
});

test('exhausted coupon returns 422', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->exhausted()->create();

    $this->actingAs($user)
        ->postJson(route('pos.coupon'), [
            'code' => $coupon->code,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertStatus(422);
});

test('inactive coupon returns 422', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->inactive()->create();

    $this->actingAs($user)
        ->postJson(route('pos.coupon'), [
            'code' => $coupon->code,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertStatus(422);
});

test('category-scoped coupon only discounts matching category items', function () {
    $user = User::factory()->create();
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();

    $productA = Product::factory()->create([
        'category_id' => $categoryA->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);
    $productB = Product::factory()->create([
        'category_id' => $categoryB->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->forCategory()->create(['discount_percent' => 10]);
    $coupon->categories()->attach($categoryA->id);

    $response = $this->actingAs($user)
        ->postJson(route('pos.coupon'), [
            'code' => $coupon->code,
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 1],
                ['product_id' => $productB->id, 'quantity' => 1],
            ],
        ]);

    $response->assertStatus(200);
    expect((float) $response->json('discount'))->toBe(10.0);
});

test('category-scoped coupon with no matching items returns 422', function () {
    $user = User::factory()->create();
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();

    $product = Product::factory()->create([
        'category_id' => $categoryB->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->forCategory()->create(['discount_percent' => 10]);
    $coupon->categories()->attach($categoryA->id);

    $this->actingAs($user)
        ->postJson(route('pos.coupon'), [
            'code' => $coupon->code,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Coupon does not apply to any item in the cart.');
});

// ── Checkout integration ──────────────────────────────────────────────────────

test('checkout with valid coupon stores server-authoritative discount and increments used_count', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->create([
        'discount_percent' => 10,
        'scope' => 'all',
        'used_count' => 0,
    ]);

    // Send deliberately wrong client discount/total to prove server overrides them
    $response = $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'subtotal' => 200.00,
            'discount' => 999.00,
            'total' => 999.00,
            'payment_method' => 'credit_card',
            'coupon_code' => $coupon->code,
        ]);

    $response->assertStatus(200);

    // Server must compute: 10% of $200 = $20 discount, total = $180
    $this->assertDatabaseHas('sales', [
        'discount' => '20.00',
        'total' => '180.00',
        'coupon_id' => $coupon->id,
        'coupon_code' => $coupon->code,
    ]);

    $coupon->refresh();
    expect($coupon->used_count)->toBe(1);
});

test('checkout with expired coupon returns 422 and creates no sale', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 100.00,
        'stock' => 10,
        'is_active' => true,
    ]);

    $coupon = Coupon::factory()->expired()->create();

    $this->actingAs($user)
        ->postJson(route('pos.checkout'), [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'subtotal' => 100.00,
            'discount' => 0,
            'total' => 100.00,
            'payment_method' => 'credit_card',
            'coupon_code' => $coupon->code,
        ])
        ->assertStatus(422);

    $this->assertDatabaseCount('sales', 0);
});

test('checkout without coupon code works normally with null coupon fields', function () {
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
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'subtotal' => 100.00,
            'discount' => 0,
            'total' => 100.00,
            'payment_method' => 'pix',
        ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['sale' => ['id', 'total']]);

    $this->assertDatabaseHas('sales', [
        'id' => $response->json('sale.id'),
        'total' => '100.00',
        'coupon_id' => null,
        'coupon_code' => null,
    ]);
});
