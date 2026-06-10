<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TopMedicamentosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'limite' => 'nullable|integer|min:1|max:50',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ];
    }

    public function messages(): array
    {
        return [
            'limite.integer' => 'El límite debe ser un número entero',
            'limite.min' => 'El límite mínimo es 1',
            'limite.max' => 'El límite máximo es 50',
            'fecha_hasta.after_or_equal' => 'La fecha hasta debe ser posterior o igual a la fecha desde',
        ];
    }
}
