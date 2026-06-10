<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdministrarMedicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'medicacion_id' => 'required|exists:medicacions,id',
            'cantidad' => 'nullable|integer|min:1',
            'observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'medicacion_id.required' => 'La medicación es obligatoria',
            'medicacion_id.exists' => 'La medicación seleccionada no existe',
            'cantidad.min' => 'La cantidad debe ser al menos 1',
        ];
    }
}
