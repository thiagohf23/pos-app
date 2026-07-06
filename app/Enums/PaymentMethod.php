<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case CreditCard = 'credit_card';
    case DebitCard = 'debit_card';
    case Pix = 'pix';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Dinheiro',
            self::CreditCard => 'Cartão de Crédito',
            self::DebitCard => 'Cartão de Débito',
            self::Pix => 'Pix',
        };
    }
}
