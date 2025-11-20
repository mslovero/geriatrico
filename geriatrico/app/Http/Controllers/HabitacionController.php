<?php

namespace App\Http\Controllers;

use App\Models\Habitacion;
use Illuminate\Http\Request;

class HabitacionController extends Controller
{
    /**
     * Mostrar todas las habitaciones.
     */
    public function index()
    {
        $habitaciones = Habitacion::withCount(['cama as camas_totales', 'camasOcupadas as camas_ocupadas'])
            ->get();

        return response()->json($habitaciones, 200);
    }

    /**
     * Guardar una nueva habitación.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|string|max:255|unique:habitaciones,numero',
            'capacidad' => 'required|integer|min:1',
        ]);

        $habitacion = Habitacion::create($validated);

        return response()->json([
            'message' => 'Habitación creada correctamente',
            'data' => $habitacion
        ], 201);
    }

    /**
     * Mostrar una habitación específica.
     */
    public function show($id)
    {
        $habitacion = Habitacion::with('cama')->find($id);

        if (!$habitacion) {
            return response()->json(['message' => 'Habitación no encontrada'], 404);
        }

        return response()->json($habitacion);
    }

    /**
     * Actualizar una habitación existente.
     */
    public function update(Request $request, $id)
    {
        $habitacion = Habitacion::find($id);

        if (!$habitacion) {
            return response()->json(['message' => 'Habitación no encontrada'], 404);
        }

        $validated = $request->validate([
            'numero' => 'sometimes|string|max:255|unique:habitaciones,numero,' . $id,
            'capacidad' => 'sometimes|integer|min:1',
        ]);

        $habitacion->update($validated);

        return response()->json([
            'message' => 'Habitación actualizada correctamente',
            'data' => $habitacion
        ]);
    }

    /**
     * Eliminar una habitación.
     */
    public function destroy($id)
    {
        $habitacion = Habitacion::find($id);

        if (!$habitacion) {
            return response()->json(['message' => 'Habitación no encontrada'], 404);
        }

        // Verificar si tiene camas asociadas
        if ($habitacion->cama()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la habitación porque tiene camas asociadas'
            ], 400);
        }

        $habitacion->delete();

        return response()->json(['message' => 'Habitación eliminada correctamente']);
    }
}
