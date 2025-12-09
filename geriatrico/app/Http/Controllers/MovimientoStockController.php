<?php

namespace App\Http\Controllers;

use App\Models\MovimientoStock;
use Illuminate\Http\Request;

class MovimientoStockController extends Controller
{
    public function index(Request $request)
    {
        $query = MovimientoStock::with(['stockItem', 'loteStock', 'paciente', 'user']);

        // Filtros opcionales
        if ($request->has('stock_item_id')) {
            $query->where('stock_item_id', $request->stock_item_id);
        }

        if ($request->has('paciente_id')) {
            $query->where('paciente_id', $request->paciente_id);
        }

        if ($request->has('tipo_movimiento')) {
            $query->where('tipo_movimiento', $request->tipo_movimiento);
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function show($id)
    {
        return MovimientoStock::with(['stockItem', 'loteStock', 'paciente', 'user'])->findOrFail($id);
    }

    // Reporte de movimientos por paciente
    public function porPaciente($pacienteId)
    {
        return MovimientoStock::with(['stockItem', 'user'])
            ->where('paciente_id', $pacienteId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Reporte de consumo por período
    public function reporteConsumo(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
        ]);

        return MovimientoStock::with(['stockItem', 'paciente'])
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [$request->fecha_desde, $request->fecha_hasta])
            ->selectRaw('stock_item_id, SUM(cantidad) as total_consumido, SUM(precio_total) as costo_total')
            ->groupBy('stock_item_id')
            ->get();
    }

    /**
     * Registra la administración de una medicación y descuenta stock automáticamente
     * NOTA: Se recomienda usar RegistroMedicacionController::store() en su lugar
     */
    public function administrarMedicacion(Request $request)
    {
        $request->validate([
            'medicacion_id' => 'required|exists:medicacions,id',
            'cantidad' => 'nullable|integer|min:1',
            'observaciones' => 'nullable|string'
        ]);

        $medicacion = \App\Models\Medicacion::findOrFail($request->medicacion_id);
        
        // Si es obra social, solo registramos el evento (si tuviéramos tabla de eventos)
        // pero no descontamos stock. Por ahora retornamos éxito.
        if ($medicacion->origen_pago === 'obra_social') {
            return response()->json([
                'message' => 'Administración registrada (Obra Social - Sin descuento de stock)',
                'stock_restante' => null
            ]);
        }

        // Verificar vinculación
        if (!$medicacion->stock_item_id) {
            return response()->json([
                'error' => 'La medicación no está vinculada a ningún item de stock'
            ], 400);
        }

        $stockItem = \App\Models\StockItem::find($medicacion->stock_item_id);
        
        if (!$stockItem) {
            return response()->json([
                'error' => 'El item de stock vinculado no existe'
            ], 400);
        }

        // Validar consistencia de propiedad
        if ($medicacion->origen_pago === 'paciente') {
            if ($stockItem->propiedad !== 'paciente' || $stockItem->paciente_propietario_id != $medicacion->paciente_id) {
                return response()->json([
                    'error' => 'El medicamento pertenece a un paciente diferente.'
                ], 400);
            }
        }

        if ($medicacion->origen_pago === 'geriatrico') {
            if ($stockItem->propiedad !== 'geriatrico') {
                return response()->json([
                    'error' => 'El medicamento debe ser del stock del geriátrico.'
                ], 400);
            }
        }

        // Cantidad a descontar
        $cantidad = $request->cantidad ?? 1;

        // ✅ FLUJO CORRECTO: Buscar lote más próximo a vencer (FIFO)
        $lote = \App\Models\LoteStock::where('stock_item_id', $stockItem->id)
            ->where('estado', 'activo')
            ->where('cantidad_actual', '>=', $cantidad)
            ->whereDate('fecha_vencimiento', '>=', now())
            ->orderBy('fecha_vencimiento', 'asc')
            ->first();

        if (!$lote) {
            return response()->json([
                'error' => 'No hay lotes disponibles, stock insuficiente, o todos están vencidos.'
            ], 400);
        }

        // Descontar del lote
        try {
            $lote->descontar($cantidad);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }

        // Recalcular stock total
        $stockItem->recalcularStock();

        $precioTotal = ($lote->precio_compra ?? 0) * $cantidad;

        // Crear movimiento con referencia al lote
        $movimiento = MovimientoStock::create([
            'stock_item_id' => $stockItem->id,
            'lote_stock_id' => $lote->id,
            'tipo_movimiento' => 'salida',
            'cantidad' => $cantidad,
            'stock_anterior' => $stockItem->stock_actual + $cantidad,
            'stock_nuevo' => $stockItem->stock_actual,
            'motivo' => 'Administración a paciente',
            'paciente_id' => $medicacion->paciente_id,
            'user_id' => auth()->id(),
            'precio_total' => $precioTotal,
            'observaciones' => $request->observaciones ?? "Administración de {$medicacion->nombre} desde lote {$lote->numero_lote}"
        ]);

        return response()->json([
            'message' => 'Administración registrada y stock descontado',
            'stock_restante' => $stockItem->stock_actual,
            'movimiento_id' => $movimiento->id,
            'lote_usado' => $lote->numero_lote
        ]);
    }
}
