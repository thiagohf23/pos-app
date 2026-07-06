<?php

namespace App\Http\Controllers;

use App\Enums\CouponScope;
use App\Http\Requests\StoreCouponRequest;
use App\Http\Requests\UpdateCouponRequest;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CouponController extends Controller
{
    public function index(): InertiaResponse
    {
        $coupons = Coupon::with(['categories:id,name', 'products:id,name'])->latest()->paginate(10);
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $products = Product::orderBy('name')->get(['id', 'name']);

        return Inertia::render('coupons/index', [
            'coupons' => $coupons,
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    public function store(StoreCouponRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $categoryIds = Arr::pull($data, 'category_ids');
        $productIds = Arr::pull($data, 'product_ids');

        $coupon = Coupon::create($data);

        match ($coupon->scope) {
            CouponScope::Category => [$coupon->categories()->sync($categoryIds ?? []), $coupon->products()->detach()],
            CouponScope::Product => [$coupon->products()->sync($productIds ?? []), $coupon->categories()->detach()],
            default => [$coupon->categories()->detach(), $coupon->products()->detach()],
        };

        return redirect()->route('coupons.index');
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $data = $request->validated();

        $categoryIds = Arr::pull($data, 'category_ids');
        $productIds = Arr::pull($data, 'product_ids');

        $coupon->update($data);

        match ($coupon->scope) {
            CouponScope::Category => [$coupon->categories()->sync($categoryIds ?? []), $coupon->products()->detach()],
            CouponScope::Product => [$coupon->products()->sync($productIds ?? []), $coupon->categories()->detach()],
            default => [$coupon->categories()->detach(), $coupon->products()->detach()],
        };

        return redirect()->route('coupons.index');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return redirect()->route('coupons.index');
    }
}
