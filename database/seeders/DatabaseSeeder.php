<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Roles and permissions must exist before assigning them below.
        $this->call(RolesAndPermissionsSeeder::class);

        // First admin user.
        User::factory()
            ->create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
            ])
            ->assignRole('Admin');

        // Known employee user for testing (active, so it can log in).
        $employeeUser = User::factory()->create([
            'name' => 'Employee',
            'email' => 'employee@example.com',
        ]);
        $employeeUser->assignRole('Employee');
        Employee::factory()->create(['user_id' => $employeeUser->id]);

        // 15 fictitious employees (each gets a linked User + active Employee record).
        Employee::factory()
            ->count(15)
            ->create()
            ->each(fn (Employee $employee) => $employee->user->assignRole('Employee'));

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
