<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\Notification;
use App\Http\Requests\StorePacienteRequest;
use App\Http\Requests\UpdatePacienteRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Barryvdh\DomPDF\Facade\Pdf;

class PacienteController extends Controller
{
    // 🔹 Listar pacientes (paginado)
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Paciente::class);
        $query = Paciente::with(['habitacion', 'cama', 'historial_medico', 'medicaciones', 'archivos']);

        // Filtrado por estado si se pasa
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Paginación
        $pacientes = $query->paginate(15);

        return response()->json($pacientes);
    }

    // 🔹 Crear nuevo paciente
    public function store(StorePacienteRequest $request)
    {
        Gate::authorize('create', Paciente::class);
        $data = $request->validated();

        $paciente = Paciente::create($data);

        // Si se asignó una cama, marcarla como ocupada
        if (isset($data['cama_id'])) {
            \App\Models\Cama::where('id', $data['cama_id'])->update(['estado' => 'ocupada']);
        }

        // Crear notificación de nuevo ingreso
        try {
            Notification::create([
                'tipo' => 'paciente_nuevo',
                'titulo' => 'Nuevo Ingreso',
                'mensaje' => "Se ha registrado el paciente {$paciente->nombre} {$paciente->apellido}",
                'enlace' => "/pacientes/{$paciente->id}/ficha",
                'paciente_id' => $paciente->id,
            ]);
        } catch (\Exception $e) {
            \Log::warning('No se pudo crear notificación de nuevo paciente: ' . $e->getMessage());
        }

        return response()->json($paciente, 201);
    }

    // 🔹 Mostrar paciente específico
    public function show(Paciente $paciente)
    {
        $paciente->load([
            'habitacion', 
            'cama', 
            'historial_medico', 
            'medicaciones', 
            'archivos',
            'signosVitales',
            'dietas',
            'incidencias',
            'turnosMedicos'
        ]);
        return response()->json($paciente);
    }

    // 🔹 Actualizar paciente
    public function update(UpdatePacienteRequest $request, Paciente $paciente)
    {
        Gate::authorize('update', $paciente);
        $data = $request->validated();

        // Manejar cambio de cama
        $camaAnterior = $paciente->cama_id;

        $paciente->update($data);

        // Si cambió la cama, actualizar estados
        if (isset($data['cama_id']) && $data['cama_id'] !== $camaAnterior) {
            // Liberar cama anterior
            if ($camaAnterior) {
                \App\Models\Cama::where('id', $camaAnterior)->update(['estado' => 'libre']);
            }
            // Ocupar nueva cama
            if ($data['cama_id']) {
                \App\Models\Cama::where('id', $data['cama_id'])->update(['estado' => 'ocupada']);
            }
        }

        return response()->json($paciente);
    }

    // 🔹 Eliminar paciente (soft delete)
    public function destroy(Paciente $paciente)
    {
        Gate::authorize('delete', $paciente);
        $paciente->delete();
        return response()->json(['message' => 'Paciente eliminado correctamente.']);
    }

    // 🔹 Exportar Ficha del Paciente a PDF
    public function exportPdf($id)
    {
        $paciente = Paciente::with([
            'habitacion', 
            'cama', 
            'historial_medico', 
            'medicaciones', 
            'signosVitales' => fn($q) => $q->orderBy('fecha', 'desc')->limit(10),
            'incidencias' => fn($q) => $q->orderBy('fecha_hora', 'desc')->limit(10),
            'turnosMedicos' => fn($q) => $q->where('fecha_hora', '>', now())->orderBy('fecha_hora', 'asc')
        ])->findOrFail($id);

        Gate::authorize('view', $paciente);

        $pdf = Pdf::loadView('pdf.ficha-paciente', compact('paciente'));
        
        return $pdf->download("Ficha_{$paciente->nombre}_{$paciente->apellido}.pdf");
    }
}
