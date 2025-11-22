<?php

namespace App\Http\Controllers;

use App\Models\RegistroMedicacion;
use Illuminate\Http\Request;

class RegistroMedicacionController extends Controller
{
    public function index()
    {
        // Traemos la medicación y el paciente asociado, y el usuario que registró
        $registros = RegistroMedicacion::with(['medicacion.paciente', 'user'])
            ->orderBy('fecha_hora', 'desc')
            ->get();
        return response()->json($registros);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicacion_id' => 'required|exists:medicacions,id',
            'fecha_hora' => 'required|date',
            'estado' => 'required|in:administrado,rechazado,suspendido,error',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id', // Opcional si se selecciona manual
        ]);

        // Si no se envió user_id manual, usar el autenticado
        if (empty($validated['user_id']) && $request->user()) {
            $validated['user_id'] = $request->user()->id;
        }

        $registro = RegistroMedicacion::create($validated);

        return response()->json([
            'message' => 'Administración registrada correctamente',
            'data' => $registro
        ], 201);
    }

    public function show(RegistroMedicacion $registroMedicacion)
    {
        return response()->json($registroMedicacion->load(['medicacion.paciente', 'user']));
    }

    public function update(Request $request, $id)
    {
        $registro = RegistroMedicacion::findOrFail($id);

        $validated = $request->validate([
            'medicacion_id' => 'sometimes|exists:medicacions,id',
            'fecha_hora' => 'sometimes|date',
            'estado' => 'sometimes|in:administrado,rechazado,suspendido,error',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $registro->update($validated);

        return response()->json([
            'message' => 'Registro actualizado correctamente',
            'data' => $registro
        ]);
    }

    public function destroy($id)
    {
        $registro = RegistroMedicacion::findOrFail($id);
        $registro->delete();

        return response()->json(['message' => 'Registro eliminado correctamente']);
    }
}
