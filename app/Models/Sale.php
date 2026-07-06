<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\SaleStatus;
use Carbon\Carbon;
use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property float $subtotal
 * @property float $discount
 * @property float $total
 * @property SaleStatus $status
 * @property PaymentMethod $payment_method
 * @property float|null $cash_tendered
 * @property float|null $change_amount
 * @property string|null $notes
 * @property int|null $coupon_id
 * @property string|null $coupon_code
 * @property Carbon $sold_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'subtotal', 'discount', 'total', 'status', 'payment_method', 'cash_tendered', 'change_amount', 'notes', 'coupon_id', 'coupon_code'])]
class Sale extends Model
{
    /** @use HasFactory<SaleFactory> */
    use HasFactory;

    /**
     * sold_at is managed by the database via useCurrent().
     * It is cast here for read access but not included in Fillable
     * because the application should not set it directly.
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'status' => SaleStatus::class,
            'payment_method' => PaymentMethod::class,
            'cash_tendered' => 'decimal:2',
            'change_amount' => 'decimal:2',
            'sold_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
