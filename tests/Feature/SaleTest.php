<?php

use App\Models\Sale;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('guest cannot access sales list', function () {
    $response = $this->get(route('sales.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated user can list sales and see summary', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    Sale::factory()->create(['user_id' => $user->id, 'total' => 100.00, 'discount' => 10.00]);
    Sale::factory()->create(['user_id' => $user->id, 'total' => 150.00, 'discount' => 0.00]);

    $response = $this->actingAs($user)->get(route('sales.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('sales/index')
        ->has('sales.data', 2)
        ->has('summary', fn (Assert $summary) => $summary
            ->where('total_revenue', 250)
            ->where('total_sales', 2)
            ->where('total_discounts', 10)
        )
    );
});

test('can search sales by cashier name', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $cashier1 = User::factory()->create(['name' => 'John Doe']);
    $cashier2 = User::factory()->create(['name' => 'Jane Smith']);

    Sale::factory()->create(['user_id' => $cashier1->id]);
    Sale::factory()->create(['user_id' => $cashier2->id]);

    $response = $this->actingAs($user)->get(route('sales.index', ['search' => 'John']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('sales/index')
        ->has('sales.data', 1)
        ->where('sales.data.0.user.name', 'John Doe')
    );
});

test('can filter sales by status', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    Sale::factory()->create(['user_id' => $user->id, 'status' => 'completed']);
    Sale::factory()->create(['user_id' => $user->id, 'status' => 'cancelled']);

    $response = $this->actingAs($user)->get(route('sales.index', ['status' => 'cancelled']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('sales/index')
        ->has('sales.data', 1)
        ->where('sales.data.0.status', 'cancelled')
    );
});

test('can filter sales by date range', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    Sale::factory()->create(['user_id' => $user->id, 'sold_at' => '2026-06-01 10:00:00']);
    Sale::factory()->create(['user_id' => $user->id, 'sold_at' => '2026-06-15 10:00:00']);
    Sale::factory()->create(['user_id' => $user->id, 'sold_at' => '2026-07-01 10:00:00']);

    $response = $this->actingAs($user)->get(route('sales.index', [
        'start_date' => '2026-06-10',
        'end_date' => '2026-06-20',
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('sales/index')
        ->has('sales.data', 1)
        ->where('sales.data.0.sold_at', '2026-06-15T10:00:00.000000Z')
    );
});
