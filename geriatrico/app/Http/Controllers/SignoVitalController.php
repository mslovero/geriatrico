<?php

namespace App\Http\Controllers;

use App\Models\SignoVital;
use Illuminate\Http\Request;

class SignoVitalController extends Controller
{
    public function index()
    {
        $signos = SignoVital::with('paciente')->orderBy('fecha', 'desc')->get();
        return response()->json($signos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'fecha' => 'required|date',
            'presion_arterial' => 'nullable|string',
            'temperatura' => 'nullable|numeric',
            'frecuencia_cardiaca' => 'nullable|integer',
            'saturacion_oxigeno' => 'nullable|integer',
            'glucosa' => 'nullable|integer',
            'observaciones' => 'nullable|string',
            'registrado_por' => 'nullable|string',
        ]);

        // Si no se envió manualmente, usar el usuario autenticado
        if (empty($validated['registrado_por']) && $request->user()) {
            $validated['registrado_por'] = $request->user()->name;
        }

        $signo = SignoVital::create($validated);

        return response()->json([
            'message' => 'Signos vitales registrados correctamente',
            'data' => $signo
        ], 201);
    }

    public function show(SignoVital $signoVital)
    {
        return response()->json($signoVital->load('paciente'));
    }

    public function update(Request $request, $id)
    {
        $signoVital = SignoVital::findOrFail($id);
        
        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'fecha' => 'sometimes|date',
            'presion_arterial' => 'nullable|string',
            'temperatura' => 'nullable|numeric',
            'frecuencia_cardiaca' => 'nullable|integer',
            'saturacion_oxigeno' => 'nullable|integer',
            'glucosa' => 'nullable|integer',
            'observaciones' => 'nullable|string',
        ]);

        $signoVital->update($validated);

        return response()->json([
            'message' => 'Registro actualizado correctamente',
            'data' => $signoVital
        ]);
    }

    public function destroy($id)
    {
        $signoVital = SignoVital::findOrFail($id);
        $signoVital->delete();

        return response()->json(['message' => 'Registro eliminado correctamente']);
    }
}
