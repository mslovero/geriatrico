<?php

namespace App\Http\Controllers;

use App\Models\Dieta;
use Illuminate\Http\Request;

class DietaController extends Controller
{
    public function index()
    {
        $dietas = Dieta::with('paciente')->orderBy('updated_at', 'desc')->get();
        return response()->json($dietas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'tipo' => 'required|string',
            'consistencia' => 'required|string',
            'alergias' => 'nullable|string',
            'observaciones' => 'nullable|string',
        ]);

        
        $dieta = Dieta::create($validated);

        return response()->json([
            'message' => 'Dieta registrada correctamente',
            'data' => $dieta
        ], 201);
    }

    public function show(Dieta $dieta)
    {
        return response()->json($dieta->load('paciente'));
    }

    public function update(Request $request, $id)
    {
        $dieta = Dieta::findOrFail($id);

        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'tipo' => 'sometimes|string',
            'consistencia' => 'sometimes|string',
            'alergias' => 'nullable|string',
            'observaciones' => 'nullable|string',
        ]);

        $dieta->update($validated);

        return response()->json([
            'message' => 'Dieta actualizada correctamente',
            'data' => $dieta
        ]);
    }

    public function destroy($id)
    {
        $dieta = Dieta::findOrFail($id);
        $dieta->delete();

        return response()->json(['message' => 'Dieta eliminada correctamente']);
    }
}
