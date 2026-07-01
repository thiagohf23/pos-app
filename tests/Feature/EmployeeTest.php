<?php

use App\Models\Employee;
use App\Models\User;

test('authenticated user can create an employee', function () {
    $user = User::factory()->create();

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

    $this->assertDatabaseHas('employees', [
        'email' => 'john@example.com',
        'salary' => '2500.00',
    ]);
});

test('authenticated user can update an employee', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->put(route('employees.update', $employee), [
            'name' => 'Jane Doe',
            'email' => $employee->email,
            'salary' => 5000.00,
            'is_active' => true,
        ]);

    $employee->refresh();

    expect($employee->name)->toBe('Jane Doe');
});

test('employee email must be unique', function () {
    $user = User::factory()->create();
    Employee::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Dupe',
        'email' => 'taken@example.com',
        'salary' => 2000,
    ]);

    $this->assertDatabaseCount('employees', 1);
});

test('authenticated user can delete an employee', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->delete(route('employees.destroy', $employee));

    $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
});
