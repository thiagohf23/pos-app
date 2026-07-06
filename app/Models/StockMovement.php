<?php

namespace App\Models;

use App\Enums\StockMovementReason;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $user_id
 * @property int|null $sale_id
 * @property int $quantity_change
 * @property StockMovementReason $reason
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['product_id', 'user_id', 'sale_id', 'quantity_change', 'reason', 'notes'])]
class StockMovement extends Model
{
    protected function casts(): array
    {
        return [
            'reason' => StockMovementReason::class,
            'quantity_change' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
