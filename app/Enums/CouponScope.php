<?php

namespace App\Enums;

enum CouponScope: string
{
    case All = 'all';
    case Category = 'category';
    case Product = 'product';

    public function label(): string
    {
        return match ($this) {
            self::All => 'Todos os produtos',
            self::Category => 'Categoria específica',
            self::Product => 'Produto específico',
        };
    }
}
