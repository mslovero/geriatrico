<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PacienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'nombre_completo' => "{$this->nombre} {$this->apellido}",
            'dni' => $this->dni,
            'fecha_nacimiento' => $this->fecha_nacimiento?->toDateString(),
            'habitacion_id' => $this->habitacion_id,
            'cama_id' => $this->cama_id,
            'contacto_emergencia' => $this->contacto_emergencia,
            'medico_cabecera' => $this->medico_cabecera,
            'patologias' => $this->patologias,
            'estado' => $this->estado,
            'habitacion' => $this->whenLoaded('habitacion'),
            'cama' => $this->whenLoaded('cama'),
            'historial_medico' => $this->whenLoaded('historial_medico'),
            'medicaciones' => MedicacionResource::collection($this->whenLoaded('medicaciones')),
            'archivos' => $this->whenLoaded('archivos'),
            'signos_vitales' => $this->whenLoaded('signosVitales'),
            'dietas' => $this->whenLoaded('dietas'),
            'incidencias' => $this->whenLoaded('incidencias'),
            'turnos_medicos' => $this->whenLoaded('turnosMedicos'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
