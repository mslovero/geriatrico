<?php

namespace App\Http\Controllers;

use App\Models\TurnoMedico;
use App\Http\Requests\StoreTurnoMedicoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TurnoMedicoController extends Controller
{
    /**
     * Listar turnos (paginado, próximos primero)
     */
    public function index()
    {
        Gate::authorize('viewAny', TurnoMedico::class);
        return TurnoMedico::with('paciente')
            ->orderBy('fecha_hora', 'asc')
            ->paginate(15);
    }

    /**
     * Registrar nuevo turno
     */
    public function store(StoreTurnoMedicoRequest $request)
    {
        Gate::authorize('create', TurnoMedico::class);
        $turno = TurnoMedico::create($request->validated());

        return response()->json([
            'message' => 'Turno registrado correctamente',
            'data' => $turno->load('paciente')
        ], 201);
    }

    /**
     * Ver detalle de turno
     */
    public function show(TurnoMedico $turnoMedico)
    {
        Gate::authorize('view', $turnoMedico);
        return response()->json($turnoMedico->load('paciente'));
    }

    /**
     * Actualizar turno
     */
    public function update(Request $request, $id)
    {
        $turno = TurnoMedico::findOrFail($id);
        Gate::authorize('update', $turno);

        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'profesional' => 'sometimes|string|max:100',
            'especialidad' => 'sometimes|string|max:100',
            'fecha_hora' => 'sometimes|date',
            'lugar' => 'nullable|string|max:255',
            'estado' => 'sometimes|in:pendiente,completado,cancelado',
            'observaciones' => 'nullable|string',
        ]);

        $turno->update($validated);

        return response()->json([
            'message' => 'Turno actualizado correctamente',
            'data' => $turno->load('paciente')
        ]);
    }

    /**
     * Eliminar turno (Solo Admin)
     */
    public function destroy($id)
    {
        $turno = TurnoMedico::findOrFail($id);
        Gate::authorize('delete', $turno);
        
        $turno->delete();
        return response()->json(['message' => 'Turno eliminado correctamente']);
    }
}
