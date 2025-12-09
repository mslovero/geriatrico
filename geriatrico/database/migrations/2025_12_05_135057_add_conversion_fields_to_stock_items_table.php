<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->string('unidad_presentacion', 50)
                ->nullable()
                ->after('unidad_medida')
                ->comment('Cómo se compra: blister, frasco, caja, etc.');
                
            $table->decimal('factor_conversion', 10, 2)
                ->default(1)
                ->after('unidad_presentacion')
                ->comment('Cuántas unidades base tiene la presentación. Ej: 1 blister = 30 pastillas');
                
            $table->text('descripcion_presentacion')
                ->nullable()
                ->after('factor_conversion')
                ->comment('Descripción legible. Ej: "Blister de 30 comprimidos"');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->dropColumn(['unidad_presentacion', 'factor_conversion', 'descripcion_presentacion']);
        });
    }
};
