<?php

namespace App\Http\Controllers;

use App\Models\LoteStock;
use App\Models\StockItem;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoteStockController extends Controller
{
    public function index(Request $request)
    {
        $query = LoteStock::with('stockItem');

        if ($request->has('stock_item_id')) {
            $query->where('stock_item_id', $request->stock_item_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        return $query->orderBy('fecha_vencimiento', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'stock_item_id' => 'required|exists:stock_items,id',
            'numero_lote' => 'required|string|max:100',
            'fecha_vencimiento' => 'required|date|after:today',
            'cantidad_inicial' => 'required|integer|min:1',
            'tipo_cantidad' => 'nullable|in:base,presentacion',
            'precio_compra' => 'nullable|numeric|min:0',
            'proveedor_factura' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $stockItem = StockItem::findOrFail($validated['stock_item_id']);

            // Convertir cantidad a unidad base si viene en presentación
            $cantidadInicialBase = $validated['cantidad_inicial'];
            $tipoCantidad = $validated['tipo_cantidad'] ?? 'base';

            if ($tipoCantidad === 'presentacion' && $stockItem->tieneConversion()) {
                $cantidadInicialBase = $stockItem->convertirPresentacionABase($validated['cantidad_inicial']);

                // Agregar observación sobre la conversión
                $observacionConversion = "Registrado: {$validated['cantidad_inicial']} {$stockItem->unidad_presentacion} = {$cantidadInicialBase} {$stockItem->unidad_medida}";
            }

            $lote = LoteStock::create([
                'stock_item_id' => $validated['stock_item_id'],
                'numero_lote' => $validated['numero_lote'],
                'fecha_vencimiento' => $validated['fecha_vencimiento'],
                'precio_compra' => $validated['precio_compra'] ?? null,
                'proveedor_factura' => $validated['proveedor_factura'] ?? null,
                'cantidad_inicial' => $cantidadInicialBase,
                'cantidad_actual' => $cantidadInicialBase,
                'fecha_ingreso' => now(),
                'estado' => 'activo',
                'observaciones' => isset($validated['observaciones']) && $validated['observaciones']
                    ? $validated['observaciones'] . (isset($observacionConversion) ? "\n" . $observacionConversion : '')
                    : ($observacionConversion ?? null)
            ]);

            // Actualizar stock total del item
            $stockAnterior = $stockItem->stock_actual;
            $stockItem->recalcularStock();

            // Registrar movimiento de entrada
            MovimientoStock::create([
                'stock_item_id' => $stockItem->id,
                'lote_stock_id' => $lote->id,
                'tipo_movimiento' => 'entrada',
                'cantidad' => $cantidadInicialBase,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockItem->stock_actual,
                'motivo' => 'compra_lote',
                'user_id' => auth()->id(),
                'precio_total' => isset($validated['precio_compra']) ? ($validated['precio_compra'] * $cantidadInicialBase) : null,
                'observaciones' => isset($observacionConversion)
                    ? "Ingreso Lote: {$lote->numero_lote} - {$observacionConversion}"
                    : "Ingreso Lote: {$lote->numero_lote}"
            ]);

            return response()->json($lote->load('stockItem'), 201);
        });
    }

    public function show($id)
    {
        return LoteStock::with('stockItem')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'numero_lote' => 'sometimes|required|string|max:100',
            'fecha_vencimiento' => 'sometimes|required|date',
            'cantidad_actual' => 'sometimes|required|integer|min:0',
            'precio_compra' => 'nullable|numeric|min:0',
            'proveedor_factura' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
            'estado' => 'sometimes|required|in:activo,vencido,agotado',
        ]);

        $lote = LoteStock::findOrFail($id);

        // Validar que cantidad_actual no sea mayor a cantidad_inicial
        $cantidadActual = $validated['cantidad_actual'] ?? $lote->cantidad_actual;
        if ($cantidadActual > $lote->cantidad_inicial) {
            return response()->json([
                'error' => 'La cantidad actual no puede ser mayor a la cantidad inicial del lote'
            ], 400);
        }

        return DB::transaction(function () use ($lote, $validated) {
            $lote->update($validated);

            // Si cambió la cantidad, recalcular stock total y actualizar estado
            if (isset($validated['cantidad_actual'])) {
                $lote->actualizarEstado();
                $lote->stockItem->recalcularStock();
            }

            return response()->json($lote->load('stockItem'));
        });
    }

    public function destroy($id)
    {
        $lote = LoteStock::findOrFail($id);
        $stockItem = $lote->stockItem;
        
        $lote->delete();
        $stockItem->recalcularStock();
        
        return response()->noContent();
    }
}
