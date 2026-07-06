<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkoutService) {}

    public function store(StoreCheckoutRequest $request): JsonResponse
    {
        try {
            $sale = $this->checkoutService->process($request->validated());

            return response()->json([
                'sale' => $sale->load('items'),
                'message' => 'Sale completed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
