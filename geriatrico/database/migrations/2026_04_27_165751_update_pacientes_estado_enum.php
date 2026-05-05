<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE pacientes MODIFY COLUMN estado ENUM(
                'activo',
                'temporal',
                'ausente',
                'suspendido',
                'alta_medica',
                'egresado',
                'fallecido',
                'inactivo'
            ) DEFAULT 'activo'");
        } elseif ($driver === 'pgsql') {
            // En PostgreSQL, el enum de Laravel suele ser un VARCHAR con CHECK constraint
            // La forma más segura de "actualizarlo" es cambiar la columna a texto plano
            // o recrear la restricción. Para simplificar y asegurar compatibilidad:
            DB::statement("ALTER TABLE pacientes ALTER COLUMN estado TYPE VARCHAR(255)");
            // Opcionalmente se podría añadir un nuevo CHECK constraint aquí
        }
        // En sqlite no hacemos nada ya que no soporta MODIFY COLUMN y no valida enums estrictamente
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE pacientes MODIFY COLUMN estado ENUM(
                'activo',
                'temporal',
                'alta_medica',
                'fallecido',
                'inactivo'
            ) DEFAULT 'activo'");
        } elseif ($driver === 'pgsql') {
            // No es estrictamente necesario revertir el tipo a enum en PG si ya es varchar
        }
    }
};
