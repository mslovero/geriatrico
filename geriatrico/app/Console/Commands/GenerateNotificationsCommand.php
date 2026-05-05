<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;
use App\Models\StockItem;
use App\Models\Medicacion;
use App\Models\TurnoMedico;
use Carbon\Carbon;

class GenerateNotificationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera notificaciones automáticas por stock bajo, vencimientos y tareas pendientes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando generación de notificaciones automáticas...');
        $count = 0;

        // 1. Stock bajo
        $itemsBajoStock = StockItem::whereColumn('stock_actual', '<', 'stock_minimo')->get();
        foreach ($itemsBajoStock as $item) {
            $existe = Notification::where('tipo', 'stock_bajo')
                ->where('mensaje', 'like', "%{$item->nombre}%")
                ->where('created_at', '>', now()->subDay())
                ->exists();
            
            if (!$existe) {
                Notification::crearStockBajo($item);
                $count++;
            }
        }

        // 2. Lotes próximos a vencer (30 días)
        $proximosVencer = StockItem::with(['lotes' => function($q) {
            $q->where('fecha_vencimiento', '<=', now()->addDays(30))
              ->where('fecha_vencimiento', '>', now())
              ->where('cantidad_actual', '>', 0);
        }])->whereHas('lotes', function($q) {
            $q->where('fecha_vencimiento', '<=', now()->addDays(30))
              ->where('fecha_vencimiento', '>', now())
              ->where('cantidad_actual', '>', 0);
        })->get();
        
        foreach ($proximosVencer as $item) {
            foreach ($item->lotes as $lote) {
                $existe = Notification::where('tipo', 'stock_vencimiento')
                    ->where('mensaje', 'like', "%{$lote->numero_lote}%")
                    ->where('created_at', '>', now()->subDay())
                    ->exists();
                
                if (!$existe) {
                    Notification::crearVencimientoProximo($item, $lote);
                    $count++;
                }
            }
        }

        // 3. Medicaciones pendientes (si ya pasaron las 10:00 AM y hay muchas sin registrar)
        if (now()->hour >= 10) {
            $medicacionesPendientes = Medicacion::where('activa', true)
                ->whereDoesntHave('registros', function($q) {
                    $q->whereDate('fecha_hora', today());
                })
                ->count();
            
            if ($medicacionesPendientes > 0) {
                $existe = Notification::where('tipo', 'medicacion')
                    ->whereDate('created_at', today())
                    ->exists();
                
                if (!$existe) {
                    Notification::crearMedicacionPendiente($medicacionesPendientes);
                    $count++;
                }
            }
        }

        // 4. Turnos para hoy
        $turnosHoy = TurnoMedico::with('paciente')
            ->whereDate('fecha_hora', today())
            ->where('estado', 'pendiente')
            ->get();
        
        foreach ($turnosHoy as $turno) {
            $existe = Notification::where('tipo', 'turno')
                ->where('mensaje', 'like', "%{$turno->paciente->nombre}%")
                ->whereDate('created_at', today())
                ->exists();
            
            if (!$existe && $turno->paciente) {
                Notification::crearTurnoProgramado($turno, $turno->paciente);
                $count++;
            }
        }

        $this->info("Proceso finalizado. Se crearon {$count} nuevas notificaciones.");
    }
}
