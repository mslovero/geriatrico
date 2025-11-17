<?php

namespace App\Http\Controllers;

use App\Models\HistorialMedico;
use Illuminate\Http\Request;

class HistorialMedicoController extends Controller
{
    // 🔹 Listar todos los historiales
    public function index()
    {
        $historiales = HistorialMedico::with('paciente')->get();
        return response()->json($historiales);
    }

    // 🔹 Crear nuevo historial
    public function store(Request $request)
    {
        $data = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'fecha' => 'required|date',
            'observacion' => 'nullable|string',
            'medico_responsable' => 'nullable|string|max:255',
        ]);

        $historial = HistorialMedico::create($data);

        return response()->json([
            'message' => 'Historial médico creado correctamente',
            'data' => $historial,
        ], 201);
    }

    // 🔹 Mostrar un historial por ID
    public function show($id)
    {
        $historial = HistorialMedico::with('archivosAdjuntos')->findOrFail($id);
        return response()->json($historial);
    }

    // 🔹 Actualizar un historial
    public function update(Request $request, $id)
    {
        $historial = HistorialMedico::findOrFail($id);

        $data = $request->validate([
            'fecha' => 'nullable|date',
            'observacion' => 'nullable|string',
            'medico_responsable' => 'nullable|string|max:255',
        ]);

        $historial->update($data);

        return response()->json([
            'message' => 'Historial médico actualizado correctamente',
            'data' => $historial,
        ]);
    }

    // 🔹 Eliminar un historial
    public function destroy($id)
    {
        $historial = HistorialMedico::findOrFail($id);
        $historial->delete();

        return response()->json(['message' => 'Historial médico eliminado correctamente']);
    }
}
