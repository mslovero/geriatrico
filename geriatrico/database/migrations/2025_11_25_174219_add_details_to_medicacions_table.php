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
        Schema::table('medicacions', function (Blueprint $table) {
            $table->enum('tipo', ['diaria', 'sos'])->default('diaria')->after('observaciones');
            $table->integer('cantidad_mensual')->nullable()->after('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicacions', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'cantidad_mensual']);
        });
    }
};
