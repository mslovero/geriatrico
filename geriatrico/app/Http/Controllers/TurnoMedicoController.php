<?php

namespace App\Http\Controllers;

use App\Models\TurnoMedico;
use Illuminate\Http\Request;

class TurnoMedicoController extends Controller
{
    public function index()
    {
        // Ordenar por fecha próxima primero
        $turnos = TurnoMedico::with('paciente')->orderBy('fecha_hora', 'asc')->get();
        return response()->json($turnos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'profesional' => 'required|string',
            'especialidad' => 'required|string',
            'fecha_hora' => 'required|date',
            'lugar' => 'nullable|string',
            'estado' => 'required|in:pendiente,completado,cancelado',
            'observaciones' => 'nullable|string',
        ]);

        $turno = TurnoMedico::create($validated);

        return response()->json([
            'message' => 'Turno registrado correctamente',
            'data' => $turno
        ], 201);
    }

    public function show(TurnoMedico $turnoMedico)
    {
        return response()->json($turnoMedico->load('paciente'));
    }

    public function update(Request $request, $id)
    {
        $turno = TurnoMedico::findOrFail($id);

        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'profesional' => 'sometimes|string',
            'especialidad' => 'sometimes|string',
            'fecha_hora' => 'sometimes|date',
            'lugar' => 'nullable|string',
            'estado' => 'sometimes|in:pendiente,completado,cancelado',
            'observaciones' => 'nullable|string',
        ]);

        $turno->update($validated);

        return response()->json([
            'message' => 'Turno actualizado correctamente',
            'data' => $turno
        ]);
    }

    public function destroy($id)
    {
        $turno = TurnoMedico::findOrFail($id);
        $turno->delete();

        return response()->json(['message' => 'Turno eliminado correctamente']);
    }
}
