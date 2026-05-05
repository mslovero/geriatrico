<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'paciente_id' => 'required|exists:pacientes,id',
            'tipo' => 'nullable|in:diaria,sos',
            'dosis' => 'nullable|string|max:255',
            'frecuencia' => 'nullable|string|max:255',
            'cantidad_mensual' => 'nullable|integer|min:0',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'origen_pago' => 'required|in:obra_social,geriatrico,paciente',
            'stock_item_id' => 'nullable|exists:stock_items,id',
            'observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del medicamento es obligatorio',
            'paciente_id.required' => 'El paciente es obligatorio',
            'paciente_id.exists' => 'El paciente seleccionado no existe',
            'origen_pago.required' => 'El origen del pago es obligatorio',
            'origen_pago.in' => 'El origen del pago debe ser obra_social, geriatrico o paciente',
            'stock_item_id.exists' => 'El item de stock seleccionado no existe',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la de inicio',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->filled('stock_item_id')) {
                $stockItem = \App\Models\StockItem::find($this->stock_item_id);
                
                if ($stockItem) {
                    // Validar consistencia si es origen geriátrico
                    if ($this->origen_pago === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
                        $validator->errors()->add('stock_item_id', 'El item de stock seleccionado no pertenece al geriátrico');
                    }
                    
                    // Validar consistencia si es origen paciente
                    if ($this->origen_pago === 'paciente' && $stockItem->paciente_propietario_id != $this->paciente_id) {
                        $validator->errors()->add('stock_item_id', 'El item de stock seleccionado no pertenece al paciente asignado');
                    }
                }
            }
        });
    }
}
