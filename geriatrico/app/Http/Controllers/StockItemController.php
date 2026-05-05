<?php

namespace App\Http\Controllers;

use App\Models\StockItem;
use App\Models\MovimientoStock;
use App\Http\Requests\StoreStockItemRequest;
use App\Http\Requests\UpdateStockItemRequest;
use App\Http\Traits\LogsStockActions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class StockItemController extends Controller
{
    use LogsStockActions;
    public function index(Request $request)
    {
        Gate::authorize('viewAny', StockItem::class);
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

        // Paginación: por defecto 15 items por página
        // Permitir obtener todos si se pasa ?all=true (para selectores)
        if ($request->boolean('all')) {
            return $query->get();
        }

        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }

    public function store(StoreStockItemRequest $request)
    {
        Gate::authorize('create', StockItem::class);
        $validated = $request->validated();

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

    public function update(UpdateStockItemRequest $request, $id)
    {
        $stockItem = StockItem::findOrFail($id);
        Gate::authorize('update', $stockItem);
        
        $validated = $request->validated();

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
        Gate::authorize('delete', $stockItem);

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
