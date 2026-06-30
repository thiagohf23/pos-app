<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pos/index', [
            'products' => Inertia::defer(fn () => Product::with('category')
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->orderBy('name', 'asc')
                ->get(), 'catalog'),
            'categories' => Inertia::defer(fn () => Category::where('is_active', true)
                ->orderBy('name', 'asc')
                ->get(), 'catalog'),
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
            'payment_method' => 'required|string|in:cash,credit_card,debit_card,pix',
            'cash_tendered' => 'nullable|required_if:payment_method,cash|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $isCash = $validated['payment_method'] === 'cash';
        $cashTendered = $isCash ? ($validated['cash_tendered'] ?? $validated['total']) : null;
        $changeAmount = $isCash ? round(max(0, $cashTendered - $validated['total']), 2) : null;

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
            $product = Product::find($item['product_id']);
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

        return response()->json([
            'sale' => $sale->load('items'),
            'message' => 'Sale completed successfully',
        ]);
    }

    public function show(Sale $sale): Response
    {
        return Inertia::render('pos/receipt', [
            'sale' => $sale->load('items'),
        ]);
    }
}
