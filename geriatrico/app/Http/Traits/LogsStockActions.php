<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Log;

trait LogsStockActions
{
    /**
     * Registrar una acción de stock en el log de auditoría
     */
    protected function logStockAction(string $action, array $data = [])
    {
        $user = request()->user();

        $logData = [
            'timestamp' => now()->toDateTimeString(),
            'action' => $action,
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : 'System',
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data' => $data,
        ];

        Log::channel('stock_audit')->info($action, $logData);
    }

    /**
     * Registrar creación de item de stock
     */
    protected function logStockItemCreated($stockItem)
    {
        $this->logStockAction('stock_item_created', [
            'stock_item_id' => $stockItem->id,
            'nombre' => $stockItem->nombre,
            'tipo' => $stockItem->tipo,
            'stock_inicial' => $stockItem->stock_actual,
            'propiedad' => $stockItem->propiedad,
            'paciente_propietario_id' => $stockItem->paciente_propietario_id,
        ]);
    }

    /**
     * Registrar actualización de item de stock
     */
    protected function logStockItemUpdated($stockItem, array $changes)
    {
        $this->logStockAction('stock_item_updated', [
            'stock_item_id' => $stockItem->id,
            'nombre' => $stockItem->nombre,
            'changes' => $changes,
        ]);
    }

    /**
     * Registrar eliminación de item de stock
     */
    protected function logStockItemDeleted($stockItem)
    {
        $this->logStockAction('stock_item_deleted', [
            'stock_item_id' => $stockItem->id,
            'nombre' => $stockItem->nombre,
            'stock_actual' => $stockItem->stock_actual,
        ]);
    }

    /**
     * Registrar creación de lote
     */
    protected function logLoteCreated($lote)
    {
        $this->logStockAction('lote_created', [
            'lote_id' => $lote->id,
            'stock_item_id' => $lote->stock_item_id,
            'numero_lote' => $lote->numero_lote,
            'cantidad_inicial' => $lote->cantidad_inicial,
            'fecha_vencimiento' => $lote->fecha_vencimiento,
            'precio_compra' => $lote->precio_compra,
        ]);
    }

    /**
     * Registrar descuento de lote
     */
    protected function logLoteDescontado($lote, int $cantidad, string $motivo)
    {
        $this->logStockAction('lote_descontado', [
            'lote_id' => $lote->id,
            'numero_lote' => $lote->numero_lote,
            'cantidad_descontada' => $cantidad,
            'cantidad_anterior' => $lote->cantidad_actual + $cantidad,
            'cantidad_nueva' => $lote->cantidad_actual,
            'motivo' => $motivo,
        ]);
    }

    /**
     * Registrar administración de medicación
     */
    protected function logMedicacionAdministrada($medicacion, $registro, $lote = null)
    {
        $this->logStockAction('medicacion_administrada', [
            'medicacion_id' => $medicacion->id,
            'medicacion_nombre' => $medicacion->nombre,
            'paciente_id' => $medicacion->paciente_id,
            'registro_id' => $registro->id,
            'lote_id' => $lote ? $lote->id : null,
            'lote_numero' => $lote ? $lote->numero_lote : null,
            'cantidad_administrada' => $registro->cantidad_administrada ?? 1,
            'origen_pago' => $medicacion->origen_pago,
        ]);
    }

    /**
     * Registrar intento de administración fallido
     */
    protected function logMedicacionAdministracionFallida($medicacion, string $error)
    {
        Log::channel('security')->warning('medicacion_administracion_fallida', [
            'timestamp' => now()->toDateTimeString(),
            'medicacion_id' => $medicacion->id,
            'medicacion_nombre' => $medicacion->nombre,
            'paciente_id' => $medicacion->paciente_id,
            'error' => $error,
            'user_id' => request()->user()?->id,
            'ip' => request()->ip(),
        ]);
    }

    /**
     * Registrar cambio de propiedad (crítico)
     */
    protected function logPropiedadChanged($model, string $oldPropiedad, string $newPropiedad)
    {
        Log::channel('security')->warning('propiedad_changed', [
            'timestamp' => now()->toDateTimeString(),
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'model_name' => $model->nombre ?? 'N/A',
            'old_propiedad' => $oldPropiedad,
            'new_propiedad' => $newPropiedad,
            'user_id' => request()->user()?->id,
            'user_name' => request()->user()?->name,
            'ip' => request()->ip(),
        ]);
    }
}
