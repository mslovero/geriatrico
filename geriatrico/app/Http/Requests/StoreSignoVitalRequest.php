<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSignoVitalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paciente_id' => 'required|exists:pacientes,id',
            'fecha' => 'required|date',
            'presion_arterial' => 'nullable|string|max:20',
            'temperatura' => 'nullable|numeric|min:30|max:45',
            'frecuencia_cardiaca' => 'nullable|integer|min:20|max:250',
            'saturacion_oxigeno' => 'nullable|integer|min:0|max:100',
            'glucosa' => 'nullable|integer|min:0|max:1000',
            'observaciones' => 'nullable|string',
            'registrado_por' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'paciente_id.required' => 'El paciente es obligatorio',
            'fecha.required' => 'La fecha y hora del registro son obligatorias',
            'temperatura.numeric' => 'La temperatura debe ser un valor numérico',
            'temperatura.min' => 'Valor de temperatura demasiado bajo',
            'temperatura.max' => 'Valor de temperatura demasiado alto',
        ];
    }
}
