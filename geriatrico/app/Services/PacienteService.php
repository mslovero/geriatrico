<?php

namespace App\Services;

use App\Models\Cama;
use App\Models\Notification;
use App\Models\Paciente;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PacienteService
{
    public function crear(array $data): Paciente
    {
        return DB::transaction(function () use ($data) {
            $paciente = Paciente::create($data);

            if (! empty($data['cama_id'])) {
                Cama::whereKey($data['cama_id'])->update(['estado' => 'ocupada']);
            }

            $this->notificarIngreso($paciente);

            return $paciente;
        });
    }

    public function actualizar(Paciente $paciente, array $data): Paciente
    {
        return DB::transaction(function () use ($paciente, $data) {
            $camaAnterior = $paciente->cama_id;

            $paciente->update($data);

            if (array_key_exists('cama_id', $data) && $data['cama_id'] !== $camaAnterior) {
                if ($camaAnterior) {
                    Cama::whereKey($camaAnterior)->update(['estado' => 'libre']);
                }
                if ($data['cama_id']) {
                    Cama::whereKey($data['cama_id'])->update(['estado' => 'ocupada']);
                }
            }

            return $paciente;
        });
    }

    private function notificarIngreso(Paciente $paciente): void
    {
        try {
            Notification::create([
                'tipo' => 'paciente_nuevo',
                'titulo' => 'Nuevo Ingreso',
                'mensaje' => "Se ha registrado el paciente {$paciente->nombre} {$paciente->apellido}",
                'enlace' => "/pacientes/{$paciente->id}/ficha",
                'paciente_id' => $paciente->id,
            ]);
        } catch (\Throwable $e) {
            Log::warning('No se pudo crear notificación de nuevo paciente', [
                'paciente_id' => $paciente->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
