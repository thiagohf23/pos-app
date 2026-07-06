<?php

namespace App\Http\Controllers;

use App\Enums\StockMovementReason;
use App\Http\Requests\StoreStockAdjustmentRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function index(): Response
    {
        $products = Product::orderBy('name')->get(['id', 'name', 'stock']);

        $movements = StockMovement::with(['product', 'user'])
            ->latest()
            ->paginate(20);

        return Inertia::render('stock-adjustments/index', [
            'products' => $products,
            'movements' => $movements,
        ]);
    }

    public function store(StoreStockAdjustmentRequest $request): RedirectResponse
    {
        $product = Product::findOrFail($request->product_id);

        try {
            DB::transaction(function () use ($request, $product) {
                $quantityChange = $request->integer('quantity_change');

                if ($quantityChange < 0 && $product->stock + $quantityChange < 0) {
                    throw new \Exception("Cannot reduce stock below zero. Current stock: {$product->stock}.");
                }

                $product->increment('stock', $quantityChange);

                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => Auth::id(),
                    'sale_id' => null,
                    'quantity_change' => $quantityChange,
                    'reason' => StockMovementReason::ManualAdjustment,
                    'notes' => $request->notes,
                ]);
            });
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('stock-adjustments.index')
            ->with('success', "Stock for \"{$product->name}\" adjusted successfully.");
    }
}
