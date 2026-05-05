<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ExportDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:export {--filename= : Nombre del archivo de salida}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Exporta la base de datos a un archivo SQL (Backup)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dbName = config('database.connections.pgsql.database');
        $dbHost = config('database.connections.pgsql.host');
        $dbUser = config('database.connections.pgsql.username');
        $dbPass = config('database.connections.pgsql.password');
        
        $filename = $this->option('filename') ?: 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $path = storage_path('app/backups/' . $filename);

        // Asegurar que el directorio de backups existe
        if (!file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        $this->info("Iniciando exportación de base de datos: {$dbName}...");

        // Construir comando pg_dump
        // Nota: PGPASSWORD se usa para evitar prompt de password
        $command = "PGPASSWORD='{$dbPass}' pg_dump -h {$dbHost} -U {$dbUser} {$dbName} > {$path}";

        $result = null;
        $output = [];
        exec($command, $output, $result);

        if ($result === 0) {
            $this->info("✅ Exportación exitosa!");
            $this->info("Archivo guardado en: {$path}");
            
            // Opcional: Registrar en log de sistema
            \Log::info("Backup de base de datos generado exitosamente: {$filename}");
            
            return 0;
        } else {
            $this->error("❌ Error al exportar la base de datos.");
            \Log::error("Fallo al generar backup de base de datos.");
            return 1;
        }
    }
}
