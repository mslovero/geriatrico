<?php

namespace App\Http\Controllers;

use App\Models\Cama;
use Illuminate\Http\Request;

class CamasController extends Controller
{
    /**
     * Mostrar todas las camas.
     */
    public function index()
    {
        $camas = Cama::with('habitacion')->get(); // Trae todas las camas con su habitación
        return response()->json($camas, 200);
    }

    /**
     * Mostrar el formulario de creación (solo si usás Blade).
     */
    public function create()
    {
        return view('camas.create');
    }

    /**
     * Guardar una nueva cama.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'habitacion_id' => 'required|exists:habitaciones,id',
            'numero_cama'   => 'required|string|max:255',
            'estado'        => 'in:libre,ocupada,mantenimiento',
        ]);

        $cama = Cama::create($validated);

        return response()->json([
            'message' => 'Cama creada correctamente',
            'data' => $cama
        ], 201);
    }

    /**
     * Mostrar una cama específica.
     */
    public function show($id)
    {
        $cama = Cama::with('habitacion')->find($id);

        if (!$cama) {
            return response()->json(['message' => 'Cama no encontrada'], 404);
        }

        return response()->json($cama);
    }

    /**
     * Mostrar el formulario de edición (solo si usás Blade).
     */
    public function edit($id)
    {
        $cama = Cama::findOrFail($id);
        return view('camas.edit', compact('cama'));
    }

    /**
     * Actualizar una cama existente.
     */
    public function update(Request $request, $id)
    {
        $cama = Cama::find($id);

        if (!$cama) {
            return response()->json(['message' => 'Cama no encontrada'], 404);
        }

        $validated = $request->validate([
            'habitacion_id' => 'sometimes|exists:habitaciones,id',
            'numero_cama'   => 'sometimes|string|max:255',
            'estado'        => 'sometimes|in:libre,ocupada,mantenimiento',
        ]);

        $cama->update($validated);

        return response()->json([
            'message' => 'Cama actualizada correctamente',
            'data' => $cama
        ]);
    }

    /**
     * Eliminar una cama.
     */
    public function destroy($id)
    {
        $cama = Cama::find($id);

        if (!$cama) {
            return response()->json(['message' => 'Cama no encontrada'], 404);
        }

        $cama->delete();

        return response()->json(['message' => 'Cama eliminada correctamente']);
    }
}
