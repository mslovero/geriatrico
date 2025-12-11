<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\StockItem;
use App\Models\Medicacion;
use App\Models\Incidencia;
use App\Models\TurnoMedico;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Obtener todas las notificaciones del usuario actual
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        
        $notificaciones = Notification::paraUsuario($userId)
            ->with('paciente:id,nombre,apellido')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
        
        return response()->json($notificaciones);
    }

    /**
     * Obtener solo notificaciones no leídas
     */
    public function noLeidas(Request $request)
    {
        $userId = auth()->id();
        
        $notificaciones = Notification::paraUsuario($userId)
            ->noLeidas()
            ->with('paciente:id,nombre,apellido')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        $count = Notification::paraUsuario($userId)->noLeidas()->count();
        
        return response()->json([
            'notificaciones' => $notificaciones,
            'total_no_leidas' => $count,
        ]);
    }

    /**
     * Marcar una notificación como leída
     */
    public function marcarLeida($id)
    {
        $notificacion = Notification::findOrFail($id);
        $notificacion->marcarLeida();
        
        return response()->json(['success' => true]);
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    public function marcarTodasLeidas(Request $request)
    {
        $userId = auth()->id();
        
        Notification::paraUsuario($userId)
            ->noLeidas()
            ->update([
                'leida' => true,
                'leida_at' => now(),
            ]);
        
        return response()->json(['success' => true]);
    }

    /**
     * Eliminar una notificación
     */
    public function destroy($id)
    {
        $notificacion = Notification::findOrFail($id);
        $notificacion->delete();
        
        return response()->json(['success' => true]);
    }

    /**
     * Eliminar notificaciones leídas antiguas
     */
    public function limpiarAntiguas()
    {
        $deleted = Notification::where('leida', true)
            ->where('leida_at', '<', now()->subDays(7))
            ->delete();
        
        return response()->json([
            'success' => true,
            'eliminadas' => $deleted,
        ]);
    }

    /**
     * Generar notificaciones automáticas basadas en eventos del sistema
     * Este método puede ser llamado desde un cron job o manualmente
     */
    public function generarAutomaticas()
    {
        $notificacionesCreadas = [];
        
        // 1. Stock bajo
        $itemsBajoStock = StockItem::whereColumn('stock_actual', '<', 'stock_minimo')->get();
        foreach ($itemsBajoStock as $item) {
            // Verificar si ya existe una notificación similar reciente (últimas 24h)
            $existe = Notification::where('tipo', 'stock_bajo')
                ->where('mensaje', 'like', "%{$item->nombre}%")
                ->where('created_at', '>', now()->subDay())
                ->exists();
            
            if (!$existe) {
                $notificacionesCreadas[] = Notification::crearStockBajo($item);
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
                    $notificacionesCreadas[] = Notification::crearVencimientoProximo($item, $lote);
                }
            }
        }
        
        // 3. Medicaciones pendientes para hoy
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
                $notificacionesCreadas[] = Notification::crearMedicacionPendiente($medicacionesPendientes);
            }
        }
        
        // 4. Turnos para hoy
        $turnosHoy = TurnoMedico::with('paciente')
            ->whereDate('fecha_hora', today())
            ->where('estado', 'programado')
            ->get();
        
        foreach ($turnosHoy as $turno) {
            $existe = Notification::where('tipo', 'turno')
                ->where('mensaje', 'like', "%{$turno->paciente->nombre}%")
                ->whereDate('created_at', today())
                ->exists();
            
            if (!$existe && $turno->paciente) {
                $notificacionesCreadas[] = Notification::crearTurnoProgramado($turno, $turno->paciente);
            }
        }
        
        return response()->json([
            'success' => true,
            'notificaciones_creadas' => count($notificacionesCreadas),
        ]);
    }

    /**
     * Obtener resumen de notificaciones para el badge
     */
    public function resumen()
    {
        $userId = auth()->id();
        
        $noLeidas = Notification::paraUsuario($userId)->noLeidas()->count();
        
        $porTipo = Notification::paraUsuario($userId)
            ->noLeidas()
            ->selectRaw('tipo, count(*) as total')
            ->groupBy('tipo')
            ->pluck('total', 'tipo');
        
        return response()->json([
            'total_no_leidas' => $noLeidas,
            'por_tipo' => $porTipo,
        ]);
    }
}
