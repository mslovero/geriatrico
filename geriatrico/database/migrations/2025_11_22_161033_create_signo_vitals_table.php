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
        Schema::create('signo_vitals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->dateTime('fecha');
            $table->string('presion_arterial')->nullable(); // Ej: 120/80
            $table->decimal('temperatura', 4, 1)->nullable(); // Ej: 36.5
            $table->integer('frecuencia_cardiaca')->nullable(); // ppm
            $table->integer('saturacion_oxigeno')->nullable(); // %
            $table->integer('glucosa')->nullable(); // mg/dL
            $table->text('observaciones')->nullable();
            $table->string('registrado_por')->nullable(); // Nombre del enfermero/medico
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signo_vitals');
    }
};
