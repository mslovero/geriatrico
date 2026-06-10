<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistrarSalidaStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'required|string|max:255',
            'paciente_id' => 'nullable|exists:pacientes,id',
            'observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'cantidad.required' => 'La cantidad es obligatoria',
            'cantidad.min' => 'La cantidad debe ser al menos 1',
            'motivo.required' => 'El motivo es obligatorio',
            'paciente_id.exists' => 'El paciente indicado no existe',
        ];
    }
}
