<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Enums\SaleStatus;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    /**
     * Process a sale checkout within a database transaction.
     *
     * @param  array{items: list<array{product_id: int, quantity: int}>, discount: float, payment_method: string, cash_tendered: float|null, notes: string|null, coupon_code: string|null}  $validated
     */
    public function process(array $validated): Sale
    {
        return DB::transaction(function () use ($validated) {
            /** @var array<int, Product> $lockedProducts */
            $lockedProducts = [];

            foreach ($validated['items'] as $item) {
                $product = Product::where('id', $item['product_id'])->lockForUpdate()->firstOrFail();

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Product {$product->name} is out of stock.");
                }

                $lockedProducts[$item['product_id']] = $product;
            }

            $serverSubtotal = 0.0;

            foreach ($validated['items'] as $item) {
                $serverSubtotal += (float) $lockedProducts[$item['product_id']]->price * $item['quantity'];
            }

            $serverSubtotal = round($serverSubtotal, 2);

            $discount = $validated['discount'];
            $total = round(max(0, $serverSubtotal - $discount), 2);
            $couponId = null;
            $couponCode = null;
            $coupon = null;

            if (! empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', $validated['coupon_code'])->lockForUpdate()->first();

                if (! $coupon || ! $coupon->isValid()) {
                    throw new \Exception('Invalid or expired coupon.');
                }

                $lineItems = [];
                foreach ($validated['items'] as $item) {
                    $lineItems[] = [
                        'product' => $lockedProducts[$item['product_id']],
                        'quantity' => $item['quantity'],
                    ];
                }

                $discount = $coupon->calculateDiscount($lineItems);

                if ($discount <= 0) {
                    throw new \Exception('Coupon does not apply to any item in the cart.');
                }

                $total = round($serverSubtotal - $discount, 2);
                $couponId = $coupon->id;
                $couponCode = $coupon->code;
            }

            $cashTendered = $validated['cash_tendered'] ?? null;
            $changeAmount = null;

            if ($validated['payment_method'] === PaymentMethod::Cash->value) {
                if ($cashTendered < $total) {
                    throw new \Exception('Amount paid is less than total.');
                }
                $changeAmount = round($cashTendered - $total, 2);
            }

            $sale = Sale::create([
                'user_id' => Auth::id(),
                'subtotal' => $serverSubtotal,
                'discount' => $discount,
                'total' => $total,
                'status' => SaleStatus::Completed,
                'payment_method' => PaymentMethod::from($validated['payment_method']),
                'cash_tendered' => $cashTendered,
                'change_amount' => $changeAmount,
                'notes' => $validated['notes'] ?? null,
                'coupon_id' => $couponId,
                'coupon_code' => $couponCode,
            ]);

            foreach ($validated['items'] as $item) {
                $product = $lockedProducts[$item['product_id']];

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'total' => $product->price * $item['quantity'],
                ]);

                app(StockLedger::class)->recordSale($product, $item['quantity'], [
                    'user_id' => Auth::id(),
                    'sale_id' => $sale->id,
                    'notes' => "Sale #{$sale->id}",
                ]);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            return $sale;
        });
    }
}
