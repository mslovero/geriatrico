<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_items', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->enum('tipo', ['medicamento', 'insumo'])->default('medicamento');
            $table->string('codigo')->nullable()->unique();
            $table->text('descripcion')->nullable();
            $table->string('unidad_medida')->default('unidad'); // unidad, caja, frasco, etc.
            $table->integer('stock_actual')->default(0);
            $table->integer('stock_minimo')->default(0);
            $table->integer('stock_maximo')->nullable();
            $table->decimal('precio_unitario', 10, 2)->nullable();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores')->onDelete('set null');
            $table->date('fecha_vencimiento')->nullable();
            $table->string('lote')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_items');
    }
};
