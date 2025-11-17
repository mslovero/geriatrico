<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellido');
            $table->string('dni')->unique();
            $table->date('fecha_nacimiento');
            

            // 🔹 Relaciones con habitación y cama
            $table->foreignId('habitacion_id')
                  ->nullable()
                  ->constrained('habitaciones')
                  ->onDelete('set null');

            $table->foreignId('cama_id')
                  ->nullable()
                  ->constrained('camas')
                  ->onDelete('set null');

            $table->json('contacto_emergencia')->nullable();
            $table->string('medico_cabecera')->nullable();

            $table->enum('estado', [
                'activo',
                'temporal',
                'alta_medica',
                'fallecido',
                'inactivo'
            ])->default('activo');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
