<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request)
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
                $sale = Sale::create([
                    'user_id' => auth()->id(),
                    'subtotal' => $validated['subtotal'],
                    'discount' => $validated['discount'],
                    'total' => $validated['total'],
                    'status' => 'completed',
                    'payment_method' => $validated['payment_method'],
                    'cash_tendered' => $cashTendered,
                    'change_amount' => $changeAmount,
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($validated['items'] as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Product {$product->name} is out of stock.");
                    }

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
