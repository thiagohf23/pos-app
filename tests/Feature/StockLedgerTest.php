<?php

use App\Enums\StockMovementReason;
use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockLedger;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->ledger = app(StockLedger::class);
    $this->product = Product::factory()->create(['stock' => 10]);
});

it('records a sale and decreases stock', function () {
    $this->ledger->recordSale($this->product, 3);

    expect($this->product->fresh()->stock)->toBe(7);

    $movement = StockMovement::where('product_id', $this->product->id)->first();
    expect($movement)
        ->not->toBeNull()
        ->and($movement->quantity_change)->toBe(-3)
        ->and($movement->reason)->toBe(StockMovementReason::Sale);
});

it('throws InvalidArgumentException when recording a sale with negative quantity', function () {
    $this->ledger->recordSale($this->product, -5);
})->throws(InvalidArgumentException::class, 'Quantity must be greater than zero.');

it('throws InsufficientStockException when sale drops stock below zero', function () {
    $this->ledger->recordSale($this->product, 15);
})->throws(InsufficientStockException::class);

it('records a sale cancellation and increases stock', function () {
    $this->ledger->recordCancellation($this->product, 3);

    expect($this->product->fresh()->stock)->toBe(13);

    $movement = StockMovement::where('product_id', $this->product->id)->first();
    expect($movement)
        ->not->toBeNull()
        ->and($movement->quantity_change)->toBe(3)
        ->and($movement->reason)->toBe(StockMovementReason::SaleCancellation);
});

it('throws InvalidArgumentException when cancelling a sale with negative quantity', function () {
    $this->ledger->recordCancellation($this->product, -5);
})->throws(InvalidArgumentException::class, 'Quantity must be greater than zero.');

it('records a manual adjustment', function () {
    $this->ledger->adjustManually($this->product, 5);

    expect($this->product->fresh()->stock)->toBe(15);

    $movement = StockMovement::where('product_id', $this->product->id)->first();
    expect($movement)
        ->not->toBeNull()
        ->and($movement->quantity_change)->toBe(5)
        ->and($movement->reason)->toBe(StockMovementReason::ManualAdjustment);
});

it('throws InsufficientStockException on manual adjustment dropping below zero', function () {
    $this->ledger->adjustManually($this->product, -15);
})->throws(InsufficientStockException::class);
