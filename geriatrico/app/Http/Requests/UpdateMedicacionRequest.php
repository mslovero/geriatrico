<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|required|string|max:255',
            'paciente_id' => 'sometimes|required|exists:pacientes,id',
            'tipo' => 'nullable|in:diaria,sos',
            'dosis' => 'nullable|string|max:255',
            'frecuencia' => 'nullable|string|max:255',
            'cantidad_mensual' => 'nullable|integer|min:0',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'origen_pago' => 'sometimes|required|in:obra_social,geriatrico,paciente',
            'stock_item_id' => 'nullable|exists:stock_items,id',
            'observaciones' => 'nullable|string',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $medicacion = \App\Models\Medicacion::find($this->route('id') ?? $this->route('medicacion'));
            
            if (!$medicacion) return;

            $origenPago = $this->origen_pago ?? $medicacion->origen_pago;
            $stockItemId = $this->stock_item_id ?? $medicacion->stock_item_id;
            $pacienteId = $this->paciente_id ?? $medicacion->paciente_id;

            if ($stockItemId) {
                $stockItem = \App\Models\StockItem::find($stockItemId);
                
                if ($stockItem) {
                    if ($origenPago === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
                        $validator->errors()->add('stock_item_id', 'El item de stock seleccionado no pertenece al geriátrico');
                    }
                    
                    if ($origenPago === 'paciente' && $stockItem->paciente_propietario_id != $pacienteId) {
                        $validator->errors()->add('stock_item_id', 'El item de stock seleccionado no pertenece al paciente asignado');
                    }
                }
            }
        });
    }
}
