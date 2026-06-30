<?php

namespace App\Models;

use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['code', 'description', 'discount_percent', 'scope', 'max_uses', 'used_count', 'starts_at', 'expires_at', 'is_active'])]
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
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

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>=', now());
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
        if ($this->scope === 'category') {
            $this->loadMissing('categories');
            $categoryIds = $this->categories->pluck('id');
        } elseif ($this->scope === 'product') {
            $this->loadMissing('products');
            $productIds = $this->products->pluck('id');
        }

        $matchingSubtotal = 0.0;

        foreach ($lineItems as $item) {
            $product = $item['product'];
            $quantity = $item['quantity'];

            $matches = match ($this->scope) {
                'category' => $categoryIds->contains($product->category_id),
                'product' => $productIds->contains($product->id),
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
