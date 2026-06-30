<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('payment_method')->default('credit_card')->after('status');
            $table->decimal('cash_tendered', 10, 2)->nullable()->after('payment_method');
            $table->decimal('change_amount', 10, 2)->nullable()->after('cash_tendered');
            $table->text('notes')->nullable()->after('change_amount');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'cash_tendered', 'change_amount', 'notes']);
        });
    }
};
