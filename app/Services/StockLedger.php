<?php

namespace App\Services;

use App\Enums\StockMovementReason;
use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StockLedger
{
    /**
     * Records a sale, deducting the given quantity from the product's stock.
     *
     * @throws InsufficientStockException
     * @throws InvalidArgumentException
     */
    public function recordSale(Product $product, int $quantity): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Quantity must be greater than zero.');
        }

        $this->executeMovement($product, -$quantity, StockMovementReason::Sale);
    }

    /**
     * Records a sale cancellation, adding the given quantity back to the product's stock.
     *
     * @throws InvalidArgumentException
     */
    public function recordCancellation(Product $product, int $quantity): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Quantity must be greater than zero.');
        }

        $this->executeMovement($product, $quantity, StockMovementReason::SaleCancellation);
    }

    /**
     * Manually adjusts the stock by a given quantity (can be positive or negative).
     *
     * @throws InsufficientStockException
     */
    public function adjustManually(Product $product, int $quantityChange): void
    {
        $this->executeMovement($product, $quantityChange, StockMovementReason::ManualAdjustment);
    }

    /**
     * @throws InsufficientStockException
     */
    private function executeMovement(Product $product, int $quantityChange, StockMovementReason $reason): void
    {
        DB::transaction(function () use ($product, $quantityChange, $reason) {
            $lockedProduct = Product::where('id', $product->id)->lockForUpdate()->firstOrFail();

            if ($lockedProduct->stock + $quantityChange < 0) {
                throw new InsufficientStockException(
                    "Insufficient stock for product {$product->name}. Requested change: {$quantityChange}, Available: {$lockedProduct->stock}"
                );
            }

            $lockedProduct->increment('stock', $quantityChange);

            StockMovement::create([
                'product_id' => $lockedProduct->id,
                'quantity_change' => $quantityChange,
                'reason' => $reason,
            ]);
        });
    }
}
