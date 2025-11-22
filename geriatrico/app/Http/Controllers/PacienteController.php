<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PacienteController extends Controller
{
    // 🔹 Listar pacientes (paginado)
    public function index(Request $request)
    {
        $query = Paciente::with(['habitacion', 'cama', 'historialMedico', 'medicaciones', 'archivos']);

        // Filtrado por estado si se pasa
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Paginación
        $pacientes = $query->paginate(15);

        return response()->json($pacientes);
    }

    // 🔹 Crear nuevo paciente
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'dni' => 'required|string|unique:pacientes,dni',
            'fecha_nacimiento' => 'nullable|date',
            'habitacion_id' => 'nullable|exists:habitaciones,id',
            'cama_id' => 'nullable|exists:camas,id',
            'contacto_emergencia' => 'nullable|array',
            'contacto_emergencia.nombre' => 'required_with:contacto_emergencia|string',
            'contacto_emergencia.telefono' => 'required_with:contacto_emergencia|string',
            'medico_cabecera' => 'nullable|string|max:150',
            'estado' => ['nullable', Rule::in([
                'activo', 'temporal', 'ausente', 'suspendido', 'alta_medica', 'egresado', 'fallecido'
            ])],
        ]);

        $paciente = Paciente::create($data);

        // Si se asignó una cama, marcarla como ocupada
        if (isset($data['cama_id'])) {
            \App\Models\Cama::where('id', $data['cama_id'])->update(['estado' => 'ocupada']);
        }

        return response()->json($paciente, 201);
    }

    // 🔹 Mostrar paciente específico
    public function show(Paciente $paciente)
    {
        $paciente->load([
            'habitacion', 
            'cama', 
            'historialMedico', 
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
    public function update(Request $request, Paciente $paciente)
    {
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'dni' => ['sometimes','string',Rule::unique('pacientes','dni')->ignore($paciente->id)],
            'fecha_nacimiento' => 'sometimes|date',
            'habitacion_id' => 'sometimes|nullable|exists:habitaciones,id',
            'cama_id' => 'sometimes|nullable|exists:camas,id',
            'contacto_emergencia' => 'sometimes|array',
            'contacto_emergencia.nombre' => 'required_with:contacto_emergencia|string',
            'contacto_emergencia.telefono' => 'required_with:contacto_emergencia|string',
            'medico_cabecera' => 'sometimes|string|max:150',
            'estado' => ['sometimes', Rule::in([
                'activo', 'temporal', 'ausente', 'suspendido', 'alta_medica', 'egresado', 'fallecido'
            ])],
        ]);

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
        $paciente->delete();
        return response()->json(['message' => 'Paciente eliminado correctamente.']);
    }
}
