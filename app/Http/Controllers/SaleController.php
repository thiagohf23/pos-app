<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Sale::with(['user', 'items'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%");
                        })
                        ->orWhere('payment_method', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($startDate, function ($query, $startDate) {
                $query->whereDate('sold_at', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                $query->whereDate('sold_at', '<=', $endDate);
            });

        $summaryData = (clone $query)
            ->selectRaw('COALESCE(SUM(total), 0) as total_revenue, COUNT(*) as total_sales, COALESCE(SUM(discount), 0) as total_discounts')
            ->first();

        $summary = [
            'total_revenue' => (float) ($summaryData->total_revenue ?? 0),
            'total_sales' => (int) ($summaryData->total_sales ?? 0),
            'total_discounts' => (float) ($summaryData->total_discounts ?? 0),
        ];

        $sales = $query->latest('sold_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
