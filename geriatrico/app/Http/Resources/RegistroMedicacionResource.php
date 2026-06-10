<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistroMedicacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medicacion_id' => $this->medicacion_id,
            'user_id' => $this->user_id,
            'fecha_hora' => $this->fecha_hora,
            'estado' => $this->estado,
            'observaciones' => $this->observaciones,
            'lote_stock_id' => $this->lote_stock_id,
            'cantidad_administrada' => (int) $this->cantidad_administrada,
            'costo_unitario' => $this->costo_unitario !== null ? (float) $this->costo_unitario : null,
            'medicacion' => new MedicacionResource($this->whenLoaded('medicacion')),
            'user' => new UserResource($this->whenLoaded('user')),
            'lote_stock' => new LoteStockResource($this->whenLoaded('loteStock')),
            'created_at' => $this->created_at,
        ];
    }
}
