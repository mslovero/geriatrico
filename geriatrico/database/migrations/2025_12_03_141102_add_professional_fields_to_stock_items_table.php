<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            // Categorización profesional
            $table->enum('categoria', [
                'comun',
                'psicotropico',
                'refrigerado',
                'controlado',
                'alto_costo'
            ])->default('comun')->after('tipo');
            
            // Punto de reorden automático
            $table->integer('punto_reorden')->nullable()->after('stock_minimo');
            
            // Ubicación física en almacén
            $table->string('ubicacion_almacen')->nullable()->after('punto_reorden');
            
            // Código de barras
            $table->string('codigo_barras')->nullable()->unique()->after('codigo');
            
            // Requiere receta
            $table->boolean('requiere_receta')->default(false)->after('categoria');
            
            // Temperatura de almacenamiento
            $table->string('temperatura_almacenamiento')->nullable()->after('requiere_receta');
        });
    }

    public function down(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->dropColumn([
                'categoria',
                'punto_reorden',
                'ubicacion_almacen',
                'codigo_barras',
                'requiere_receta',
                'temperatura_almacenamiento'
            ]);
        });
    }
};
