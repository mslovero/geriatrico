<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistroMedicacionRequest;
use App\Http\Requests\UpdateRegistroMedicacionRequest;
use App\Http\Resources\RegistroMedicacionResource;
use App\Models\RegistroMedicacion;
use App\Services\RegistroMedicacionService;
use Illuminate\Support\Facades\Gate;

class RegistroMedicacionController extends Controller
{
    public function __construct(private readonly RegistroMedicacionService $registros)
    {
    }

    public function index()
    {
        Gate::authorize('viewAny', RegistroMedicacion::class);

        return RegistroMedicacionResource::collection(
            RegistroMedicacion::with(['medicacion.paciente', 'user'])
                ->orderByDesc('fecha_hora')
                ->paginate(15)
        );
    }

    public function store(StoreRegistroMedicacionRequest $request)
    {
        Gate::authorize('create', RegistroMedicacion::class);

        $validated = $request->validated();
        $validated['user_id'] ??= auth()->id();

        $registro = $this->registros->registrarAdministracion($validated);
        $registro->load(['medicacion.paciente', 'medicacion.stockItem', 'loteStock', 'user']);

        return response()->json([
            'message' => 'Administración registrada correctamente',
            'data' => new RegistroMedicacionResource($registro),
            'stock_restante' => $registro->medicacion?->stockItem?->stock_actual,
        ], 201);
    }

    public function update(UpdateRegistroMedicacionRequest $request, $id)
    {
        $registro = RegistroMedicacion::findOrFail($id);
        Gate::authorize('update', $registro);

        $actualizado = $this->registros->aplicarAdministracion($registro, $request->validated());
        $actualizado->load(['medicacion.paciente', 'medicacion.stockItem', 'loteStock', 'user']);

        return response()->json([
            'message' => 'Registro actualizado correctamente',
            'data' => new RegistroMedicacionResource($actualizado),
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
