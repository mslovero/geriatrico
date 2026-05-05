<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegistroMedicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'medicacion_id' => 'required|exists:medicacions,id',
            'fecha_hora' => 'required|date',
            'estado' => 'required|in:administrado,rechazado,suspendido,error',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'medicacion_id.required' => 'La medicación es obligatoria',
            'medicacion_id.exists' => 'La medicación seleccionada no existe',
            'fecha_hora.required' => 'La fecha y hora son obligatorias',
            'estado.required' => 'El estado es obligatorio',
            'estado.in' => 'El estado seleccionado no es válido (debe ser administrado, rechazado, suspendido o error)',
        ];
    }
}
