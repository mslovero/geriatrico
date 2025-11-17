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
        Schema::create('medicacions', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('dosis')->nullable();
            $table->string('frecuencia')->nullable();
            $table->text('observaciones')->nullable();
            $table->unsignedBigInteger('paciente_id');
            $table->foreign(columns: 'paciente_id')
                  ->references('id')
                  ->on('pacientes') 
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicacions');
    }
};
