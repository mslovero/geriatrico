<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchMedicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paciente_id' => 'required|exists:pacientes,id',
            'medicamentos' => 'required|array|min:1',
            'medicamentos.*.nombre' => 'required|string|max:255',
            'medicamentos.*.dosis' => 'nullable|string|max:255',
            'medicamentos.*.frecuencia' => 'nullable|string|max:255',
            'medicamentos.*.tipo' => 'nullable|in:diaria,sos',
            'medicamentos.*.cantidad_mensual' => 'nullable|integer|min:0',
            'medicamentos.*.fecha_inicio' => 'nullable|date',
            'medicamentos.*.fecha_fin' => 'nullable|date|after_or_equal:medicamentos.*.fecha_inicio',
            'medicamentos.*.origen_pago' => 'required|in:obra_social,geriatrico,paciente',
            'medicamentos.*.stock_item_id' => 'nullable|exists:stock_items,id',
            'medicamentos.*.observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'paciente_id.required' => 'El paciente es obligatorio',
            'paciente_id.exists' => 'El paciente seleccionado no existe',
            'medicamentos.required' => 'Debés enviar al menos un medicamento',
            'medicamentos.array' => 'El campo medicamentos debe ser una lista',
            'medicamentos.min' => 'Debés enviar al menos un medicamento',
            'medicamentos.*.nombre.required' => 'El nombre del medicamento es obligatorio',
            'medicamentos.*.origen_pago.required' => 'El origen del pago es obligatorio',
            'medicamentos.*.origen_pago.in' => 'El origen del pago debe ser obra_social, geriatrico o paciente',
            'medicamentos.*.stock_item_id.exists' => 'El item de stock seleccionado no existe',
            'medicamentos.*.fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la de inicio',
        ];
    }
}
