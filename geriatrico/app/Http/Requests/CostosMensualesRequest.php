<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CostosMensualesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'anio' => 'nullable|integer|min:2020|max:2099',
        ];
    }

    public function messages(): array
    {
        return [
            'anio.integer' => 'El año debe ser un número entero',
            'anio.min' => 'El año mínimo permitido es 2020',
            'anio.max' => 'El año máximo permitido es 2099',
        ];
    }
}
