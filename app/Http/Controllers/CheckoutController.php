<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,credit_card,debit_card,pix',
            'cash_tendered' => 'nullable|required_if:payment_method,cash|numeric|min:0',
            'notes' => 'nullable|string',
            'coupon_code' => 'nullable|string',
        ]);

        $cashTendered = $validated['cash_tendered'] ?? null;
        $changeAmount = null;

        if ($validated['payment_method'] === 'cash') {
            if ($cashTendered < $validated['total']) {
                return response()->json([
                    'message' => 'Amount paid is less than total.',
                ], 422);
            }
            $changeAmount = round($cashTendered - $validated['total'], 2);
        }

        try {
            $sale = DB::transaction(function () use ($validated, $cashTendered, $changeAmount) {
                /** @var array<int, Product> $lockedProducts */
                $lockedProducts = [];

                foreach ($validated['items'] as $item) {
                    $product = Product::where('id', $item['product_id'])->lockForUpdate()->firstOrFail();

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Product {$product->name} is out of stock.");
                    }

                    $lockedProducts[$item['product_id']] = $product;
                }

                $discount = $validated['discount'];
                $total = $validated['total'];
                $couponId = null;
                $couponCode = null;

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
                    $total = round($validated['subtotal'] - $discount, 2);
                    $couponId = $coupon->id;
                    $couponCode = $coupon->code;
                }

                $sale = Sale::create([
                    'user_id' => auth()->id(),
                    'subtotal' => $validated['subtotal'],
                    'discount' => $discount,
                    'total' => $total,
                    'status' => 'completed',
                    'payment_method' => $validated['payment_method'],
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

                    $product->decrement('stock', $item['quantity']);
                }

                if (! empty($validated['coupon_code']) && isset($coupon)) {
                    $coupon->increment('used_count');
                }

                return $sale;
            });

            return response()->json([
                'sale' => $sale->load('items'),
                'message' => 'Sale completed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
