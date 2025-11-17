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
        Schema::create('historial_medicos', function (Blueprint $table) {
            $table->id();
  // 👇 Campo correcto para la relación con pacientes
            $table->foreignId('paciente_id')
                  ->constrained('pacientes')
                  ->onDelete('cascade');            
                  $table->date('fecha');
            $table->text('observacion')->nullable();
            $table->string('medico_responsable')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_medicos');
    }
};
