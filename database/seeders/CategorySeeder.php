<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Bebidas',
                'description' => 'Refrigerantes, sucos, cervejas e águas',
            ],
            [
                'name' => 'Eletrônicos',
                'description' => 'Periféricos e acessórios de tecnologia',
            ],
            [
                'name' => 'Lanches & Comida',
                'description' => 'Pratos rápidos, sanduíches e porções',
            ],
            [
                'name' => 'Vestuário & Acessórios',
                'description' => 'Roupas básicas e bonés',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['name' => $cat['name']],
                [
                    'description' => $cat['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
