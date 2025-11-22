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
        Schema::create('registro_medicacions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicacion_id')->constrained('medicacions')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Quién lo administró
            $table->dateTime('fecha_hora');
            $table->enum('estado', ['administrado', 'rechazado', 'suspendido', 'error'])->default('administrado');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registro_medicacions');
    }
};
