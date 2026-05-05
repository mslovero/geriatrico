<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTurnoMedicoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paciente_id' => 'required|exists:pacientes,id',
            'profesional' => 'required|string|max:100',
            'especialidad' => 'required|string|max:100',
            'fecha_hora' => 'required|date|after:now',
            'lugar' => 'nullable|string|max:255',
            'estado' => 'required|in:pendiente,completado,cancelado',
            'observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'paciente_id.required' => 'El paciente es obligatorio',
            'profesional.required' => 'El nombre del profesional es obligatorio',
            'especialidad.required' => 'La especialidad médica es obligatoria',
            'fecha_hora.required' => 'La fecha y hora del turno son obligatorias',
            'fecha_hora.after' => 'No se pueden registrar turnos en fechas pasadas',
        ];
    }
}
