<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PeriodoReporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_hasta.after_or_equal' => 'La fecha hasta debe ser posterior o igual a la fecha desde',
        ];
    }
}
