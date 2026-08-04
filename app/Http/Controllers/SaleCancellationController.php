<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Models\Sale;
use App\Services\StockLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaleCancellationController extends Controller
{
    public function __invoke(Sale $sale): RedirectResponse
    {
        if ($sale->status === SaleStatus::Cancelled) {
            return back()->with('error', 'This sale has already been cancelled.');
        }

        DB::transaction(function () use ($sale) {
            $sale->load('items');
            $ledger = app(StockLedger::class);

            foreach ($sale->items as $saleItem) {
                $product = $saleItem->product;

                if ($product) {
                    $ledger->recordCancellation($product, $saleItem->quantity, [
                        'user_id' => Auth::id(),
                        'sale_id' => $sale->id,
                        'notes' => "Cancellation of Sale #{$sale->id}",
                    ]);
                }
            }

            $sale->update(['status' => SaleStatus::Cancelled]);
        });

        return back()->with('success', "Sale #{$sale->id} has been cancelled and stock has been restored.");
    }
}
