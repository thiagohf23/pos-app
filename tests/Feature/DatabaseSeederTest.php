<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('database seeder creates admin, a known employee and 15 fictitious employees', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::where('email', 'admin@example.com')->first();

    expect($admin)->not->toBeNull();
    expect($admin->hasRole('Admin'))->toBeTrue();
    expect($admin->employee)->toBeNull();

    $employee = User::where('email', 'employee@example.com')->first();

    expect($employee)->not->toBeNull();
    expect($employee->hasRole('Employee'))->toBeTrue();
    expect($employee->employee)->not->toBeNull();
    expect($employee->employee->is_active)->toBeTrue();

    expect(Employee::count())->toBe(16);
    expect(User::role('Employee')->count())->toBe(16);
    expect(Employee::where('is_active', true)->count())->toBe(16);
});
