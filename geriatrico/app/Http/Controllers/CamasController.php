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
            'numero_cama'   => 'required|string|max:255|unique:camas,numero_cama',
            'estado'        => 'in:libre,ocupada,mantenimiento',
        ], [
            'numero_cama.unique' => 'Ya existe una cama con este número. Los números de cama deben ser únicos y correlativos en todo el sistema.',
            'habitacion_id.required' => 'Debe seleccionar una habitación.',
            'habitacion_id.exists' => 'La habitación seleccionada no existe.',
            'numero_cama.required' => 'El número de cama es obligatorio.',
        ]);
        $habitacion = \App\Models\Habitacion::find($validated['habitacion_id']);
        if (!$habitacion) {
            return response()->json([
                'message' => 'La habitación seleccionada no existe.'
            ], 404);
        }

        $camasActuales = Cama::where('habitacion_id', $habitacion->id)->count();

        if ($camasActuales >= $habitacion->capacidad) {
            return response()->json([
                'message' => 'La habitación ya alcanzó su capacidad máxima. No se pueden agregar más camas.'
            ], 422);
        }

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
            'numero_cama'   => [
                'sometimes',
                'string',
                'max:255',
                // Validar que el número de cama sea único globalmente, excepto la cama actual
                \Illuminate\Validation\Rule::unique('camas', 'numero_cama')->ignore($id)
            ],
            'estado'        => 'sometimes|in:libre,ocupada,mantenimiento',
        ], [
            'numero_cama.unique' => 'Ya existe una cama con este número. Los números de cama deben ser únicos y correlativos en todo el sistema.',
            'habitacion_id.exists' => 'La habitación seleccionada no existe.',
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
