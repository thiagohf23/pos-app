<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bebidas = Category::where('name', 'Bebidas')->first();
        $eletronicos = Category::where('name', 'Eletrônicos')->first();
        $lanches = Category::where('name', 'Lanches & Comida')->first();
        $vestuario = Category::where('name', 'Vestuário & Acessórios')->first();

        $products = [
            // Bebidas
            [
                'category_id' => $bebidas?->id,
                'name' => 'Coca-Cola Lata',
                'description' => 'Refrigerante de cola lata 350ml bem gelado',
                'price' => 4.50,
                'stock' => 100,
                'image' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $bebidas?->id,
                'name' => 'Suco de Laranja 500ml',
                'description' => 'Suco de laranja natural, sem conservantes',
                'price' => 8.90,
                'stock' => 30,
                'image' => 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $bebidas?->id,
                'name' => 'Cerveja Artesanal IPA',
                'description' => 'Cerveja artesanal estilo India Pale Ale 500ml',
                'price' => 18.00,
                'stock' => 45,
                'image' => 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $bebidas?->id,
                'name' => 'Água Mineral 500ml',
                'description' => 'Água mineral sem gás com PH neutro',
                'price' => 2.50,
                'stock' => 200,
                'image' => 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=60',
            ],

            // Eletrônicos
            [
                'category_id' => $eletronicos?->id,
                'name' => 'Mouse Sem Fio',
                'description' => 'Mouse ergonômico sem fio com receptor USB',
                'price' => 59.90,
                'stock' => 25,
                'image' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $eletronicos?->id,
                'name' => 'Teclado Mecânico RGB',
                'description' => 'Teclado mecânico switch azul com iluminação RGB',
                'price' => 189.90,
                'stock' => 15,
                'image' => 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $eletronicos?->id,
                'name' => 'Fone de Ouvido Bluetooth',
                'description' => 'Headphone Bluetooth com cancelamento de ruído passivo',
                'price' => 129.90,
                'stock' => 20,
                'image' => 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $eletronicos?->id,
                'name' => 'Carregador Rápido USB-C',
                'description' => 'Carregador de parede 20W compatível com múltiplos dispositivos',
                'price' => 45.00,
                'stock' => 50,
                'image' => 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60',
            ],

            // Lanches & Comida
            [
                'category_id' => $lanches?->id,
                'name' => 'Hambúrguer Gourmet',
                'description' => 'Pão brioche, blend de 150g, queijo cheddar e molho especial',
                'price' => 28.90,
                'stock' => 40,
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $lanches?->id,
                'name' => 'Batata Frita Tradicional',
                'description' => 'Porção individual de batatas fritas crocantes com sal e alecrim',
                'price' => 12.00,
                'stock' => 60,
                'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $lanches?->id,
                'name' => 'Pizza Brotinho Calabresa',
                'description' => 'Pizza brotinho com calabresa selecionada, cebola e orégano',
                'price' => 22.00,
                'stock' => 15,
                'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $lanches?->id,
                'name' => 'Sanduíche Natural de Frango',
                'description' => 'Pão integral, frango desfiado, maionese light, alface e cenoura',
                'price' => 9.90,
                'stock' => 25,
                'image' => 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=60',
            ],

            // Vestuário & Acessórios
            [
                'category_id' => $vestuario?->id,
                'name' => 'Camiseta Básica Preta',
                'description' => 'Camiseta 100% algodão cor preta tamanho M',
                'price' => 39.90,
                'stock' => 30,
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $vestuario?->id,
                'name' => 'Boné Esportivo',
                'description' => 'Boné regulável com aba curva e tecido respirável',
                'price' => 49.90,
                'stock' => 15,
                'image' => 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60',
            ],
            [
                'category_id' => $vestuario?->id,
                'name' => 'Meias Cano Médio (Par)',
                'description' => 'Par de meias brancas cano médio reforçadas para treino',
                'price' => 15.00,
                'stock' => 80,
                'image' => 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500&auto=format&fit=crop&q=60',
            ],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(
                ['name' => $prod['name']],
                [
                    'category_id' => $prod['category_id'],
                    'description' => $prod['description'],
                    'price' => $prod['price'],
                    'stock' => $prod['stock'],
                    'image' => $prod['image'],
                    'is_active' => true,
                ]
            );
        }
    }
}
