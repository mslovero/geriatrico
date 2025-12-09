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
            // Campo para determinar si el medicamento es del geriátrico o de un paciente
            $table->enum('propiedad', ['geriatrico', 'paciente'])->default('geriatrico')->after('observaciones');
            
            // ID del paciente propietario si la propiedad es 'paciente'
            $table->foreignId('paciente_propietario_id')
                ->nullable()
                ->after('propiedad')
                ->constrained('pacientes')
                ->onDelete('cascade');
            
            // Indicador si está activo en el inventario
            $table->boolean('activo')->default(true)->after('paciente_propietario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->dropForeign(['paciente_propietario_id']);
            $table->dropColumn(['propiedad', 'paciente_propietario_id', 'activo']);
        });
    }
};
