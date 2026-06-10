<?php

namespace App\Services;

use App\Exceptions\StockInsuficienteEnItemException;
use App\Models\LoteStock;
use App\Models\MovimientoStock;
use App\Models\StockItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function crearConLoteInicial(array $data, ?int $userId = null): StockItem
    {
        return DB::transaction(function () use ($data, $userId) {
            $fechaVencimientoInicial = $data['fecha_vencimiento_inicial'] ?? null;
            unset($data['fecha_vencimiento_inicial']);

            $stockItem = StockItem::create($data);

            if ((int) $stockItem->stock_actual > 0) {
                $this->crearLoteInicial($stockItem, $fechaVencimientoInicial, $userId);
            }

            return $stockItem->fresh(['proveedor']);
        });
    }

    public function registrarEntrada(StockItem $stockItem, array $data, ?int $userId = null): array
    {
        return DB::transaction(function () use ($stockItem, $data, $userId) {
            $stockItem->refresh();
            $stockAnterior = (int) $stockItem->stock_actual;
            $cantidad = (int) $data['cantidad'];
            $stockNuevo = $stockAnterior + $cantidad;

            $stockItem->update(['stock_actual' => $stockNuevo]);

            $movimiento = MovimientoStock::create([
                'stock_item_id' => $stockItem->id,
                'tipo_movimiento' => 'entrada',
                'cantidad' => $cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'motivo' => $data['motivo'],
                'precio_total' => $data['precio_total'] ?? null,
                'user_id' => $userId,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            return [
                'stockItem' => $stockItem->fresh(),
                'movimiento' => $movimiento->load('user'),
            ];
        });
    }

    public function registrarSalida(StockItem $stockItem, array $data, ?int $userId = null): array
    {
        return DB::transaction(function () use ($stockItem, $data, $userId) {
            $stockItem->refresh();
            $cantidad = (int) $data['cantidad'];

            if ($stockItem->stock_actual < $cantidad) {
                throw new StockInsuficienteEnItemException(
                    (int) $stockItem->stock_actual,
                    $cantidad,
                    $stockItem->nombre,
                );
            }

            $stockAnterior = (int) $stockItem->stock_actual;
            $stockNuevo = $stockAnterior - $cantidad;

            $stockItem->update(['stock_actual' => $stockNuevo]);

            $movimiento = MovimientoStock::create([
                'stock_item_id' => $stockItem->id,
                'tipo_movimiento' => 'salida',
                'cantidad' => $cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'motivo' => $data['motivo'],
                'paciente_id' => $data['paciente_id'] ?? null,
                'user_id' => $userId,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            return [
                'stockItem' => $stockItem->fresh(),
                'movimiento' => $movimiento->load(['user', 'paciente']),
            ];
        });
    }

    public function bajoStock(): Collection
    {
        return StockItem::with('proveedor')
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->get();
    }

    public function proximosVencer(int $diasUmbral = 30): Collection
    {
        return StockItem::with([
                'proveedor',
                'lotes' => fn ($q) => $q
                    ->where('estado', 'activo')
                    ->whereDate('fecha_vencimiento', '<=', now()->addDays($diasUmbral))
                    ->orderBy('fecha_vencimiento'),
            ])
            ->get()
            ->filter(fn (StockItem $item) => $item->lotes->isNotEmpty())
            ->values();
    }

    private function crearLoteInicial(StockItem $stockItem, ?string $fechaVencimiento, ?int $userId): void
    {
        $numeroLote = 'INICIAL-'.date('YmdHis').'-'.$stockItem->id;
        $cantidad = (int) $stockItem->stock_actual;

        $lote = LoteStock::create([
            'stock_item_id' => $stockItem->id,
            'numero_lote' => $numeroLote,
            'fecha_vencimiento' => $fechaVencimiento ?? Carbon::now()->addYears(2)->toDateString(),
            'cantidad_inicial' => $cantidad,
            'cantidad_actual' => $cantidad,
            'fecha_ingreso' => Carbon::now()->toDateString(),
            'estado' => 'activo',
            'precio_compra' => $stockItem->precio_unitario,
            'observaciones' => 'Lote creado automáticamente con stock inicial del item',
        ]);

        MovimientoStock::create([
            'stock_item_id' => $stockItem->id,
            'lote_stock_id' => $lote->id,
            'tipo_movimiento' => 'entrada',
            'cantidad' => $cantidad,
            'stock_anterior' => 0,
            'stock_nuevo' => $cantidad,
            'motivo' => 'stock_inicial_con_lote',
            'user_id' => $userId,
            'observaciones' => "Lote inicial: {$numeroLote}",
        ]);
    }
}
