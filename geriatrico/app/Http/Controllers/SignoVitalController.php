<?php

namespace App\Http\Controllers;

use App\Models\SignoVital;
use App\Models\Paciente;
use App\Http\Requests\StoreSignoVitalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SignoVitalController extends Controller
{
    /**
     * Listar todos los signos vitales (paginado)
     */
    public function index()
    {
        Gate::authorize('viewAny', SignoVital::class);
        return SignoVital::with('paciente')->orderBy('fecha', 'desc')->paginate(15);
    }

    /**
     * Obtener historial de signos vitales para un paciente específico (para gráficos)
     */
    public function historialPaciente($pacienteId, Request $request)
    {
        $paciente = Paciente::findOrFail($pacienteId);
        Gate::authorize('viewAny', SignoVital::class);

        $limit = $request->query('limit', 20);

        $historial = SignoVital::where('paciente_id', $pacienteId)
            ->orderBy('fecha', 'asc') // Orden ascendente para gráficos de líneas
            ->limit($limit)
            ->get();

        return response()->json([
            'paciente' => [
                'id' => $paciente->id,
                'nombre_completo' => $paciente->nombre . ' ' . $paciente->apellido,
            ],
            'data' => $historial
        ]);
    }

    /**
     * Registrar nuevos signos vitales
     */
    public function store(StoreSignoVitalRequest $request)
    {
        Gate::authorize('create', SignoVital::class);
        $validated = $request->validated();

        if (empty($validated['registrado_por']) && auth()->check()) {
            $validated['registrado_por'] = auth()->user()->name;
        }

        $signo = SignoVital::create($validated);

        return response()->json([
            'message' => 'Signos vitales registrados correctamente',
            'data' => $signo->load('paciente')
        ], 201);
    }

    /**
     * Ver un registro específico
     */
    public function show(SignoVital $signoVital)
    {
        Gate::authorize('view', $signoVital);
        return response()->json($signoVital->load('paciente'));
    }

    /**
     * Actualizar registro
     */
    public function update(Request $request, $id)
    {
        $signoVital = SignoVital::findOrFail($id);
        Gate::authorize('update', $signoVital);
        
        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'fecha' => 'sometimes|date',
            'presion_arterial' => 'nullable|string|max:20',
            'temperatura' => 'nullable|numeric|min:30|max:45',
            'frecuencia_cardiaca' => 'nullable|integer|min:20|max:250',
            'saturacion_oxigeno' => 'nullable|integer|min:0|max:100',
            'glucosa' => 'nullable|integer|min:0|max:1000',
            'observaciones' => 'nullable|string',
        ]);

        $signoVital->update($validated);

        return response()->json([
            'message' => 'Registro actualizado correctamente',
            'data' => $signoVital->load('paciente')
        ]);
    }

    /**
     * Eliminar registro
     */
    public function destroy($id)
    {
        $signoVital = SignoVital::findOrFail($id);
        Gate::authorize('delete', $signoVital);
        
        $signoVital->delete();
        return response()->json(['message' => 'Registro eliminado correctamente']);
    }
}
