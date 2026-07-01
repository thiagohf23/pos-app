<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\User;
use App\Notifications\EmployeeInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    public function index(): InertiaResponse
    {
        $employees = Employee::with('user.roles')->latest()->paginate(10);

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'roles' => Role::all(),
        ]);
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Str::password(32),
        ]);

        $employee = Employee::create([
            'user_id' => $user->id,
            'phone' => $request->input('phone'),
            'cpf' => $request->input('cpf'),
            'salary' => $request->input('salary'),
            'hire_date' => $request->input('hire_date'),
            'is_active' => $request->boolean('is_active'),
        ]);

        if ($request->filled('role_id')) {
            $user->syncRoles([$request->input('role_id')]);
        }

        $user->notify(new EmployeeInvitation(Password::createToken($user)));

        return redirect()->route('employees.index');
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $user = $employee->user;

        if ($user) {
            $user->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
            ]);

            if ($request->filled('password')) {
                $user->update(['password' => $request->input('password')]);
            }

            if ($request->has('role_id')) {
                $user->syncRoles($request->filled('role_id') ? [$request->input('role_id')] : []);
            }
        }

        $employee->update([
            'phone' => $request->input('phone'),
            'cpf' => $request->input('cpf'),
            'salary' => $request->input('salary'),
            'hire_date' => $request->input('hire_date'),
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('employees.index');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->route('employees.index');
    }

    public function resendInvitation(Employee $employee): RedirectResponse
    {
        $user = $employee->user;

        $user->notify(new EmployeeInvitation(Password::createToken($user)));

        return back()->with('success', 'Convite reenviado.');
    }

    public function resetPassword(Employee $employee): RedirectResponse
    {
        Password::sendResetLink(['email' => $employee->user->email]);

        return back()->with('success', 'Link de redefinição de senha enviado.');
    }
}
