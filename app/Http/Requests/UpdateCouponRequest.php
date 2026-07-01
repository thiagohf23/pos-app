<?php

namespace App\Http\Requests;

use App\Models\Coupon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCouponRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $couponId = $this->route('coupon') instanceof Coupon
            ? $this->route('coupon')->id
            : $this->route('coupon');

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($couponId)],
            'description' => ['nullable', 'string'],
            'discount_percent' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'scope' => ['required', 'in:all,category,product'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
            'category_ids' => ['required_if:scope,category', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'product_ids' => ['required_if:scope,product', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ];
    }
}
