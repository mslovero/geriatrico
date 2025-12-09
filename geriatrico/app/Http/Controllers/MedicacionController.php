<?php

namespace App\Http\Controllers;

use App\Models\Medicacion;
use Illuminate\Http\Request;

class MedicacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Medicacion::with(['paciente', 'stockItem'])->get();
    }

    /**
     * Dashboard de estado de medicaciones - PREMIUM
     */
    public function estadoMedicaciones()
    {
        $medicaciones = Medicacion::with(['paciente', 'stockItem.pacientePropietario'])->get();
        
        $sinStock = [];
        $stockBajo = [];
        $sinVincular = [];
        $inconsistentes = [];
        $correctas = [];
        
        foreach ($medicaciones as $med) {
            $estado = [
                'id' => $med->id,
                'nombre' => $med->nombre,
                'paciente' => $med->paciente ? $med->paciente->nombre . ' ' . $med->paciente->apellido : 'Sin asignar',
                'origen_pago' => $med->origen_pago,
                'stock_item_id' => $med->stock_item_id,
            ];
            
            // Medicamentos de obra social no necesitan stock
            if ($med->origen_pago === 'obra_social') {
                $estado['estado'] = 'correcto';
                $estado['mensaje'] = 'Obra social - No requiere stock';
                $correctas[] = $estado;
                continue;
            }
            
            // Sin vincular a stock
            if (!$med->stock_item_id) {
                $estado['estado'] = 'sin_vincular';
                $estado['mensaje'] = 'No vinculado a stock';
                $estado['sugerencia'] = 'Crear item de stock o vincular con existente';
                $sinVincular[] = $estado;
                continue;
            }
            
            $stockItem = $med->stockItem;
            
            // Stock item no existe
            if (!$stockItem) {
                $estado['estado'] = 'error';
                $estado['mensaje'] = 'Stock item no encontrado';
                $estado['sugerencia'] = 'Eliminar vinculación o crear stock item';
                $inconsistentes[] = $estado;
                continue;
            }
            
            $estado['stock_nombre'] = $stockItem->nombre;
            $estado['stock_actual'] = $stockItem->stock_actual;
            $estado['stock_propiedad'] = $stockItem->propiedad;
            
            // Verificar consistencia de propiedad
            $esConsistente = true;
            if ($med->origen_pago === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
                $esConsistente = false;
                $estado['error_consistencia'] = 'Origen geriátrico pero stock no es del geriátrico';
            }
            
            if ($med->origen_pago === 'paciente') {
                if ($stockItem->propiedad !== 'paciente') {
                    $esConsistente = false;
                    $estado['error_consistencia'] = 'Origen paciente pero stock no es de paciente';
                } elseif ($stockItem->paciente_propietario_id != $med->paciente_id) {
                    $esConsistente = false;
                    $estado['error_consistencia'] = 'Stock pertenece a otro paciente';
                }
            }
            
            if (!$esConsistente) {
                $estado['estado'] = 'inconsistente';
                $estado['sugerencia'] = 'Corregir origen de pago o cambiar propiedad del stock';
                $inconsistentes[] = $estado;
                continue;
            }
            
            // Stock en cero
            if ($stockItem->stock_actual <= 0) {
                $estado['estado'] = 'sin_stock';
                $estado['mensaje'] = 'Stock agotado';
                $estado['sugerencia'] = 'Registrar entrada de stock';
                $sinStock[] = $estado;
                continue;
            }
            
            // Stock bajo
            if ($stockItem->isBajoStock()) {
                $estado['estado'] = 'stock_bajo';
                $estado['mensaje'] = 'Stock bajo mínimo';
                $estado['stock_minimo'] = $stockItem->stock_minimo;
                $estado['sugerencia'] = 'Considerar reposición';
                $stockBajo[] = $estado;
                continue;
            }
            
            // Todo correcto
            $estado['estado'] = 'correcto';
            $estado['mensaje'] = 'Medicación correctamente vinculada y con stock';
            $correctas[] = $estado;
        }
        
        return response()->json([
            'resumen' => [
                'total' => $medicaciones->count(),
                'correctas' => count($correctas),
                'sin_vincular' => count($sinVincular),
                'sin_stock' => count($sinStock),
                'stock_bajo' => count($stockBajo),
                'inconsistentes' => count($inconsistentes),
            ],
            'alertas' => [
                'criticas' => count($sinStock) + count($inconsistentes),
                'advertencias' => count($sinVincular) + count($stockBajo),
            ],
            'detalles' => [
                'sin_stock' => $sinStock,
                'stock_bajo' => $stockBajo,
                'sin_vincular' => $sinVincular,
                'inconsistentes' => $inconsistentes,
            ],
            'correctas' => $correctas,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'paciente_id' => 'required|exists:pacientes,id',
            'tipo' => 'in:diaria,sos',
            'cantidad_mensual' => 'nullable|integer',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'origen_pago' => 'required|in:obra_social,geriatrico,paciente',
            'stock_item_id' => 'nullable|exists:stock_items,id',
        ]);

        // Si el origen es geriátrico, validar que haya stock disponible
        if ($request->origen_pago === 'geriatrico' && $request->stock_item_id) {
            $stockItem = \App\Models\StockItem::find($request->stock_item_id);
            
            if ($stockItem && $stockItem->propiedad !== 'geriatrico') {
                return response()->json([
                    'error' => 'El item de stock seleccionado no pertenece al geriátrico'
                ], 400);
            }
        }

        // Si el origen es paciente, validar que el stock sea del paciente
        if ($request->origen_pago === 'paciente' && $request->stock_item_id) {
            $stockItem = \App\Models\StockItem::find($request->stock_item_id);
            
            if ($stockItem && $stockItem->paciente_propietario_id != $request->paciente_id) {
                return response()->json([
                    'error' => 'El item de stock seleccionado no pertenece al paciente'
                ], 400);
            }
        }

        $medicacion = Medicacion::create($request->all());
        return response()->json($medicacion, 201);
    }

    public function storeBatch(Request $request)
    {
        $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'medicamentos' => 'required|array|min:1',
            'medicamentos.*.nombre' => 'required|string|max:255',
            'medicamentos.*.dosis' => 'nullable|string',
            'medicamentos.*.frecuencia' => 'nullable|string',
            'medicamentos.*.tipo' => 'in:diaria,sos',
            'medicamentos.*.cantidad_mensual' => 'nullable|integer',
            'medicamentos.*.fecha_inicio' => 'nullable|date',
            'medicamentos.*.fecha_fin' => 'nullable|date',
            'medicamentos.*.origen_pago' => 'required|in:obra_social,geriatrico,paciente',
            'medicamentos.*.stock_item_id' => 'nullable|exists:stock_items,id',
        ]);

        $paciente_id = $request->paciente_id;
        $medicamentos = [];

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $paciente_id, &$medicamentos) {
            foreach ($request->medicamentos as $medData) {
                // Validar origen de pago vs stock
                if (isset($medData['stock_item_id']) && $medData['stock_item_id']) {
                    $stockItem = \App\Models\StockItem::find($medData['stock_item_id']);
                    
                    if ($stockItem) {
                        // Si el origen es geriátrico, validar que el stock sea del geriátrico
                        if ($medData['origen_pago'] === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
                            throw new \Exception('El item de stock "' . $stockItem->nombre . '" no pertenece al geriátrico');
                        }
                        
                        // Si el origen es paciente, validar que el stock sea del paciente
                        if ($medData['origen_pago'] === 'paciente' && $stockItem->paciente_propietario_id != $paciente_id) {
                            throw new \Exception('El item de stock "' . $stockItem->nombre . '" no pertenece al paciente');
                        }
                    }
                }
                
                $medData['paciente_id'] = $paciente_id;
                $medicamentos[] = Medicacion::create($medData);
            }
        });

        return response()->json($medicamentos, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Medicacion::with('paciente')->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Medicacion $medicacion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(Request $request, $id)
    {
        $medicacion = Medicacion::findOrFail($id);
        $medicacion->update($request->all());
        return response()->json($medicacion);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
         Medicacion::findOrFail($id)->delete();
        return response()->noContent();
    }
}
