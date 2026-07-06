<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * @var list<string>
     */
    private array $paymentMethods = ['cash', 'credit_card', 'debit_card', 'pix'];

    public function index(Request $request): Response
    {
        $filters = $this->extractFilters($request);

        $sales = fn () => $this->filteredSales($filters);

        $totalSales = $sales()->count();
        $totalRevenue = $sales()->sum('total');
        $totalDiscount = $sales()->sum('discount');
        $averageTicket = $totalSales > 0 ? round($totalRevenue / $totalSales, 2) : 0;

        $salesByPaymentMethod = $sales()
            ->selectRaw('payment_method, count(*) as count, sum(total) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($item) => [
                'method' => $item->payment_method->value,
                'label' => $item->payment_method->label(),
                'count' => (int) $item->count,
                'total' => (float) $item->total,
            ]);

        $topProducts = $this->topProducts($filters)
            ->map(fn ($item) => [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'total_quantity' => (int) $item->total_quantity,
                'total_revenue' => (float) $item->total_revenue,
            ]);

        $dailySales = $sales()
            ->selectRaw('date(sold_at) as date, count(*) as count, sum(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($item) => [
                'date' => $item->date,
                'count' => (int) $item->count,
                'total' => (float) $item->total,
            ]);

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
                'start_date' => $filters['start_date'],
                'end_date' => $filters['end_date'],
                'payment_method' => $filters['payment_method'],
                'category_id' => $filters['category_id'],
                'product_id' => $filters['product_id'],
            ],
            'paymentMethods' => collect($this->paymentMethods)->map(fn ($method) => [
                'value' => $method,
                'label' => PaymentMethod::from($method)->label(),
            ]),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->extractFilters($request);

        $sales = $this->filteredSales($filters)
            ->with('items', 'user')
            ->orderBy('sold_at', 'desc')
            ->get();

        $filename = "sales_report_{$filters['start_date']}_{$filters['end_date']}.csv";

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
                    $sale->payment_method->label(),
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

    public function exportPdf(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $filters = $this->extractFilters($request);

        $sales = fn () => $this->filteredSales($filters);

        $totalSales = $sales()->count();
        $totalRevenue = $sales()->sum('total');
        $totalDiscount = $sales()->sum('discount');
        $averageTicket = $totalSales > 0 ? round($totalRevenue / $totalSales, 2) : 0;

        $paymentMethods = $sales()
            ->selectRaw('payment_method, count(*) as count, sum(total) as total')
            ->groupBy('payment_method')
            ->get();

        $topProducts = $this->topProducts($filters);

        $dailySales = $sales()
            ->selectRaw('date(sold_at) as date, count(*) as count, sum(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $pdf = Pdf::loadView('reports.pdf', [
            'startDate' => $filters['start_date'],
            'endDate' => $filters['end_date'],
            'activeFilters' => $this->activeFilterLabels($filters),
            'summary' => [
                'total_sales' => $totalSales,
                'total_revenue' => (float) $totalRevenue,
                'total_discount' => (float) $totalDiscount,
                'average_ticket' => $averageTicket,
            ],
            'topProducts' => $topProducts,
            'paymentMethods' => $paymentMethods,
            'dailySales' => $dailySales,
        ]);

        return $pdf->download("sales_report_{$filters['start_date']}_{$filters['end_date']}.pdf");
    }

    /**
     * Normalise the request into the report filter set.
     *
     * @return array{start_date: string, end_date: string, start: Carbon, end: Carbon, payment_method: ?string, category_id: ?int, product_id: ?int}
     */
    private function extractFilters(Request $request): array
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $paymentMethod = $request->input('payment_method');
        if (! in_array($paymentMethod, $this->paymentMethods, true)) {
            $paymentMethod = null;
        }

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start' => Carbon::parse($startDate)->startOfDay(),
            'end' => Carbon::parse($endDate)->endOfDay(),
            'payment_method' => $paymentMethod,
            'category_id' => $request->filled('category_id') ? (int) $request->input('category_id') : null,
            'product_id' => $request->filled('product_id') ? (int) $request->input('product_id') : null,
        ];
    }

    /**
     * @param  array{start: Carbon, end: Carbon, payment_method: ?string, category_id: ?int, product_id: ?int}  $filters
     */
    private function filteredSales(array $filters): Builder
    {
        return $this->applySaleFilters(Sale::query(), $filters);
    }

    /**
     * @param  array{start: Carbon, end: Carbon, payment_method: ?string, category_id: ?int, product_id: ?int}  $filters
     */
    private function applySaleFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->whereBetween('sold_at', [$filters['start'], $filters['end']])
            ->where('status', 'completed')
            ->when($filters['payment_method'], fn (Builder $q) => $q->where('payment_method', $filters['payment_method']))
            ->when($filters['category_id'], fn (Builder $q) => $q->whereHas('items.product', fn (Builder $p) => $p->where('category_id', $filters['category_id'])))
            ->when($filters['product_id'], fn (Builder $q) => $q->whereHas('items', fn (Builder $i) => $i->where('product_id', $filters['product_id'])));
    }

    /**
     * @param  array{start: Carbon, end: Carbon, payment_method: ?string, category_id: ?int, product_id: ?int}  $filters
     * @return Collection<int, SaleItem>
     */
    private function topProducts(array $filters): Collection
    {
        return SaleItem::whereHas('sale', fn (Builder $query) => $this->applySaleFilters($query, $filters))
            ->when($filters['category_id'], fn (Builder $q) => $q->whereHas('product', fn (Builder $p) => $p->where('category_id', $filters['category_id'])))
            ->when($filters['product_id'], fn (Builder $q) => $q->where('product_id', $filters['product_id']))
            ->selectRaw('product_id, product_name, sum(quantity) as total_quantity, sum(total) as total_revenue')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();
    }

    /**
     * Human-readable labels for the filters that are currently applied.
     *
     * @param  array{payment_method: ?string, category_id: ?int, product_id: ?int}  $filters
     * @return list<string>
     */
    private function activeFilterLabels(array $filters): array
    {
        $labels = [];

        if ($filters['payment_method']) {
            $labels[] = 'Payment: '.PaymentMethod::from($filters['payment_method'])->label();
        }

        if ($filters['category_id']) {
            $labels[] = 'Category: '.(Category::find($filters['category_id'])?->name ?? '—');
        }

        if ($filters['product_id']) {
            $labels[] = 'Product: '.(Product::find($filters['product_id'])?->name ?? '—');
        }

        return $labels;
    }
}
