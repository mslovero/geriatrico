<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBatchMedicacionRequest;
use App\Http\Requests\StoreMedicacionRequest;
use App\Http\Requests\UpdateMedicacionRequest;
use App\Http\Resources\MedicacionResource;
use App\Models\Medicacion;
use App\Services\MedicacionService;
use Illuminate\Support\Facades\Gate;

class MedicacionController extends Controller
{
    public function __construct(private readonly MedicacionService $medicaciones)
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('viewAny', Medicacion::class);

        return MedicacionResource::collection(
            Medicacion::with(['paciente', 'stockItem'])->paginate(15)
        );
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

    public function store(StoreMedicacionRequest $request)
    {
        Gate::authorize('create', Medicacion::class);

        $medicacion = Medicacion::create($request->validated());

        return (new MedicacionResource($medicacion))
            ->response()
            ->setStatusCode(201);
    }

    public function storeBatch(StoreBatchMedicacionRequest $request)
    {
        Gate::authorize('create', Medicacion::class);

        $medicaciones = $this->medicaciones->createBatch(
            (int) $request->paciente_id,
            $request->medicamentos,
        );

        return MedicacionResource::collection($medicaciones)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return new MedicacionResource(
            Medicacion::with(['paciente', 'stockItem'])->findOrFail($id)
        );
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
    public function update(UpdateMedicacionRequest $request, $id)
    {
        $medicacion = Medicacion::findOrFail($id);
        Gate::authorize('update', $medicacion);

        $medicacion->update($request->validated());

        return new MedicacionResource($medicacion->load(['paciente', 'stockItem']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
         $medicacion = Medicacion::findOrFail($id);
         Gate::authorize('delete', $medicacion);
         
         $medicacion->delete();
        return response()->noContent();
    }
}
