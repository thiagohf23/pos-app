<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockAdjustmentRequest;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
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
            $quantityChange = $request->integer('quantity_change');

            app(StockLedger::class)->adjustManually($product, $quantityChange, [
                'user_id' => Auth::id(),
                'notes' => $request->notes,
            ]);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('stock-adjustments.index')
            ->with('success', "Stock for \"{$product->name}\" adjusted successfully.");
    }
}
