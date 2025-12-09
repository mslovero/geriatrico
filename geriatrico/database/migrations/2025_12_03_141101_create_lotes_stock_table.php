<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lotes_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_item_id')->constrained('stock_items')->onDelete('cascade');
            $table->string('numero_lote');
            $table->date('fecha_vencimiento');
            $table->date('fecha_ingreso');
            $table->integer('cantidad_inicial');
            $table->integer('cantidad_actual');
            $table->decimal('precio_compra', 10, 2)->nullable();
            $table->string('proveedor_factura')->nullable();
            $table->text('observaciones')->nullable();
            $table->enum('estado', ['activo', 'vencido', 'agotado'])->default('activo');
            $table->timestamps();
            
            // Índice para búsquedas rápidas
            $table->index(['stock_item_id', 'estado']);
            $table->index('fecha_vencimiento');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lotes_stock');
    }
};
