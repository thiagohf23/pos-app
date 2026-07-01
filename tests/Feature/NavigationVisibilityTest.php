<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('admin roles are shared with the frontend', function () {
    $user = User::factory()->create()->assignRole('Admin');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.roles', ['Admin'])
        );
});

test('employee roles do not include admin', function () {
    $user = User::factory()->create()->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.roles', ['Employee'])
        );
});
