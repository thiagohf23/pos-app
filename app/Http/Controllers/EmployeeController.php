<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    public function index(): InertiaResponse
    {
        $employees = Employee::with('roles')->latest()->paginate(10);

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'roles' => Role::all(),
        ]);
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $employee = Employee::create($request->validated());

        if ($request->filled('role_id')) {
            $employee->syncRoles([$request->input('role_id')]);
        }

        return redirect()->route('employees.index');
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $employee->update($request->validated());

        if ($request->has('role_id')) {
            $employee->syncRoles($request->filled('role_id') ? [$request->input('role_id')] : []);
        }

        return redirect()->route('employees.index');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->route('employees.index');
    }
}
