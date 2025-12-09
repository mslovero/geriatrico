<?php

namespace App\Http\Controllers;

use App\Models\StockItem;
use App\Models\MovimientoStock;
use App\Models\Medicacion;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportesController extends Controller
{
    /**
     * Reporte de consumo del geriátrico
     */
    public function consumoGeriatrico(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $desde = $request->fecha_desde ?? now()->startOfMonth();
        $hasta = $request->fecha_hasta ?? now()->endOfMonth();

        $movimientos = MovimientoStock::with('stockItem', 'paciente')
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [$desde, $hasta])
            ->whereHas('stockItem', function ($query) {
                $query->where('propiedad', 'geriatrico');
            })
            ->get();

        $totalCosto = $movimientos->sum('precio_total');
        
        $porItem = $movimientos->groupBy('stock_item_id')->map(function ($group) {
            $item = $group->first()->stockItem;
            return [
                'stock_item_id' => $item->id,
                'nombre' => $item->nombre,
                'cantidad_total' => $group->sum('cantidad'),
                'costo_total' => $group->sum('precio_total'),
                'unidad_medida' => $item->unidad_medida,
            ];
        })->values();

        return response()->json([
            'periodo' => [
                'desde' => $desde,
                'hasta' => $hasta,
            ],
            'total_costo' => $totalCosto,
            'por_item' => $porItem,
            'total_movimientos' => $movimientos->count(),
        ]);
    }

    /**
     * Reporte de consumo por paciente
     */
    public function consumoPaciente($pacienteId, Request $request)
    {
        $request->validate([
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $paciente = Paciente::findOrFail($pacienteId);
        $desde = $request->fecha_desde ?? now()->startOfMonth();
        $hasta = $request->fecha_hasta ?? now()->endOfMonth();

        // Movimientos de medicamentos del paciente (origen_pago = paciente)
        $movimientos = MovimientoStock::with('stockItem')
            ->where('paciente_id', $pacienteId)
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [$desde, $hasta])
            ->get();

        $totalCosto = $movimientos->sum('precio_total');
        
        $porItem = $movimientos->groupBy('stock_item_id')->map(function ($group) {
            $item = $group->first()->stockItem;
            return [
                'stock_item_id' => $item->id,
                'nombre' => $item->nombre,
                'cantidad_total' => $group->sum('cantidad'),
                'costo_total' => $group->sum('precio_total'),
                'unidad_medida' => $item->unidad_medida,
            ];
        })->values();

        return response()->json([
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $paciente->nombre . ' ' . $paciente->apellido,
            ],
            'periodo' => [
                'desde' => $desde,
                'hasta' => $hasta,
            ],
            'total_costo' => $totalCosto,
            'por_item' => $porItem,
            'total_movimientos' => $movimientos->count(),
        ]);
    }

    /**
     * Costos mensuales agregados
     */
    public function costosMensuales(Request $request)
    {
        $request->validate([
            'anio' => 'nullable|integer|min:2020|max:2099',
        ]);

        $anio = $request->anio ?? now()->year;

        $costosPorMes = MovimientoStock::select(
                DB::raw('MONTH(created_at) as mes'),
                DB::raw('SUM(precio_total) as total_costo'),
                DB::raw('COUNT(*) as cantidad_movimientos')
            )
            ->where('tipo_movimiento', 'salida')
            ->whereYear('created_at', $anio)
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(function ($item) {
                return [
                    'mes' => $item->mes,
                    'nombre_mes' => date('F', mktime(0, 0, 0, $item->mes, 1)),
                    'total_costo' => $item->total_costo,
                    'cantidad_movimientos' => $item->cantidad_movimientos,
                ];
            });

        $totalAnual = $costosPorMes->sum('total_costo');

        return response()->json([
            'anio' => $anio,
            'total_anual' => $totalAnual,
            'por_mes' => $costosPorMes,
        ]);
    }

    /**
     * Stock del geriátrico
     */
    public function stockGeriatrico()
    {
        $items = StockItem::with('proveedor', 'lotes')
            ->where('propiedad', 'geriatrico')
            ->where('activo', true)
            ->get();

        $valorTotal = $items->sum(function ($item) {
            return $item->stock_actual * ($item->precio_unitario ?? 0);
        });

        $bajoStock = $items->filter(function ($item) {
            return $item->isBajoStock();
        })->count();

        $proximosVencer = $items->filter(function ($item) {
            return $item->isProximoVencer();
        })->count();

        return response()->json([
            'items' => $items,
            'resumen' => [
                'total_items' => $items->count(),
                'valor_total' => $valorTotal,
                'bajo_stock' => $bajoStock,
                'proximos_vencer' => $proximosVencer,
            ],
        ]);
    }

    /**
     * Stock de un paciente específico
     */
    public function stockPaciente($pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);
        
        $items = StockItem::with('lotes')
            ->where('propiedad', 'paciente')
            ->where('paciente_propietario_id', $pacienteId)
            ->where('activo', true)
            ->get();

        $valorTotal = $items->sum(function ($item) {
            return $item->stock_actual * ($item->precio_unitario ?? 0);
        });

        return response()->json([
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $paciente->nombre . ' ' . $paciente->apellido,
            ],
            'items' => $items,
            'resumen' => [
                'total_items' => $items->count(),
                'valor_total' => $valorTotal,
            ],
        ]);
    }

    /**
     * Top medicamentos más consumidos
     */
    public function topMedicamentos(Request $request)
    {
        $request->validate([
            'limite' => 'nullable|integer|min:1|max:50',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $limite = $request->limite ?? 10;
        $desde = $request->fecha_desde ?? now()->startOfMonth();
        $hasta = $request->fecha_hasta ?? now()->endOfMonth();

        $top = MovimientoStock::select(
                'stock_item_id',
                DB::raw('SUM(cantidad) as cantidad_total'),
                DB::raw('SUM(precio_total) as costo_total'),
                DB::raw('COUNT(*) as veces_usado')
            )
            ->with('stockItem')
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [$desde, $hasta])
            ->groupBy('stock_item_id')
            ->orderByDesc('cantidad_total')
            ->limit($limite)
            ->get()
            ->map(function ($item) {
                return [
                    'stock_item_id' => $item->stock_item_id,
                    'nombre' => $item->stockItem->nombre ?? '-',
                    'tipo' => $item->stockItem->tipo ?? '-',
                    'cantidad_total' => $item->cantidad_total,
                    'costo_total' => $item->costo_total,
                    'veces_usado' => $item->veces_usado,
                    'unidad_medida' => $item->stockItem->unidad_medida ?? 'unidad',
                ];
            });

        return response()->json([
            'periodo' => [
                'desde' => $desde,
                'hasta' => $hasta,
            ],
            'top_medicamentos' => $top,
        ]);
    }

    /**
     * Resumen general de stock y costos
     */
    public function resumenGeneral()
    {
        // Stock del geriátrico
        $stockGeriatrico = StockItem::where('propiedad', 'geriatrico')
            ->where('activo', true)
            ->get();

        $valorStockGeriatrico = $stockGeriatrico->sum(function ($item) {
            return $item->stock_actual * ($item->precio_unitario ?? 0);
        });

        // Stock de pacientes
        $stockPacientes = StockItem::where('propiedad', 'paciente')
            ->where('activo', true)
            ->get();

        $valorStockPacientes = $stockPacientes->sum(function ($item) {
            return $item->stock_actual * ($item->precio_unitario ?? 0);
        });

        // Alertas
        $bajoStockGeriatrico = $stockGeriatrico->filter(fn($i) => $i->isBajoStock())->count();
        $proximosVencerGeriatrico = $stockGeriatrico->filter(fn($i) => $i->isProximoVencer())->count();

        // Costos del mes actual
        $costosMesActual = MovimientoStock::where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('precio_total');

        return response()->json([
            'stock_geriatrico' => [
                'total_items' => $stockGeriatrico->count(),
                'valor_total' => $valorStockGeriatrico,
                'bajo_stock' => $bajoStockGeriatrico,
                'proximos_vencer' => $proximosVencerGeriatrico,
            ],
            'stock_pacientes' => [
                'total_items' => $stockPacientes->count(),
                'valor_total' => $valorStockPacientes,
                'pacientes_con_stock' => $stockPacientes->unique('paciente_propietario_id')->count(),
            ],
            'costos_mes_actual' => $costosMesActual,
            'periodo_actual' => [
                'desde' => now()->startOfMonth()->format('Y-m-d'),
                'hasta' => now()->endOfMonth()->format('Y-m-d'),
            ],
        ]);
    }
}
