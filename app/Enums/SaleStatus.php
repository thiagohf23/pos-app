<?php

namespace App\Enums;

enum SaleStatus: string
{
    case Completed = 'completed';
    case Pending = 'pending';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Completed => 'Concluída',
            self::Pending => 'Pendente',
            self::Cancelled => 'Cancelada',
        };
    }
}
