<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->admin = User::factory()->create()->assignRole('Admin');
});

test('admin can view the reports page', function () {
    $this->actingAs($this->admin)
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/index')
            ->has('summary')
            ->has('salesByPaymentMethod')
            ->has('topProducts')
            ->has('dailySales')
        );
});

test('non-admin users cannot access reports', function () {
    $employee = User::factory()->create()->assignRole('Employee');

    $this->actingAs($employee)
        ->get(route('reports.index'))
        ->assertForbidden();
});

test('csv export honours the date filter', function () {
    $inRange = Sale::factory()->for($this->admin)->create([
        'total' => 100,
        'sold_at' => '2026-06-15 10:00:00',
    ]);
    SaleItem::factory()->for($inRange)->create(['quantity' => 3]);

    $outOfRange = Sale::factory()->for($this->admin)->create([
        'total' => 999,
        'sold_at' => '2026-05-01 10:00:00',
    ]);
    SaleItem::factory()->for($outOfRange)->create();

    $response = $this->actingAs($this->admin)->get(
        route('reports.export', ['start_date' => '2026-06-01', 'end_date' => '2026-06-30'])
    );

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');

    $content = $response->streamedContent();
    expect($content)->toContain('100.00');
    expect($content)->not->toContain('999.00');
});

test('report can be filtered by payment method', function () {
    Sale::factory()->for($this->admin)->create(['payment_method' => 'pix', 'sold_at' => now()]);
    Sale::factory()->for($this->admin)->create(['payment_method' => 'credit_card', 'sold_at' => now()]);

    $this->actingAs($this->admin)
        ->get(route('reports.index', ['payment_method' => 'pix']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_sales', 1)
            ->where('filters.payment_method', 'pix')
        );
});

test('report can be filtered by category', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();

    $productA = Product::factory()->for($categoryA)->create();
    $productB = Product::factory()->for($categoryB)->create();

    $saleA = Sale::factory()->for($this->admin)->create(['sold_at' => now()]);
    SaleItem::factory()->for($saleA)->create(['product_id' => $productA->id]);

    $saleB = Sale::factory()->for($this->admin)->create(['sold_at' => now()]);
    SaleItem::factory()->for($saleB)->create(['product_id' => $productB->id]);

    $this->actingAs($this->admin)
        ->get(route('reports.index', ['category_id' => $categoryA->id]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_sales', 1)
            ->where('filters.category_id', $categoryA->id)
        );
});

test('report can be filtered by product', function () {
    $productA = Product::factory()->create();
    $productB = Product::factory()->create();

    $saleA = Sale::factory()->for($this->admin)->create(['sold_at' => now()]);
    SaleItem::factory()->for($saleA)->create(['product_id' => $productA->id]);

    $saleB = Sale::factory()->for($this->admin)->create(['sold_at' => now()]);
    SaleItem::factory()->for($saleB)->create(['product_id' => $productB->id]);

    $this->actingAs($this->admin)
        ->get(route('reports.index', ['product_id' => $productA->id]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_sales', 1)
            ->where('topProducts.0.product_id', $productA->id)
        );
});

test('filters combine with the date range', function () {
    Sale::factory()->for($this->admin)->create([
        'payment_method' => 'pix',
        'sold_at' => '2026-06-15 10:00:00',
    ]);
    Sale::factory()->for($this->admin)->create([
        'payment_method' => 'pix',
        'sold_at' => '2026-05-15 10:00:00',
    ]);

    $this->actingAs($this->admin)
        ->get(route('reports.index', [
            'payment_method' => 'pix',
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-30',
        ]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_sales', 1)
        );
});

test('pdf export returns a pdf document', function () {
    Sale::factory()->for($this->admin)->create([
        'sold_at' => now(),
    ]);

    $response = $this->actingAs($this->admin)->get(
        route('reports.export-pdf', [
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
        ])
    );

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});
