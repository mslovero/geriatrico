<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdministrarMedicacionRequest;
use App\Http\Requests\PeriodoReporteRequest;
use App\Http\Resources\MovimientoStockResource;
use App\Models\MovimientoStock;
use App\Services\RegistroMedicacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovimientoStockController extends Controller
{
    public function __construct(private readonly RegistroMedicacionService $registros)
    {
    }

    public function index(Request $request)
    {
        return MovimientoStockResource::collection(
            MovimientoStock::with(['stockItem', 'loteStock', 'paciente', 'user'])
                ->when($request->filled('stock_item_id'), fn ($q) => $q->where('stock_item_id', $request->stock_item_id))
                ->when($request->filled('paciente_id'), fn ($q) => $q->where('paciente_id', $request->paciente_id))
                ->when($request->filled('tipo_movimiento'), fn ($q) => $q->where('tipo_movimiento', $request->tipo_movimiento))
                ->when($request->filled('fecha_desde'), fn ($q) => $q->whereDate('created_at', '>=', $request->fecha_desde))
                ->when($request->filled('fecha_hasta'), fn ($q) => $q->whereDate('created_at', '<=', $request->fecha_hasta))
                ->orderByDesc('created_at')
                ->paginate(15)
        );
    }

    public function show($id)
    {
        return new MovimientoStockResource(
            MovimientoStock::with(['stockItem', 'loteStock', 'paciente', 'user'])->findOrFail($id)
        );
    }

    public function porPaciente($pacienteId)
    {
        return MovimientoStockResource::collection(
            MovimientoStock::with(['stockItem', 'user'])
                ->where('paciente_id', $pacienteId)
                ->orderByDesc('created_at')
                ->paginate(15)
        );
    }

    public function reporteConsumo(PeriodoReporteRequest $request)
    {
        $desde = $request->input('fecha_desde');
        $hasta = $request->input('fecha_hasta');

        abort_if(! $desde || ! $hasta, 422, 'fecha_desde y fecha_hasta son obligatorias');

        return MovimientoStock::where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [$desde, $hasta])
            ->select(
                'stock_item_id',
                DB::raw('SUM(cantidad) as total_consumido'),
                DB::raw('SUM(precio_total) as costo_total'),
            )
            ->groupBy('stock_item_id')
            ->get();
    }

    public function administrarMedicacion(AdministrarMedicacionRequest $request)
    {
        $validated = $request->validated();
        $cantidad = (int) ($validated['cantidad'] ?? 1);

        $registro = $this->registros->registrarAdministracion([
            'medicacion_id' => $validated['medicacion_id'],
            'user_id' => auth()->id(),
            'fecha_hora' => now(),
            'estado' => 'administrado',
            'cantidad_administrada' => $cantidad,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        $stockItem = $registro->medicacion?->stockItem;

        return response()->json([
            'message' => $stockItem
                ? 'Administración registrada y stock descontado'
                : 'Administración registrada (Obra Social - Sin descuento de stock)',
            'stock_restante' => $stockItem?->stock_actual,
            'registro_id' => $registro->id,
            'lote_usado' => $registro->loteStock?->numero_lote,
        ]);
    }
}
