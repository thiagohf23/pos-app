<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'cpf' => $this->faker->unique()->numerify('###.###.###-##'),
            'salary' => $this->faker->randomFloat(2, 1500, 15000),
            'hire_date' => $this->faker->date(),
            'is_active' => true,
        ];
    }
}
