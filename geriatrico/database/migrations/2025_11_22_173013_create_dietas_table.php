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
        Schema::create('dietas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->string('tipo'); // General, Diabética, Hiposódica, Hipercalórica, etc.
            $table->string('consistencia')->default('solida'); // Sólida, Blanda, Procesada/Papilla, Líquida
            $table->text('alergias')->nullable();
            $table->text('observaciones')->nullable(); // Gustos, rechazos, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dietas');
    }
};
