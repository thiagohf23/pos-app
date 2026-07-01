<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function __construct(
        protected PermissionRegistrar $permissionRegistrar,
    ) {}

    public function index()
    {
        $roles = Role::with('permissions')
            ->latest()
            ->paginate(10);

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => Permission::all(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create($request->safe()->only('name'));

        if ($request->filled('permissions')) {
            $role->syncPermissions(Permission::whereIn('id', $request->input('permissions'))->pluck('name'));
        }

        $this->permissionRegistrar->forgetCachedPermissions();

        return redirect()->route('roles.index');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $role->update($request->safe()->only('name'));

        if ($request->has('permissions')) {
            $role->syncPermissions(Permission::whereIn('id', $request->input('permissions'))->pluck('name'));
        }

        $this->permissionRegistrar->forgetCachedPermissions();

        return redirect()->route('roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();

        $this->permissionRegistrar->forgetCachedPermissions();

        return redirect()->route('roles.index');
    }
}
