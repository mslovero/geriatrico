<?php

namespace App\Http\Controllers;

use App\Models\RegistroMedicacion;
use App\Http\Requests\StoreRegistroMedicacionRequest;
use App\Http\Requests\UpdateRegistroMedicacionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class RegistroMedicacionController extends Controller
{
    public function index()
    {
        Gate::authorize('viewAny', RegistroMedicacion::class);
        return RegistroMedicacion::with(['medicacion.paciente', 'user'])
            ->orderBy('fecha_hora', 'desc')
            ->paginate(15);
    }

    public function store(StoreRegistroMedicacionRequest $request)
    {
        Gate::authorize('create', RegistroMedicacion::class);
        $validated = $request->validated();

        if (empty($validated['user_id'])) {
            $validated['user_id'] = auth()->id();
        }

        try {
            return DB::transaction(function () use ($validated) {
                $medicacion = \App\Models\Medicacion::findOrFail($validated['medicacion_id']);
                
                // Validación estricta de Stock para estado 'administrado'
                if ($validated['estado'] === 'administrado' && $medicacion->origen_pago !== 'obra_social') {
                    
                    if (!$medicacion->stock_item_id) {
                        return response()->json([
                            'error' => 'No se puede administrar: El medicamento no está vinculado a ningún item de stock.'
                        ], 400);
                    }

                    $stockItem = \App\Models\StockItem::find($medicacion->stock_item_id);

                    if (!$stockItem) {
                        return response()->json([
                            'error' => 'No se puede administrar: El item de stock vinculado no existe.'
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

                    // ✅ FLUJO CORRECTO: Buscar lote más próximo a vencer (FIFO)
                    $cantidad = 1;
                    $lote = \App\Models\LoteStock::where('stock_item_id', $stockItem->id)
                        ->where('estado', 'activo')
                        ->where('cantidad_actual', '>=', $cantidad)
                        ->whereDate('fecha_vencimiento', '>=', now())
                        ->orderBy('fecha_vencimiento', 'asc') // FIFO: primero en vencer
                        ->first();

                    if (!$lote) {
                        return response()->json([
                            'error' => 'No hay lotes disponibles, stock insuficiente, o todos están vencidos.'
                        ], 400);
                    }

                    // Descontar del lote usando el método del modelo
                    try {
                        $lote->descontar($cantidad);
                    } catch (\Exception $e) {
                        return response()->json([
                            'error' => $e->getMessage()
                        ], 400);
                    }

                    // Recalcular stock total del item
                    $stockItem->recalcularStock();

                    // Guardar información del lote en el registro
                    $validated['lote_stock_id'] = $lote->id;
                    $validated['cantidad_administrada'] = $cantidad;
                    $validated['costo_unitario'] = $lote->precio_compra;

                    // Registrar movimiento con referencia al lote
                    \App\Models\MovimientoStock::create([
                        'stock_item_id' => $stockItem->id,
                        'lote_stock_id' => $lote->id,
                        'tipo_movimiento' => 'salida',
                        'cantidad' => $cantidad,
                        'stock_anterior' => $stockItem->stock_actual + $cantidad,
                        'stock_nuevo' => $stockItem->stock_actual,
                        'motivo' => 'administracion_paciente',
                        'paciente_id' => $medicacion->paciente_id,
                        'user_id' => $validated['user_id'],
                        'observaciones' => "Administración desde lote {$lote->numero_lote}",
                        'precio_total' => ($lote->precio_compra ?? 0) * $cantidad
                    ]);
                }

                $registro = RegistroMedicacion::create($validated);

                $stockRestante = isset($stockItem) ? $stockItem->stock_actual : null;

                return response()->json([
                    'message' => 'Administración registrada correctamente',
                    'data' => $registro,
                    'stock_restante' => $stockRestante
                ], 201);
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error en RegistroMedicacionController@store: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error interno del servidor',
                'details' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function update(UpdateRegistroMedicacionRequest $request, $id)
    {
        $registro = RegistroMedicacion::findOrFail($id);
        Gate::authorize('update', $registro);

        $validated = $request->validated();

        // Si cambia a administrado desde otro estado, validar y descontar stock
        if (isset($validated['estado']) && $validated['estado'] === 'administrado' && $registro->estado !== 'administrado') {
            $medicacion = $registro->medicacion;
            
            if ($medicacion->origen_pago !== 'obra_social') {
                if (!$medicacion->stock_item_id) {
                    return response()->json(['error' => 'Medicamento sin stock vinculado'], 400);
                }

                $stockItem = \App\Models\StockItem::find($medicacion->stock_item_id);
                
                if (!$stockItem) {
                    return response()->json(['error' => 'Stock item no encontrado'], 400);
                }

                // Validar consistencia de propiedad
                if ($medicacion->origen_pago === 'paciente') {
                    if ($stockItem->propiedad !== 'paciente' || $stockItem->paciente_propietario_id != $medicacion->paciente_id) {
                        return response()->json(['error' => 'El medicamento pertenece a un paciente diferente'], 400);
                    }
                }

                if ($medicacion->origen_pago === 'geriatrico') {
                    if ($stockItem->propiedad !== 'geriatrico') {
                        return response()->json(['error' => 'El medicamento debe ser del stock del geriátrico'], 400);
                    }
                }

                // ✅ FLUJO CORRECTO: Buscar lote más próximo a vencer (FIFO)
                $cantidad = 1;
                $lote = \App\Models\LoteStock::where('stock_item_id', $stockItem->id)
                    ->where('estado', 'activo')
                    ->where('cantidad_actual', '>=', $cantidad)
                    ->whereDate('fecha_vencimiento', '>=', now())
                    ->orderBy('fecha_vencimiento', 'asc')
                    ->first();

                if (!$lote) {
                    return response()->json(['error' => 'No hay lotes disponibles o todos están vencidos'], 400);
                }

                // Descontar del lote
                try {
                    $lote->descontar($cantidad);
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()], 400);
                }

                // Recalcular stock total
                $stockItem->recalcularStock();

                // Actualizar el registro con info del lote
                $validated['lote_stock_id'] = $lote->id;
                $validated['cantidad_administrada'] = $cantidad;
                $validated['costo_unitario'] = $lote->precio_compra;
                
                // Registrar movimiento con lote
                \App\Models\MovimientoStock::create([
                    'stock_item_id' => $stockItem->id,
                    'lote_stock_id' => $lote->id,
                    'tipo_movimiento' => 'salida',
                    'cantidad' => $cantidad,
                    'stock_anterior' => $stockItem->stock_actual + $cantidad,
                    'stock_nuevo' => $stockItem->stock_actual,
                    'motivo' => 'administracion_paciente_update',
                    'paciente_id' => $medicacion->paciente_id,
                    'user_id' => auth()->id(),
                    'observaciones' => "Actualización a administrado desde lote {$lote->numero_lote}",
                    'precio_total' => ($lote->precio_compra ?? 0) * $cantidad
                ]);
            }
        }

        $registro->update($validated);

        return response()->json([
            'message' => 'Registro actualizado correctamente',
            'data' => $registro
        ]);
    }

    public function destroy($id)
    {
        $registro = RegistroMedicacion::findOrFail($id);
        Gate::authorize('delete', $registro);
        
        $registro->delete();
        return response()->noContent();
    }
}
