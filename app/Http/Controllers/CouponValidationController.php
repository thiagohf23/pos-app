<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponValidationController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (! $coupon || ! $coupon->isValid()) {
            return response()->json(['message' => 'Invalid or expired coupon.'], 422);
        }

        $productIds = [];
        foreach ($request->items as $item) {
            $productIds[] = $item['product_id'];
        }

        /** @var array<int, Product> $productsById */
        $productsById = Product::findMany($productIds)->keyBy('id')->all();

        $lineItems = [];
        foreach ($request->items as $item) {
            if (isset($productsById[$item['product_id']])) {
                $lineItems[] = [
                    'product' => $productsById[$item['product_id']],
                    'quantity' => $item['quantity'],
                ];
            }
        }

        $discount = $coupon->calculateDiscount($lineItems);

        if ($discount <= 0) {
            return response()->json(['message' => 'Coupon does not apply to any item in the cart.'], 422);
        }

        return response()->json([
            'coupon_code' => $coupon->code,
            'discount_percent' => $coupon->discount_percent,
            'scope' => $coupon->scope,
            'discount' => $discount,
        ]);
    }
}
