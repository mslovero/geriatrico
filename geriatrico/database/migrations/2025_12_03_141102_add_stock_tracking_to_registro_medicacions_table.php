<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registro_medicacions', function (Blueprint $table) {
            // Relación con lote usado
            $table->foreignId('lote_stock_id')->nullable()->constrained('lotes_stock')->onDelete('set null')->after('medicacion_id');
            
            // Cantidad administrada (para descuento automático)
            $table->integer('cantidad_administrada')->default(1)->after('lote_stock_id');
            
            // Costo del medicamento en ese momento
            $table->decimal('costo_unitario', 10, 2)->nullable()->after('cantidad_administrada');
        });
    }

    public function down(): void
    {
        Schema::table('registro_medicacions', function (Blueprint $table) {
            $table->dropForeign(['lote_stock_id']);
            $table->dropColumn(['lote_stock_id', 'cantidad_administrada', 'costo_unitario']);
        });
    }
};
