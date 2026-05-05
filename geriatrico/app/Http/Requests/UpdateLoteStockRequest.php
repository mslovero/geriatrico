<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLoteStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'numero_lote' => 'sometimes|required|string|max:100',
            'fecha_vencimiento' => 'sometimes|required|date',
            'cantidad_actual' => 'sometimes|required|numeric|min:0',
            'precio_compra' => 'nullable|numeric|min:0',
            'proveedor_factura' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
            'estado' => 'sometimes|required|in:activo,vencido,agotado',
        ];
    }
}
