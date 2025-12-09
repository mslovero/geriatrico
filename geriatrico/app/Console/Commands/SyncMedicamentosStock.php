<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Medicacion;
use App\Models\StockItem;

class SyncMedicamentosStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:sync-medicamentos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincroniza medicamentos existentes creando items de stock faltantes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $medicamentos = Medicacion::whereNull('stock_item_id')
            ->whereIn('origen_pago', ['paciente', 'geriatrico'])
            ->get();

        $count = $medicamentos->count();
        $this->info("Encontrados {$count} medicamentos sin vincular.");

        $bar = $this->output->createProgressBar($count);
        $creados = 0;
        $vinculados = 0;

        foreach ($medicamentos as $med) {
            // 1. Buscar existente
            $query = StockItem::where('activo', true)
                ->where('nombre', 'LIKE', '%' . $med->nombre . '%');

            if ($med->origen_pago === 'geriatrico') {
                $query->where('propiedad', 'geriatrico');
            } elseif ($med->origen_pago === 'paciente') {
                $query->where('propiedad', 'paciente')
                      ->where('paciente_propietario_id', $med->paciente_id);
            }

            $stockItem = $query->first();

            if ($stockItem) {
                $med->stock_item_id = $stockItem->id;
                $med->save();
                $vinculados++;
            } 
            // 2. Si es de paciente y no existe, crear
            elseif ($med->origen_pago === 'paciente') {
                $nuevoStock = StockItem::create([
                    'nombre' => $med->nombre . ' (' . ($med->dosis ?? 'S/D') . ')',
                    'tipo' => 'medicamento',
                    'propiedad' => 'paciente',
                    'paciente_propietario_id' => $med->paciente_id,
                    'stock_actual' => 0,
                    'stock_minimo' => 5,
                    'descripcion' => 'Sincronizado automáticamente',
                    'activo' => true
                ]);

                $med->stock_item_id = $nuevoStock->id;
                $med->save();
                $creados++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Proceso completado.");
        $this->table(
            ['Acción', 'Cantidad'],
            [
                ['Vinculados a existente', $vinculados],
                ['Nuevos stocks creados', $creados],
                ['Sin acción (Geriátrico sin stock)', $count - $vinculados - $creados]
            ]
        );
    }
}
