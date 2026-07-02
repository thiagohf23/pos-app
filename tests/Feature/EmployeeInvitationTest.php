<?php

use App\Models\Employee;
use App\Models\User;
use App\Notifications\EmployeeInvitation;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('authenticated user can create an employee without password', function () {
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

test('store sets random password on user', function () {
    $user = User::factory()->create()->assignRole('Admin');

    $this->actingAs($user)
        ->post(route('employees.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'salary' => 2500.00,
        ]);

    $employee = Employee::query()->latest()->first();

    expect($employee->user->password)->not->toBeEmpty();
});

test('store sends invitation notification', function () {
    Notification::fake();
    $user = User::factory()->create()->assignRole('Admin');

    $this->actingAs($user)
        ->post(route('employees.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'salary' => 2500.00,
        ]);

    $employee = Employee::query()->latest()->first();

    Notification::assertSentTo(
        $employee->user,
        EmployeeInvitation::class
    );
});

test('resend invitation sends notification', function () {
    Notification::fake();
    $user = User::factory()->create()->assignRole('Admin');
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->post(route('employees.resend-invitation', $employee));

    Notification::assertSentTo(
        $employee->user,
        EmployeeInvitation::class
    );
});

test('reset password sends reset link', function () {
    Notification::fake();
    $user = User::factory()->create()->assignRole('Admin');
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->post(route('employees.reset-password', $employee));

    Notification::assertSentTo(
        $employee->user,
        ResetPassword::class
    );
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

test('unauthenticated user cannot access employee routes', function () {
    $employee = Employee::factory()->create();

    $this->post(route('employees.store'), [])->assertRedirect('/login');
    $this->put(route('employees.update', $employee), [])->assertRedirect('/login');
    $this->delete(route('employees.destroy', $employee))->assertRedirect('/login');
    $this->post(route('employees.resend-invitation', $employee))->assertRedirect('/login');
    $this->post(route('employees.reset-password', $employee))->assertRedirect('/login');
});
