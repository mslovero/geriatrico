<?php

namespace App\Http\Controllers;

use App\Models\Incidencia;
use App\Models\Notification;
use App\Models\Paciente;
use Illuminate\Http\Request;

class IncidenciaController extends Controller
{
    public function index()
    {
        $incidencias = Incidencia::with(['paciente', 'user'])
            ->orderBy('fecha_hora', 'desc')
            ->get();
        return response()->json($incidencias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'fecha_hora' => 'required|date',
            'tipo' => 'required|string',
            'severidad' => 'required|in:leve,moderada,grave,critica',
            'descripcion' => 'required|string',
            'acciones_tomadas' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if (empty($validated['user_id']) && $request->user()) {
            $validated['user_id'] = $request->user()->id;
        }

        $incidencia = Incidencia::create($validated);
        
        // Crear notificación automática
        try {
            $paciente = Paciente::find($validated['paciente_id']);
            if ($paciente) {
                Notification::create([
                    'tipo' => 'incidencia',
                    'titulo' => 'Nueva Incidencia: ' . ucfirst($validated['severidad']),
                    'mensaje' => "{$paciente->nombre} {$paciente->apellido}: {$validated['descripcion']}",
                    'enlace' => '/incidencias',
                    'paciente_id' => $paciente->id,
                    'color' => $validated['severidad'] === 'critica' ? 'danger' : ($validated['severidad'] === 'grave' ? 'warning' : 'info'),
                ]);
            }
        } catch (\Exception $e) {
            // Log pero no fallar la operación principal
            \Log::warning('No se pudo crear notificación de incidencia: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Incidencia registrada correctamente',
            'data' => $incidencia
        ], 201);
    }

    public function show(Incidencia $incidencia)
    {
        return response()->json($incidencia->load(['paciente', 'user']));
    }

    public function update(Request $request, $id)
    {
        $incidencia = Incidencia::findOrFail($id);

        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'fecha_hora' => 'sometimes|date',
            'tipo' => 'sometimes|string',
            'severidad' => 'sometimes|in:leve,moderada,grave,critica',
            'descripcion' => 'sometimes|string',
            'acciones_tomadas' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $incidencia->update($validated);

        return response()->json([
            'message' => 'Incidencia actualizada correctamente',
            'data' => $incidencia
        ]);
    }

    public function destroy($id)
    {
        $incidencia = Incidencia::findOrFail($id);
        $incidencia->delete();

        return response()->json(['message' => 'Incidencia eliminada correctamente']);
    }
}
