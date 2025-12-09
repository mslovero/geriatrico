<?php

namespace App\Http\Controllers;

use App\Models\StockItem;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockItemController extends Controller
{
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
        $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|in:medicamento,insumo',
            'unidad_medida' => 'required|string',
            'stock_actual' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
        ]);

        $stockItem = StockItem::create($request->all());
        
        // Registrar movimiento inicial si hay stock
        if ($stockItem->stock_actual > 0) {
            MovimientoStock::create([
                'stock_item_id' => $stockItem->id,
                'tipo_movimiento' => 'entrada',
                'cantidad' => $stockItem->stock_actual,
                'stock_anterior' => 0,
                'stock_nuevo' => $stockItem->stock_actual,
                'motivo' => 'stock_inicial',
                'user_id' => auth()->id(),
            ]);
        }

        return response()->json($stockItem->load('proveedor'), 201);
    }

    public function show($id)
    {
        return StockItem::with(['proveedor', 'movimientos.paciente', 'movimientos.user'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $stockItem = StockItem::findOrFail($id);
        $stockItem->update($request->all());
        return response()->json($stockItem->load('proveedor'));
    }

    public function destroy($id)
    {
        StockItem::findOrFail($id)->delete();
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
        return StockItem::whereNotNull('fecha_vencimiento')
            ->whereDate('fecha_vencimiento', '<=', now()->addDays(30))
            ->with('proveedor')
            ->get();
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
