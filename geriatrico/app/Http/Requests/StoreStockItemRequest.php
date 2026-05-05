<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // TODO: Implementar autorización basada en roles cuando se creen las Policies
        // Por ahora, permitimos si está autenticado (ya protegido por middleware)
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|in:medicamento,insumo',
            'unidad_medida' => 'required|string',
            'stock_actual' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'stock_maximo' => 'nullable|integer|min:0',
            'fecha_vencimiento_inicial' => 'nullable|date|after:today',
            'unidad_presentacion' => 'nullable|string|max:50',
            'factor_conversion' => 'nullable|integer|min:2',
            'descripcion_presentacion' => 'nullable|string|max:255',
            'propiedad' => 'required|in:geriatrico,paciente',
            'paciente_propietario_id' => 'nullable|exists:pacientes,id',
            'precio_unitario' => 'nullable|numeric|min:0',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'codigo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'punto_reorden' => 'nullable|integer|min:0',
            'ubicacion_almacen' => 'nullable|string|max:100',
            'codigo_barras' => 'nullable|string|max:100',
            'requiere_receta' => 'nullable|boolean',
            'temperatura_almacenamiento' => 'nullable|string|max:100',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del item es obligatorio',
            'tipo.required' => 'Debe especificar si es medicamento o insumo',
            'tipo.in' => 'El tipo debe ser medicamento o insumo',
            'unidad_medida.required' => 'La unidad de medida es obligatoria',
            'stock_actual.required' => 'El stock actual es obligatorio',
            'stock_actual.min' => 'El stock actual no puede ser negativo',
            'stock_minimo.required' => 'El stock mínimo es obligatorio',
            'propiedad.required' => 'Debe especificar si pertenece al geriátrico o a un paciente',
            'propiedad.in' => 'La propiedad debe ser geriatrico o paciente',
            'paciente_propietario_id.exists' => 'El paciente seleccionado no existe',
            'proveedor_id.exists' => 'El proveedor seleccionado no existe',
            'fecha_vencimiento_inicial.after' => 'La fecha de vencimiento debe ser posterior a hoy',
            'factor_conversion.min' => 'El factor de conversión debe ser al menos 2',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validar que si tiene unidad_presentacion, debe tener factor_conversion
            if ($this->filled('unidad_presentacion') && !$this->filled('factor_conversion')) {
                $validator->errors()->add(
                    'factor_conversion',
                    'Si especifica unidad de presentación, debe proporcionar un factor de conversión'
                );
            }

            // Validar consistencia de propiedad y paciente propietario
            if ($this->propiedad === 'paciente' && !$this->filled('paciente_propietario_id')) {
                $validator->errors()->add(
                    'paciente_propietario_id',
                    'Los items con propiedad "paciente" deben tener un paciente propietario asignado'
                );
            }

            if ($this->propiedad === 'geriatrico' && $this->filled('paciente_propietario_id')) {
                $validator->errors()->add(
                    'paciente_propietario_id',
                    'Los items con propiedad "geriátrico" no deben tener paciente propietario'
                );
            }

            // Validar que stock_maximo sea mayor que stock_minimo
            if ($this->filled('stock_maximo') && $this->filled('stock_minimo')) {
                if ($this->stock_maximo < $this->stock_minimo) {
                    $validator->errors()->add(
                        'stock_maximo',
                        'El stock máximo debe ser mayor o igual al stock mínimo'
                    );
                }
            }
        });
    }
}
