<?php

namespace App\Services;

use App\Exceptions\StockPropietarioMismatchException;
use App\Models\Medicacion;
use App\Models\StockItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MedicacionService
{
    /**
     * @return Collection<int, Medicacion>
     */
    public function createBatch(int $pacienteId, array $medicamentos): Collection
    {
        return DB::transaction(function () use ($pacienteId, $medicamentos) {
            $creadas = collect();

            foreach ($medicamentos as $medData) {
                $this->validarConsistenciaStock($medData, $pacienteId);

                $medData['paciente_id'] = $pacienteId;
                $creadas->push(Medicacion::create($medData));
            }

            return $creadas;
        });
    }

    private function validarConsistenciaStock(array $medData, int $pacienteId): void
    {
        $stockItemId = $medData['stock_item_id'] ?? null;

        if (! $stockItemId) {
            return;
        }

        $stockItem = StockItem::find($stockItemId);

        if (! $stockItem) {
            return;
        }

        $origen = $medData['origen_pago'];

        if ($origen === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
            throw StockPropietarioMismatchException::noEsDelGeriatrico($stockItem->nombre);
        }

        if ($origen === 'paciente' && (int) $stockItem->paciente_propietario_id !== $pacienteId) {
            throw StockPropietarioMismatchException::noEsDelPaciente($stockItem->nombre);
        }
    }
}
