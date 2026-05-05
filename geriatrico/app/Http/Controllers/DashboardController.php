<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\Cama;
use App\Models\StockItem;
use App\Models\TurnoMedico;
use App\Models\SignoVital;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Estadísticas básicas de pacientes y camas
        $totalPacientes = Paciente::where('estado', 'activo')->count();
        $totalCamas = Cama::count();
        $camasOcupadas = Cama::where('estado', 'ocupada')->count();
        $camasLibres = $totalCamas - $camasOcupadas;

        // 2. Alertas de Stock
        $bajoStock = StockItem::where('activo', true)
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->count();

        // 3. Turnos próximos (próximas 48 horas)
        $turnosProximos = TurnoMedico::with('paciente')
            ->where('estado', 'pendiente')
            ->whereBetween('fecha_hora', [now(), now()->addHours(48)])
            ->orderBy('fecha_hora', 'asc')
            ->get();

        // 4. Alertas de Salud (Signos vitales fuera de rango en últimas 24h)
        // Ejemplo simple: Fiebre > 38 o Sat O2 < 94
        $alertasSalud = SignoVital::with('paciente')
            ->where('fecha', '>=', now()->subHours(24))
            ->where(function($q) {
                $q->where('temperatura', '>', 38)
                  ->orWhere('saturacion_oxigeno', '<', 94)
                  ->orWhere('glucosa', '>', 180);
            })
            ->orderBy('fecha', 'desc')
            ->get();

        // 5. Últimas Notificaciones
        $ultimasNotificaciones = Notification::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // 6. Evolución de ocupación (Simulada para gráfico o basada en historial si existiera)
        $ocupacionStats = [
            'total' => $totalCamas,
            'ocupadas' => $camasOcupadas,
            'libres' => $camasLibres,
            'porcentaje' => $totalCamas > 0 ? round(($camasOcupadas / $totalCamas) * 100) : 0
        ];

        return response()->json([
            'summary' => [
                'pacientes' => $totalPacientes,
                'camas' => $ocupacionStats,
                'bajo_stock' => $bajoStock,
                'alertas_salud' => $alertasSalud->count(),
            ],
            'turnos_proximos' => $turnosProximos,
            'alertas_salud_detalles' => $alertasSalud,
            'notificaciones' => $ultimasNotificaciones,
        ]);
    }
}
