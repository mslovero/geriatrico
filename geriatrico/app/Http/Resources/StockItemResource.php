<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'tipo' => $this->tipo,
            'codigo' => $this->codigo,
            'descripcion' => $this->descripcion,
            'unidad_medida' => $this->unidad_medida,
            'unidad_presentacion' => $this->unidad_presentacion,
            'factor_conversion' => $this->factor_conversion,
            'stock_actual' => (int) $this->stock_actual,
            'stock_minimo' => (int) $this->stock_minimo,
            'stock_maximo' => $this->stock_maximo,
            'precio_unitario' => $this->precio_unitario !== null ? (float) $this->precio_unitario : null,
            'propiedad' => $this->propiedad,
            'paciente_propietario_id' => $this->paciente_propietario_id,
            'punto_reorden' => $this->punto_reorden,
            'ubicacion_almacen' => $this->ubicacion_almacen,
            'requiere_receta' => (bool) $this->requiere_receta,
            'temperatura_almacenamiento' => $this->temperatura_almacenamiento,
            'activo' => (bool) $this->activo,
            'bajo_stock' => $this->resource->isBajoStock(),
            'proveedor' => $this->whenLoaded('proveedor'),
            'paciente_propietario' => new PacienteResource($this->whenLoaded('pacientePropietario')),
            'lotes' => LoteStockResource::collection($this->whenLoaded('lotes')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
