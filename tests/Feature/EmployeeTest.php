<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('authenticated user can create an employee', function () {
    $user = User::factory()->create()->assignRole('Admin');

    $response = $this->actingAs($user)
        ->post(route('employees.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '(11) 99999-9999',
            'cpf' => '123.456.789-00',
            'salary' => 2500.00,
            'hire_date' => '2025-01-15',
            'is_active' => true,
        ]);

    $response->assertRedirect(route('employees.index'));

    $employee = Employee::query()->latest()->first();

    expect($employee)->not->toBeNull();
    expect($employee->user)->not->toBeNull();
    expect($employee->user->email)->toBe('john@example.com');
    expect($employee->salary)->toBe('2500.00');
});

test('authenticated user can update an employee', function () {
    $user = User::factory()->create()->assignRole('Admin');
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->put(route('employees.update', $employee), [
            'name' => 'Jane Doe',
            'email' => $employee->user->email,
            'salary' => 5000.00,
            'is_active' => true,
        ]);

    $employee->refresh();
    $employee->load('user');

    expect($employee->salary)->toBe('5000.00');
});

test('employee email must be unique', function () {
    $user = User::factory()->create()->assignRole('Admin');
    User::factory()->create(['email' => 'taken@example.com']);
    Employee::factory()->create();

    $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Dupe',
        'email' => 'taken@example.com',
        'salary' => 2000,
    ]);

    $this->assertDatabaseCount('users', 3);
});

test('authenticated user can delete an employee', function () {
    $user = User::factory()->create()->assignRole('Admin');
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->delete(route('employees.destroy', $employee));

    $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
});
