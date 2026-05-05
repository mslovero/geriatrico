<?php

namespace App\Http\Controllers;

use App\Models\Incidencia;
use App\Models\Notification;
use App\Models\Paciente;
use App\Http\Requests\StoreIncidenciaRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class IncidenciaController extends Controller
{
    /**
     * Listar incidencias (paginado)
     */
    public function index()
    {
        Gate::authorize('viewAny', Incidencia::class);
        $incidencias = Incidencia::with(['paciente', 'user'])
            ->orderBy('fecha_hora', 'desc')
            ->paginate(15);
        return response()->json($incidencias);
    }

    /**
     * Registrar una nueva incidencia
     */
    public function store(StoreIncidenciaRequest $request)
    {
        Gate::authorize('create', Incidencia::class);
        $validated = $request->validated();

        if (empty($validated['user_id']) && auth()->check()) {
            $validated['user_id'] = auth()->id();
        }

        $incidencia = Incidencia::create($validated);
        
        // Crear notificación automática basada en severidad
        $this->createAutomaticNotification($incidencia);

        return response()->json([
            'message' => 'Incidencia registrada correctamente',
            'data' => $incidencia->load(['paciente', 'user'])
        ], 201);
    }

    /**
     * Ver detalle de incidencia
     */
    public function show(Incidencia $incidencia)
    {
        Gate::authorize('view', $incidencia);
        return response()->json($incidencia->load(['paciente', 'user']));
    }

    /**
     * Actualizar incidencia
     */
    public function update(Request $request, $id)
    {
        $incidencia = Incidencia::findOrFail($id);
        Gate::authorize('update', $incidencia);

        $validated = $request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'fecha_hora' => 'sometimes|date',
            'tipo' => 'sometimes|string|max:100',
            'severidad' => 'sometimes|in:leve,moderada,grave,critica',
            'descripcion' => 'sometimes|string|min:10',
            'acciones_tomadas' => 'nullable|string',
        ]);

        $incidencia->update($validated);

        return response()->json([
            'message' => 'Incidencia actualizada correctamente',
            'data' => $incidencia->load(['paciente', 'user'])
        ]);
    }

    /**
     * Eliminar incidencia (Solo Admin)
     */
    public function destroy($id)
    {
        $incidencia = Incidencia::findOrFail($id);
        Gate::authorize('delete', $incidencia);
        
        $incidencia->delete();
        return response()->json(['message' => 'Incidencia eliminada correctamente']);
    }

    /**
     * Lógica interna para crear notificaciones
     */
    protected function createAutomaticNotification(Incidencia $incidencia)
    {
        try {
            $paciente = $incidencia->paciente;
            if ($paciente) {
                Notification::create([
                    'tipo' => 'incidencia',
                    'titulo' => 'Nueva Incidencia: ' . ucfirst($incidencia->severidad),
                    'mensaje' => "{$paciente->nombre} {$paciente->apellido}: {$incidencia->descripcion}",
                    'enlace' => '/incidencias',
                    'paciente_id' => $paciente->id,
                    'color' => $this->getSeverityColor($incidencia->severidad),
                ]);
            }
        } catch (\Exception $e) {
            \Log::warning('No se pudo crear notificación de incidencia: ' . $e->getMessage());
        }
    }

    protected function getSeverityColor($severidad)
    {
        return match($severidad) {
            'critica' => 'danger',
            'grave' => 'warning',
            'moderada' => 'info',
            default => 'primary',
        };
    }
}
