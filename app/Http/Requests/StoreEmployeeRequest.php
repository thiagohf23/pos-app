<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],

            'phone' => ['nullable', 'string', 'max:20'],
            'cpf' => ['nullable', 'string', 'max:14', 'unique:employees,cpf'],
            'salary' => ['required', 'numeric', 'min:0'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['boolean'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
        ];
    }
}
