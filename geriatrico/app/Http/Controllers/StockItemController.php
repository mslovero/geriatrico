<?php

namespace App\Http\Controllers;

use App\Models\StockItem;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Traits\LogsStockActions;

class StockItemController extends Controller
{
    use LogsStockActions;
    public function index(Request $request)
    {
        $query = StockItem::with('proveedor', 'pacientePropietario');

        // Filtrar por propiedad (geriatrico o paciente)
        if ($request->has('propiedad')) {
            $query->where('propiedad', $request->propiedad);
        }

        // Filtrar por paciente propietario
        if ($request->has('paciente_id')) {
            $query->where('paciente_propietario_id', $request->paciente_id);
        }

        // Filtrar solo activos
        if ($request->has('activo')) {
            $query->where('activo', $request->activo);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|in:medicamento,insumo',
            'unidad_medida' => 'required|string',
            'stock_actual' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'stock_maximo' => 'nullable|integer|min:0',
            'fecha_vencimiento_inicial' => 'nullable|date|after:today',
            'unidad_presentacion' => 'nullable|string|max:50',
            'factor_conversion' => 'nullable|integer|min:2',
            'descripcion_presentacion' => 'nullable|string|max:255',
            'propiedad' => 'required|in:geriatrico,paciente',
            'paciente_propietario_id' => 'nullable|exists:pacientes,id',
            'precio_unitario' => 'nullable|numeric|min:0',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'codigo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'punto_reorden' => 'nullable|integer|min:0',
            'ubicacion_almacen' => 'nullable|string|max:100',
            'codigo_barras' => 'nullable|string|max:100',
            'requiere_receta' => 'nullable|boolean',
            'temperatura_almacenamiento' => 'nullable|string|max:100',
        ]);

        // Validar que si tiene unidad_presentacion, debe tener factor_conversion
        if (!empty($validated['unidad_presentacion']) && empty($validated['factor_conversion'])) {
            return response()->json([
                'error' => 'Si especifica unidad de presentación, debe proporcionar un factor de conversión mayor o igual a 2'
            ], 400);
        }

        // Validar consistencia de propiedad y paciente propietario
        if ($validated['propiedad'] === 'paciente' && empty($validated['paciente_propietario_id'])) {
            return response()->json([
                'error' => 'Los items con propiedad "paciente" deben tener un paciente propietario asignado'
            ], 400);
        }

        if ($validated['propiedad'] === 'geriatrico' && !empty($validated['paciente_propietario_id'])) {
            return response()->json([
                'error' => 'Los items con propiedad "geriátrico" no deben tener paciente propietario'
            ], 400);
        }

        // Validar que stock_maximo sea mayor que stock_minimo
        if (isset($validated['stock_maximo']) && $validated['stock_maximo'] < $validated['stock_minimo']) {
            return response()->json([
                'error' => 'El stock máximo debe ser mayor o igual al stock mínimo'
            ], 400);
        }

        return DB::transaction(function () use ($validated) {
            $stockItem = StockItem::create(collect($validated)->except(['fecha_vencimiento_inicial'])->toArray());

            // Sistema profesional: crear lote automático si hay stock inicial
            if ($stockItem->stock_actual > 0) {
                $numeroLote = 'INICIAL-' . date('YmdHis') . '-' . $stockItem->id;

                $lote = \App\Models\LoteStock::create([
                    'stock_item_id' => $stockItem->id,
                    'numero_lote' => $numeroLote,
                    'fecha_vencimiento' => $validated['fecha_vencimiento_inicial'] ?? now()->addYears(2),
                    'cantidad_inicial' => $stockItem->stock_actual,
                    'cantidad_actual' => $stockItem->stock_actual,
                    'fecha_ingreso' => now(),
                    'estado' => 'activo',
                    'precio_compra' => $stockItem->precio_unitario,
                    'observaciones' => 'Lote creado automáticamente con stock inicial del item',
                ]);

                // Registrar movimiento asociado al lote
                MovimientoStock::create([
                    'stock_item_id' => $stockItem->id,
                    'lote_stock_id' => $lote->id,
                    'tipo_movimiento' => 'entrada',
                    'cantidad' => $stockItem->stock_actual,
                    'stock_anterior' => 0,
                    'stock_nuevo' => $stockItem->stock_actual,
                    'motivo' => 'stock_inicial_con_lote',
                    'user_id' => auth()->id(),
                    'observaciones' => "Lote inicial: {$numeroLote}",
                ]);
            }

            // Logging de auditoría
            $this->logStockItemCreated($stockItem);

            return response()->json($stockItem->load('proveedor'), 201);
        });
    }

    public function show($id)
    {
        return StockItem::with(['proveedor', 'movimientos.paciente', 'movimientos.user'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'tipo' => 'sometimes|required|in:medicamento,insumo',
            'codigo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'unidad_medida' => 'sometimes|required|string|max:50',
            'unidad_presentacion' => 'nullable|string|max:50',
            'factor_conversion' => 'nullable|integer|min:2',
            'descripcion_presentacion' => 'nullable|string|max:255',
            'stock_minimo' => 'sometimes|required|integer|min:0',
            'stock_maximo' => 'nullable|integer|min:0',
            'precio_unitario' => 'nullable|numeric|min:0',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'observaciones' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'punto_reorden' => 'nullable|integer|min:0',
            'ubicacion_almacen' => 'nullable|string|max:100',
            'codigo_barras' => 'nullable|string|max:100',
            'requiere_receta' => 'nullable|boolean',
            'temperatura_almacenamiento' => 'nullable|string|max:100',
            'propiedad' => 'sometimes|required|in:geriatrico,paciente',
            'paciente_propietario_id' => 'nullable|exists:pacientes,id',
            'activo' => 'nullable|boolean',
        ]);

        $stockItem = StockItem::findOrFail($id);

        // Validar que si tiene unidad_presentacion, debe tener factor_conversion
        if (isset($validated['unidad_presentacion']) && !empty($validated['unidad_presentacion'])) {
            $factorConversion = $validated['factor_conversion'] ?? $stockItem->factor_conversion;

            if (!$factorConversion || $factorConversion < 2) {
                return response()->json([
                    'error' => 'Si especifica unidad de presentación, debe proporcionar un factor de conversión mayor o igual a 2'
                ], 400);
            }
        }

        // Validar consistencia de propiedad y paciente propietario
        $propiedad = $validated['propiedad'] ?? $stockItem->propiedad;
        $pacientePropietarioId = $validated['paciente_propietario_id'] ?? $stockItem->paciente_propietario_id;

        if ($propiedad === 'paciente' && !$pacientePropietarioId) {
            return response()->json([
                'error' => 'Los items con propiedad "paciente" deben tener un paciente propietario asignado'
            ], 400);
        }

        if ($propiedad === 'geriatrico' && $pacientePropietarioId) {
            return response()->json([
                'error' => 'Los items con propiedad "geriátrico" no deben tener paciente propietario'
            ], 400);
        }

        // Validar que stock_maximo sea mayor que stock_minimo si ambos están presentes
        $stockMinimo = $validated['stock_minimo'] ?? $stockItem->stock_minimo;
        $stockMaximo = $validated['stock_maximo'] ?? $stockItem->stock_maximo;

        if ($stockMaximo && $stockMinimo && $stockMaximo < $stockMinimo) {
            return response()->json([
                'error' => 'El stock máximo debe ser mayor o igual al stock mínimo'
            ], 400);
        }

        // Detectar cambio de propiedad (crítico)
        if (isset($validated['propiedad']) && $validated['propiedad'] !== $stockItem->propiedad) {
            $this->logPropiedadChanged($stockItem, $stockItem->propiedad, $validated['propiedad']);
        }

        // Guardar cambios
        $changes = array_diff_assoc($validated, $stockItem->toArray());
        $stockItem->update($validated);

        // Logging de auditoría
        if (!empty($changes)) {
            $this->logStockItemUpdated($stockItem, $changes);
        }

        return response()->json($stockItem->load('proveedor', 'pacientePropietario'));
    }

    public function destroy($id)
    {
        $stockItem = StockItem::findOrFail($id);

        // Logging de auditoría antes de eliminar
        $this->logStockItemDeleted($stockItem);

        $stockItem->delete();
        return response()->noContent();
    }

    // Obtener items con stock bajo
    public function bajoStock()
    {
        return StockItem::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->with('proveedor')
            ->get();
    }

    // Obtener items próximos a vencer
    public function proximosVencer()
    {
        // Sistema profesional: buscar en lotes, no en stock_items
        $items = StockItem::with(['proveedor', 'lotes' => function($query) {
            $query->where('estado', 'activo')
                  ->whereDate('fecha_vencimiento', '<=', now()->addDays(30))
                  ->orderBy('fecha_vencimiento', 'asc');
        }])->get();

        // Filtrar solo los que tienen lotes próximos a vencer
        return $items->filter(function($item) {
            return $item->lotes->isNotEmpty();
        })->values();
    }

    // Registrar entrada de stock
    public function registrarEntrada(Request $request, $id)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'required|string',
            'precio_total' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $stockItem = StockItem::findOrFail($id);
            $stockAnterior = $stockItem->stock_actual;
            $stockNuevo = $stockAnterior + $request->cantidad;

            $stockItem->update(['stock_actual' => $stockNuevo]);

            $movimiento = MovimientoStock::create([
                'stock_item_id' => $id,
                'tipo_movimiento' => 'entrada',
                'cantidad' => $request->cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'motivo' => $request->motivo,
                'precio_total' => $request->precio_total,
                'user_id' => auth()->id(),
                'observaciones' => $request->observaciones,
            ]);

            return response()->json([
                'stockItem' => $stockItem,
                'movimiento' => $movimiento->load('user')
            ]);
        });
    }

    // Registrar salida de stock
    public function registrarSalida(Request $request, $id)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'required|string',
            'paciente_id' => 'nullable|exists:pacientes,id',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $stockItem = StockItem::findOrFail($id);
            
            if ($stockItem->stock_actual < $request->cantidad) {
                return response()->json([
                    'error' => 'Stock insuficiente',
                    'stock_actual' => $stockItem->stock_actual,
                    'cantidad_solicitada' => $request->cantidad
                ], 400);
            }

            $stockAnterior = $stockItem->stock_actual;
            $stockNuevo = $stockAnterior - $request->cantidad;

            $stockItem->update(['stock_actual' => $stockNuevo]);

            $movimiento = MovimientoStock::create([
                'stock_item_id' => $id,
                'tipo_movimiento' => 'salida',
                'cantidad' => $request->cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'motivo' => $request->motivo,
                'paciente_id' => $request->paciente_id,
                'user_id' => auth()->id(),
                'observaciones' => $request->observaciones,
            ]);

            return response()->json([
                'stockItem' => $stockItem,
                'movimiento' => $movimiento->load(['user', 'paciente'])
            ]);
        });
    }
}
