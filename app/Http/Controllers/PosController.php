<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pos/index', [
            'products' => Product::with('category')
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->orderBy('name', 'asc')
                ->get(),
            'categories' => Category::where('is_active', true)
                ->orderBy('name', 'asc')
                ->get(),
        ]);
    }

    public function show(Sale $sale): Response
    {
        return Inertia::render('pos/receipt', [
            'sale' => $sale->load('items'),
        ]);
    }
}
