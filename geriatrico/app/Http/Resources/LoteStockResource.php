<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoteStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stock_item_id' => $this->stock_item_id,
            'numero_lote' => $this->numero_lote,
            'fecha_vencimiento' => $this->fecha_vencimiento?->toDateString(),
            'fecha_ingreso' => $this->fecha_ingreso?->toDateString(),
            'cantidad_inicial' => (int) $this->cantidad_inicial,
            'cantidad_actual' => (int) $this->cantidad_actual,
            'precio_compra' => $this->precio_compra !== null ? (float) $this->precio_compra : null,
            'proveedor_factura' => $this->proveedor_factura,
            'estado' => $this->estado,
            'observaciones' => $this->observaciones,
            'stock_item' => new StockItemResource($this->whenLoaded('stockItem')),
            'created_at' => $this->created_at,
        ];
    }
}
