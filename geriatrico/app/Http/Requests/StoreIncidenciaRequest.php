<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncidenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paciente_id' => 'required|exists:pacientes,id',
            'fecha_hora' => 'required|date',
            'tipo' => 'required|string|max:100',
            'severidad' => 'required|in:leve,moderada,grave,critica',
            'descripcion' => 'required|string|min:10',
            'acciones_tomadas' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'paciente_id.required' => 'El paciente es obligatorio',
            'paciente_id.exists' => 'El paciente seleccionado no existe',
            'fecha_hora.required' => 'La fecha y hora del incidente son obligatorias',
            'tipo.required' => 'El tipo de incidencia es obligatorio',
            'severidad.required' => 'La severidad es obligatoria',
            'severidad.in' => 'La severidad seleccionada no es válida',
            'descripcion.required' => 'Debe proporcionar una descripción detallada',
            'descripcion.min' => 'La descripción debe tener al menos 10 caracteres para ser válida en una auditoría',
        ];
    }
}
