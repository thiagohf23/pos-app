<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $sales = Sale::whereBetween('sold_at', [$start, $end])
            ->where('status', 'completed');

        $totalSales = (clone $sales)->count();
        $totalRevenue = (clone $sales)->sum('total');
        $totalDiscount = (clone $sales)->sum('discount');
        $averageTicket = $totalSales > 0 ? round($totalRevenue / $totalSales, 2) : 0;

        $salesByPaymentMethod = (clone $sales)
            ->selectRaw('payment_method, count(*) as count, sum(total) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($item) => [
                'method' => $item->payment_method,
                'label' => $this->paymentMethodLabel($item->payment_method),
                'count' => (int) $item->count,
                'total' => (float) $item->total,
            ]);

        $topProducts = SaleItem::whereHas('sale', function ($query) use ($start, $end) {
            $query->whereBetween('sold_at', [$start, $end])
                ->where('status', 'completed');
        })
            ->selectRaw('product_id, product_name, sum(quantity) as total_quantity, sum(total) as total_revenue')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        $dailySales = (clone $sales)
            ->selectRaw('date(sold_at) as date, count(*) as count, sum(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('reports/index', [
            'summary' => [
                'total_sales' => $totalSales,
                'total_revenue' => (float) $totalRevenue,
                'total_discount' => (float) $totalDiscount,
                'average_ticket' => $averageTicket,
            ],
            'salesByPaymentMethod' => $salesByPaymentMethod,
            'topProducts' => $topProducts,
            'dailySales' => $dailySales,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request): Response
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $sales = Sale::whereBetween('sold_at', [$start, $end])
            ->where('status', 'completed')
            ->with('items', 'user')
            ->orderBy('sold_at', 'desc')
            ->get();

        $filename = "sales_report_{$startDate}_{$endDate}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($sales) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Sale ID',
                'Date',
                'Cashier',
                'Payment Method',
                'Subtotal',
                'Discount',
                'Total',
                'Cash Tendered',
                'Change',
                'Items',
            ]);

            foreach ($sales as $sale) {
                fputcsv($file, [
                    $sale->id,
                    $sale->sold_at->format('d/m/Y H:i'),
                    $sale->user->name,
                    $this->paymentMethodLabel($sale->payment_method),
                    number_format($sale->subtotal, 2, '.', ''),
                    number_format($sale->discount, 2, '.', ''),
                    number_format($sale->total, 2, '.', ''),
                    $sale->cash_tendered ? number_format($sale->cash_tendered, 2, '.', '') : '',
                    $sale->change_amount ? number_format($sale->change_amount, 2, '.', '') : '',
                    $sale->items->sum('quantity'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function paymentMethodLabel(string $method): string
    {
        return match ($method) {
            'cash' => 'Cash',
            'credit_card' => 'Credit Card',
            'debit_card' => 'Debit Card',
            'pix' => 'PIX',
            default => $method,
        };
    }
}
