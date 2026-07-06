<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'today');

        [$start, $end] = $this->resolvePeriod($period);

        $salesQuery = fn () => Sale::where('status', 'completed')
            ->whereBetween('sold_at', [$start, $end]);

        // 1. Basic sale summaries
        $revenue = (float) $salesQuery()->sum('total');
        $salesCount = $salesQuery()->count();
        $avgTicket = $salesCount > 0 ? round($revenue / $salesCount, 2) : 0.0;

        // 2. Active products stock levels (stock is not period-dependent)
        $lowStockCount = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->where('stock', '<=', 5)
            ->count();

        $outOfStockCount = Product::where('is_active', true)
            ->where('stock', 0)
            ->count();

        // 3. Payment methods breakdown
        $paymentMethodSales = $salesQuery()
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->keyBy('payment_method')
            ->map(function ($item) {
                return [
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ];
            })
            ->toArray();

        $paymentMethods = [];
        foreach (['cash', 'credit_card', 'debit_card', 'pix'] as $method) {
            $paymentMethods[$method] = $paymentMethodSales[$method] ?? ['count' => 0, 'total' => 0.0];
        }

        // 4. Top selling products (within period)
        $topSelling = SaleItem::whereHas('sale', function ($q) use ($start, $end) {
            $q->where('status', 'completed')->whereBetween('sold_at', [$start, $end]);
        })
            ->select('product_id', 'product_name', DB::raw('sum(quantity) as quantity_sold'), DB::raw('sum(total) as revenue'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('quantity_sold')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'quantity_sold' => (int) $item->quantity_sold,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // 5. Recent sales (latest 5 in period)
        $recentSales = $salesQuery()
            ->with('user')
            ->latest('sold_at')
            ->take(5)
            ->get();

        // 6. Products with lowest stock levels (top 5 low stock products)
        $lowStockProducts = Product::with('category')
            ->where('is_active', true)
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'metrics' => [
                'revenue' => $revenue,
                'sales_count' => $salesCount,
                'avg_ticket' => $avgTicket,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'payment_methods' => $paymentMethods,
                'top_selling' => $topSelling,
                'recent_sales' => $recentSales,
                'low_stock_products' => $lowStockProducts,
            ],
            'period' => $period,
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolvePeriod(string $period): array
    {
        return match ($period) {
            'today' => [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()],
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            default => [Carbon::create(2000, 1, 1)->startOfDay(), Carbon::now()->endOfDay()],
        };
    }
}
