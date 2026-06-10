<?php

namespace App\Services;

use App\Exceptions\LoteNoDisponibleException;
use App\Exceptions\MedicacionSinStockVinculadoException;
use App\Exceptions\StockItemNoExisteException;
use App\Exceptions\StockPropietarioMismatchException;
use App\Models\LoteStock;
use App\Models\Medicacion;
use App\Models\MovimientoStock;
use App\Models\RegistroMedicacion;
use App\Models\StockItem;
use Illuminate\Support\Facades\DB;

class RegistroMedicacionService
{
    public function registrarAdministracion(array $data): RegistroMedicacion
    {
        return DB::transaction(function () use ($data) {
            $medicacion = Medicacion::findOrFail($data['medicacion_id']);

            if ($this->requiereStock($medicacion, $data['estado'])) {
                $stockItem = $this->resolverStockItem($medicacion);
                $this->validarConsistenciaPropiedad($medicacion, $stockItem);

                $cantidad = (int) ($data['cantidad_administrada'] ?? 1);
                $lote = $this->seleccionarLoteFifo($stockItem, $cantidad);

                $lote->descontar($cantidad);
                $stockItem->refresh();
                $stockAnterior = (int) $stockItem->stock_actual;
                $stockItem->recalcularStock();

                MovimientoStock::create([
                    'stock_item_id' => $stockItem->id,
                    'lote_stock_id' => $lote->id,
                    'tipo_movimiento' => 'salida',
                    'cantidad' => $cantidad,
                    'stock_anterior' => $stockAnterior,
                    'stock_nuevo' => (int) $stockItem->stock_actual,
                    'motivo' => 'administracion_paciente',
                    'paciente_id' => $medicacion->paciente_id,
                    'user_id' => $data['user_id'] ?? null,
                    'observaciones' => "Administración desde lote {$lote->numero_lote}",
                    'precio_total' => (float) ($lote->precio_compra ?? 0) * $cantidad,
                ]);

                $data['lote_stock_id'] = $lote->id;
                $data['cantidad_administrada'] = $cantidad;
                $data['costo_unitario'] = $lote->precio_compra;
            }

            return RegistroMedicacion::create($data);
        });
    }

    public function aplicarAdministracion(RegistroMedicacion $registro, array $data): RegistroMedicacion
    {
        return DB::transaction(function () use ($registro, $data) {
            $cambiaAAdministrado = isset($data['estado'])
                && $data['estado'] === 'administrado'
                && $registro->estado !== 'administrado';

            if ($cambiaAAdministrado) {
                $medicacion = $registro->medicacion;

                if ($this->requiereStock($medicacion, 'administrado')) {
                    $stockItem = $this->resolverStockItem($medicacion);
                    $this->validarConsistenciaPropiedad($medicacion, $stockItem);

                    $cantidad = (int) ($data['cantidad_administrada'] ?? 1);
                    $lote = $this->seleccionarLoteFifo($stockItem, $cantidad);

                    $lote->descontar($cantidad);
                    $stockItem->refresh();
                    $stockAnterior = (int) $stockItem->stock_actual;
                    $stockItem->recalcularStock();

                    MovimientoStock::create([
                        'stock_item_id' => $stockItem->id,
                        'lote_stock_id' => $lote->id,
                        'tipo_movimiento' => 'salida',
                        'cantidad' => $cantidad,
                        'stock_anterior' => $stockAnterior,
                        'stock_nuevo' => (int) $stockItem->stock_actual,
                        'motivo' => 'administracion_paciente_update',
                        'paciente_id' => $medicacion->paciente_id,
                        'user_id' => auth()->id(),
                        'observaciones' => "Actualización a administrado desde lote {$lote->numero_lote}",
                        'precio_total' => (float) ($lote->precio_compra ?? 0) * $cantidad,
                    ]);

                    $data['lote_stock_id'] = $lote->id;
                    $data['cantidad_administrada'] = $cantidad;
                    $data['costo_unitario'] = $lote->precio_compra;
                }
            }

            $registro->update($data);

            return $registro->fresh();
        });
    }

    private function requiereStock(Medicacion $medicacion, string $estado): bool
    {
        return $estado === 'administrado' && $medicacion->origen_pago !== 'obra_social';
    }

    private function resolverStockItem(Medicacion $medicacion): StockItem
    {
        if (! $medicacion->stock_item_id) {
            throw new MedicacionSinStockVinculadoException();
        }

        $stockItem = StockItem::find($medicacion->stock_item_id);

        if (! $stockItem) {
            throw new StockItemNoExisteException();
        }

        return $stockItem;
    }

    private function validarConsistenciaPropiedad(Medicacion $medicacion, StockItem $stockItem): void
    {
        if ($medicacion->origen_pago === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
            throw StockPropietarioMismatchException::noEsDelGeriatrico($stockItem->nombre);
        }

        if ($medicacion->origen_pago === 'paciente') {
            $perteneceAlPaciente = $stockItem->propiedad === 'paciente'
                && (int) $stockItem->paciente_propietario_id === (int) $medicacion->paciente_id;

            if (! $perteneceAlPaciente) {
                throw StockPropietarioMismatchException::noEsDelPaciente($stockItem->nombre);
            }
        }
    }

    private function seleccionarLoteFifo(StockItem $stockItem, int $cantidad): LoteStock
    {
        $lote = LoteStock::where('stock_item_id', $stockItem->id)
            ->where('estado', 'activo')
            ->where('cantidad_actual', '>=', $cantidad)
            ->whereDate('fecha_vencimiento', '>=', now())
            ->orderBy('fecha_vencimiento')
            ->lockForUpdate()
            ->first();

        if (! $lote) {
            throw new LoteNoDisponibleException();
        }

        return $lote;
    }
}
