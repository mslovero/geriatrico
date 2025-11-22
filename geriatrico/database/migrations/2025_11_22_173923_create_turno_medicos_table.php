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
        Schema::create('turno_medicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->string('profesional'); // Nombre del médico o especialista
            $table->string('especialidad'); // Cardiólogo, Dentista, etc.
            $table->dateTime('fecha_hora');
            $table->string('lugar')->nullable(); // Dirección o consultorio
            $table->enum('estado', ['pendiente', 'completado', 'cancelado'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turno_medicos');
    }
};
