<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    public function __construct(
        protected PermissionRegistrar $permissionRegistrar,
    ) {}

    public function index()
    {
        $permissions = Permission::latest()->paginate(10);

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
        ]);
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        Permission::create($request->validated());

        $this->permissionRegistrar->forgetCachedPermissions();

        return redirect()->route('permissions.index');
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        $permission->update($request->validated());

        $this->permissionRegistrar->forgetCachedPermissions();

        return redirect()->route('permissions.index');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();

        $this->permissionRegistrar->forgetCachedPermissions();

        return redirect()->route('permissions.index');
    }
}
