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
        $request->validate([
            'stock_item_id' => 'required|exists:stock_items,id',
            'numero_lote' => 'required|string',
            'fecha_vencimiento' => 'required|date',
            'cantidad_inicial' => 'required|numeric|min:0.01',
            'tipo_cantidad' => 'in:base,presentacion', // base = pastillas, presentacion = blisters
            'precio_compra' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $stockItem = StockItem::findOrFail($request->stock_item_id);
            
            // Convertir cantidad a unidad base si viene en presentación
            $cantidadInicialBase = $request->cantidad_inicial;
            $tipoCantidad = $request->tipo_cantidad ?? 'base';
            
            if ($tipoCantidad === 'presentacion' && $stockItem->tieneConversion()) {
                $cantidadInicialBase = $stockItem->convertirPresentacionABase($request->cantidad_inicial);
                
                // Opcional: agregar observación sobre la conversión
                $observacionConversion = "Registrado: {$request->cantidad_inicial} {$stockItem->unidad_presentacion} = {$cantidadInicialBase} {$stockItem->unidad_medida}";
            }
            
            $lote = LoteStock::create([
                ...$request->except(['tipo_cantidad']),
                'cantidad_inicial' => $cantidadInicialBase,
                'cantidad_actual' => $cantidadInicialBase,
                'fecha_ingreso' => now(),
                'estado' => 'activo',
                'observaciones' => $request->observaciones 
                    ? $request->observaciones . (isset($observacionConversion) ? "\n" . $observacionConversion : '')
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
                'precio_total' => $request->precio_compra ? ($request->precio_compra * $cantidadInicialBase) : null,
                'observaciones' => isset($observacionConversion) 
                    ? "Ingreso Lote: {$lote->numero_lote} - {$observacionConversion}"
                    : "Ingreso Lote: {$lote->numero_lote}"
            ]);

            return response()->json($lote, 201);
        });
    }

    public function show($id)
    {
        return LoteStock::with('stockItem')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $lote = LoteStock::findOrFail($id);
        $lote->update($request->all());
        
        // Si cambió la cantidad, recalcular stock total
        if ($request->has('cantidad_actual')) {
            $lote->stockItem->recalcularStock();
        }
        
        return response()->json($lote);
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
