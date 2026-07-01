<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(PermissionRegistrar $permissionRegistrar): void
    {
        $permissionRegistrar->forgetCachedPermissions();

        $permissions = collect([
            'dashboard.view',

            'products.view',
            'products.create',
            'products.edit',
            'products.delete',

            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',

            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',

            'suppliers.view',
            'suppliers.create',
            'suppliers.edit',
            'suppliers.delete',

            'coupons.view',
            'coupons.create',
            'coupons.edit',
            'coupons.delete',

            'pos.access',
            'pos.checkout',

            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',
        ]);

        $permissions->each(fn (string $name) => Permission::create(compact('name')));

        // Refresh the cache so syncPermissions() below can resolve the names just created.
        $permissionRegistrar->forgetCachedPermissions();

        $roles = [
            'Admin' => $permissions,
            'Employee' => $permissions->filter(fn (string $p) => str($p)->startsWith(['dashboard', 'products', 'categories', 'pos'])),
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::create(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }

        User::where('email', 'test@example.com')->first()?->assignRole('Admin');

        $permissionRegistrar->forgetCachedPermissions();
    }
}
