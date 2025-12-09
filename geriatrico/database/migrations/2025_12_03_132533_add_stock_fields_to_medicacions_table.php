<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicacions', function (Blueprint $table) {
            $table->enum('origen_pago', ['obra_social', 'geriatrico', 'paciente'])->default('geriatrico')->after('fecha_fin');
            $table->foreignId('stock_item_id')->nullable()->constrained('stock_items')->onDelete('set null')->after('origen_pago');
        });
    }

    public function down(): void
    {
        Schema::table('medicacions', function (Blueprint $table) {
            $table->dropForeign(['stock_item_id']);
            $table->dropColumn(['origen_pago', 'stock_item_id']);
        });
    }
};
