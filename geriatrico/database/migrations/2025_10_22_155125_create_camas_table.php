<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camas', function (Blueprint $table) {
            $table->id();
            
            // Relación con habitaciones
            $table->foreignId('habitacion_id') ->constrained('habitaciones')->onDelete('cascade'); // Si se elimina una habitación, se borran sus camas
            $table->string('numero_cama');
            $table->enum('estado', ['libre', 'ocupada', 'mantenimiento'])->default('libre');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camas');
    }
};
