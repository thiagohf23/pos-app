<?php

namespace App\Enums;

enum StockMovementReason: string
{
    case Sale = 'sale';
    case SaleCancellation = 'sale_cancellation';
    case ManualAdjustment = 'manual_adjustment';

    public function label(): string
    {
        return match ($this) {
            self::Sale => 'Sale',
            self::SaleCancellation => 'Sale Cancellation',
            self::ManualAdjustment => 'Manual Adjustment',
        };
    }
}
