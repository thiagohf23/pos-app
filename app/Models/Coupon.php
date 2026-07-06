<?php

namespace App\Models;

use App\Enums\CouponScope;
use Carbon\Carbon;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $code
 * @property string|null $description
 * @property float $discount_percent
 * @property CouponScope $scope
 * @property int|null $max_uses
 * @property int $used_count
 * @property Carbon $starts_at
 * @property Carbon $expires_at
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['code', 'description', 'discount_percent', 'scope', 'max_uses', 'used_count', 'starts_at', 'expires_at', 'is_active'])]
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
            'scope' => CouponScope::class,
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'max_uses' => 'integer',
            'used_count' => 'integer',
        ];
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    public function isValid(): bool
    {
        return $this->is_active
            && now()->between($this->starts_at, $this->expires_at)
            && ($this->max_uses === null || $this->used_count < $this->max_uses);
    }

    /**
     * @param  array<int, array{product: Product, quantity: int}>  $lineItems
     */
    public function calculateDiscount(array $lineItems): float
    {
        $categoryIds = null;
        $productIds = null;

        if ($this->scope === CouponScope::Category) {
            $this->loadMissing('categories');
            $categoryIds = $this->categories->pluck('id');
        } elseif ($this->scope === CouponScope::Product) {
            $this->loadMissing('products');
            $productIds = $this->products->pluck('id');
        }

        $matchingSubtotal = 0.0;

        foreach ($lineItems as $item) {
            $product = $item['product'];
            $quantity = $item['quantity'];

            $matches = match ($this->scope) {
                CouponScope::Category => (bool) $categoryIds?->contains($product->category_id),
                CouponScope::Product => (bool) $productIds?->contains($product->id),
                default => true,
            };

            if ($matches) {
                $matchingSubtotal += (float) $product->price * $quantity;
            }
        }

        if ($matchingSubtotal === 0.0) {
            return 0.0;
        }

        return round($matchingSubtotal * ((float) $this->discount_percent / 100), 2);
    }
}
