<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Enums\StockMovementReason;
use App\Models\Sale;
use App\Models\StockMovement;
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

            foreach ($sale->items as $saleItem) {
                $product = $saleItem->product()->lockForUpdate()->first();

                if ($product) {
                    $product->increment('stock', $saleItem->quantity);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'sale_id' => $sale->id,
                        'quantity_change' => $saleItem->quantity,
                        'reason' => StockMovementReason::SaleCancellation,
                        'notes' => "Cancellation of Sale #{$sale->id}",
                    ]);
                }
            }

            $sale->update(['status' => SaleStatus::Cancelled]);
        });

        return back()->with('success', "Sale #{$sale->id} has been cancelled and stock has been restored.");
    }
}
