<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegistroMedicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'medicacion_id' => 'sometimes|required|exists:medicacions,id',
            'fecha_hora' => 'sometimes|required|date',
            'estado' => 'sometimes|required|in:administrado,rechazado,suspendido,error',
            'observaciones' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ];
    }
}
