<?php

namespace App\Observers;

use App\Models\Medicacion;
use App\Models\StockItem;
use Illuminate\Support\Facades\Log;

class MedicacionObserver
{
    /**
     * Handle the Medicacion "created" event.
     */
    public function created(Medicacion $medicacion): void
    {
        // Si tiene origen de pago que requiere stock, verificar
        if (in_array($medicacion->origen_pago, ['geriatrico', 'paciente'])) {
            
            // Si no tiene stock_item_id, intentar encontrar uno automáticamente
            if (!$medicacion->stock_item_id) {
                $this->autoVincularStock($medicacion);
            }
            
            // Verificar si existe el stock item
            if ($medicacion->stock_item_id) {
                $stockItem = StockItem::find($medicacion->stock_item_id);
                
                if (!$stockItem) {
                    Log::warning("Medicación creada sin stock item válido", [
                        'medicacion_id' => $medicacion->id,
                        'medicacion' => $medicacion->nombre,
                        'paciente_id' => $medicacion->paciente_id,
                        'origen_pago' => $medicacion->origen_pago
                    ]);
                } elseif ($stockItem->stock_actual <= 0) {
                    Log::warning("Medicación vinculada a stock item sin stock", [
                        'medicacion_id' => $medicacion->id,
                        'stock_item' => $stockItem->nombre,
                        'stock_actual' => $stockItem->stock_actual
                    ]);
                }
            } else {
                Log::info("Medicación creada sin vincular a stock", [
                    'medicacion_id' => $medicacion->id,
                    'medicacion' => $medicacion->nombre,
                    'origen_pago' => $medicacion->origen_pago,
                    'sugerencia' => 'Crear stock item para este medicamento'
                ]);
            }
        }
    }

    /**
     * Intenta vincular automáticamente con un stock item existente o crea uno nuevo
     */
    private function autoVincularStock(Medicacion $medicacion): void
    {
        // 1. Buscar si ya existe un stock item compatible
        $query = StockItem::where('activo', true)
            ->where('nombre', 'LIKE', '%' . $medicacion->nombre . '%');
        
        if ($medicacion->origen_pago === 'geriatrico') {
            $query->where('propiedad', 'geriatrico');
        } elseif ($medicacion->origen_pago === 'paciente') {
            $query->where('propiedad', 'paciente')
                  ->where('paciente_propietario_id', $medicacion->paciente_id);
        } else {
            // Si es obra social, no hacemos nada (no maneja stock)
            return;
        }
        
        $stockItem = $query->first();
        
        // 2. Si existe, vinculamos
        if ($stockItem) {
            $medicacion->stock_item_id = $stockItem->id;
            $medicacion->saveQuietly();
            
            Log::info("Stock vinculado automáticamente", [
                'medicacion_id' => $medicacion->id,
                'stock_item_id' => $stockItem->id
            ]);
            return;
        }

        // 3. Si NO existe y es de PACIENTE, lo creamos automáticamente (Premium Feature)
        if ($medicacion->origen_pago === 'paciente') {
            $nuevoStock = StockItem::create([
                'nombre' => $medicacion->nombre . ' (' . $medicacion->dosis . ')',
                'tipo' => 'medicamento',
                'propiedad' => 'paciente',
                'paciente_propietario_id' => $medicacion->paciente_id,
                'stock_actual' => 0, // Se crea en 0, luego ingresan la caja
                'stock_minimo' => 5,
                'descripcion' => 'Creado automáticamente desde prescripción',
                'activo' => true
            ]);

            $medicacion->stock_item_id = $nuevoStock->id;
            $medicacion->saveQuietly();

            Log::info("Stock de paciente creado automáticamente", [
                'medicacion_id' => $medicacion->id,
                'nuevo_stock_id' => $nuevoStock->id,
                'paciente' => $medicacion->paciente_id
            ]);
        }
    }

    /**
     * Handle the Medicacion "updated" event.
     */
    public function updated(Medicacion $medicacion): void
    {
        // Si cambió el origen de pago, revisar consistencia
        if ($medicacion->isDirty('origen_pago') && $medicacion->stock_item_id) {
            $stockItem = StockItem::find($medicacion->stock_item_id);
            
            if ($stockItem) {
                $esConsistente = true;
                
                if ($medicacion->origen_pago === 'geriatrico' && $stockItem->propiedad !== 'geriatrico') {
                    $esConsistente = false;
                }
                
                if ($medicacion->origen_pago === 'paciente' && 
                    ($stockItem->propiedad !== 'paciente' || $stockItem->paciente_propietario_id != $medicacion->paciente_id)) {
                    $esConsistente = false;
                }
                
                if (!$esConsistente) {
                    Log::warning("Inconsistencia detectada al actualizar medicación", [
                        'medicacion_id' => $medicacion->id,
                        'nuevo_origen_pago' => $medicacion->origen_pago,
                        'stock_propiedad' => $stockItem->propiedad,
                        'accion_recomendada' => 'Revisar y corregir vinculación'
                    ]);
                }
            }
        }
    }
}
