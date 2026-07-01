<?php

use App\Models\Supplier;
use App\Models\User;

test('authenticated user can create a supplier', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('suppliers.store'), [
            'name' => 'Acme Corp',
            'email' => 'contato@acme.com',
            'phone' => '(11) 99999-9999',
            'cpf_cnpj' => '00.000.000/0001-00',
            'address' => 'Rua Exemplo, 123',
            'is_active' => true,
        ]);

    $response->assertRedirect(route('suppliers.index'));

    $this->assertDatabaseHas('suppliers', [
        'email' => 'contato@acme.com',
    ]);
});

test('authenticated user can update a supplier', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();

    $this->actingAs($user)
        ->put(route('suppliers.update', $supplier), [
            'name' => 'Updated Corp',
            'email' => $supplier->email,
            'is_active' => true,
        ]);

    $supplier->refresh();

    expect($supplier->name)->toBe('Updated Corp');
});

test('supplier email must be unique', function () {
    $user = User::factory()->create();
    Supplier::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs($user)->post(route('suppliers.store'), [
        'name' => 'Dupe',
        'email' => 'taken@example.com',
    ]);

    $this->assertDatabaseCount('suppliers', 1);
});

test('authenticated user can delete a supplier', function () {
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create();

    $this->actingAs($user)
        ->delete(route('suppliers.destroy', $supplier));

    $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
});
