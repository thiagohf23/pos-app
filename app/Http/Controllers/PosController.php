<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index(): \Inertia\Response
    {
        $products = Product::with('category')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('name', 'asc')
            ->get();

        $categories = \App\Models\Category::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('pos/index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        $sale = Sale::create([
            'user_id' => auth()->id(),
            'subtotal' => $validated['subtotal'],
            'discount' => $validated['discount'],
            'total' => $validated['total'],
            'status' => 'completed',
        ]);

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'price' => $product->price,
                'quantity' => $item['quantity'],
                'total' => $product->price * $item['quantity'],
            ]);
            $product->decrement('stock', $item['quantity']);
        }

        return response()->json([
            'sale' => $sale->load('items'),
            'message' => 'Sale completed successfully',
        ]);
    }

    public function show(Sale $sale): \Inertia\Response
    {
        return Inertia::render('pos/receipt', [
            'sale' => $sale->load('items'),
        ]);
    }
}
