<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimientoStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stock_item_id' => $this->stock_item_id,
            'lote_stock_id' => $this->lote_stock_id,
            'tipo_movimiento' => $this->tipo_movimiento,
            'cantidad' => (int) $this->cantidad,
            'stock_anterior' => (int) $this->stock_anterior,
            'stock_nuevo' => (int) $this->stock_nuevo,
            'motivo' => $this->motivo,
            'precio_total' => $this->precio_total !== null ? (float) $this->precio_total : null,
            'observaciones' => $this->observaciones,
            'paciente_id' => $this->paciente_id,
            'user_id' => $this->user_id,
            'stock_item' => new StockItemResource($this->whenLoaded('stockItem')),
            'lote_stock' => new LoteStockResource($this->whenLoaded('loteStock')),
            'paciente' => new PacienteResource($this->whenLoaded('paciente')),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
