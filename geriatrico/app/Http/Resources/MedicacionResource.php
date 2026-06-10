<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'dosis' => $this->dosis,
            'frecuencia' => $this->frecuencia,
            'tipo' => $this->tipo,
            'cantidad_mensual' => $this->cantidad_mensual,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'origen_pago' => $this->origen_pago,
            'observaciones' => $this->observaciones,
            'paciente_id' => $this->paciente_id,
            'stock_item_id' => $this->stock_item_id,
            'paciente' => new PacienteResource($this->whenLoaded('paciente')),
            'stock_item' => new StockItemResource($this->whenLoaded('stockItem')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
