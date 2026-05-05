<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoteStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_item_id' => 'required|exists:stock_items,id',
            'numero_lote' => 'required|string|max:100',
            'fecha_vencimiento' => 'required|date|after:today',
            'cantidad_inicial' => 'required|numeric|min:0.01',
            'tipo_cantidad' => 'nullable|in:base,presentacion',
            'precio_compra' => 'nullable|numeric|min:0',
            'proveedor_factura' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'stock_item_id.required' => 'El medicamento o insumo es obligatorio',
            'stock_item_id.exists' => 'El item seleccionado no existe en el catálogo',
            'numero_lote.required' => 'El número de lote es obligatorio para la trazabilidad',
            'fecha_vencimiento.required' => 'La fecha de vencimiento es obligatoria',
            'fecha_vencimiento.after' => 'No se pueden cargar lotes ya vencidos',
            'cantidad_inicial.required' => 'La cantidad inicial es obligatoria',
            'cantidad_inicial.min' => 'La cantidad debe ser mayor a cero',
        ];
    }
}
