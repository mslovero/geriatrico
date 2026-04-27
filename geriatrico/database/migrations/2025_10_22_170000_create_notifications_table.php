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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('tipo'); // incidencia, medicacion, stock, paciente, turno, sistema
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('icono')->nullable(); // bi-exclamation-triangle, bi-capsule, etc.
            $table->string('color')->default('info'); // primary, success, warning, danger, info
            $table->string('enlace')->nullable(); // URL para navegar al hacer click
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('paciente_id')->nullable()->constrained('pacientes')->onDelete('cascade');
            $table->boolean('leida')->default(false);
            $table->timestamp('leida_at')->nullable();
            $table->timestamps();
            
            // Índices para consultas frecuentes
            $table->index(['user_id', 'leida']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
