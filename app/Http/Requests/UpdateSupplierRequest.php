<?php

namespace App\Http\Requests;

use App\Models\Supplier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $supplierId = $this->route('supplier') instanceof Supplier
            ? $this->route('supplier')->id
            : $this->route('supplier');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('suppliers', 'email')->ignore($supplierId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'cpf_cnpj' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('suppliers', 'cpf_cnpj')->ignore($supplierId),
            ],
            'address' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
