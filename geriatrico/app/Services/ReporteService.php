<?php

namespace App\Services;

use App\Models\MovimientoStock;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Support\Periodo;
use Illuminate\Support\Collection;

class ReporteService
{
    public function consumoGeriatrico(Periodo $periodo): array
    {
        $movimientos = MovimientoStock::with(['stockItem', 'paciente'])
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', $periodo->rango())
            ->whereHas('stockItem', fn ($q) => $q->where('propiedad', 'geriatrico'))
            ->get();

        return [
            'periodo' => $periodo->toArray(),
            'total_costo' => (float) $movimientos->sum('precio_total'),
            'por_item' => $this->agruparPorItem($movimientos),
            'total_movimientos' => $movimientos->count(),
        ];
    }

    public function consumoPaciente(Paciente $paciente, Periodo $periodo): array
    {
        $movimientos = MovimientoStock::with('stockItem')
            ->where('paciente_id', $paciente->id)
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', $periodo->rango())
            ->get();

        return [
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => "{$paciente->nombre} {$paciente->apellido}",
            ],
            'periodo' => $periodo->toArray(),
            'total_costo' => (float) $movimientos->sum('precio_total'),
            'por_item' => $this->agruparPorItem($movimientos),
            'total_movimientos' => $movimientos->count(),
        ];
    }

    public function costosMensuales(int $anio): array
    {
        $inicio = now()->setDate($anio, 1, 1)->startOfYear();
        $fin = now()->setDate($anio, 12, 31)->endOfYear();

        $movimientos = MovimientoStock::where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', [$inicio, $fin])
            ->get(['precio_total', 'created_at']);

        $porMes = $movimientos
            ->groupBy(fn ($m) => (int) $m->created_at->format('n'))
            ->map(fn (Collection $grupo, int $mes) => [
                'mes' => $mes,
                'nombre_mes' => date('F', mktime(0, 0, 0, $mes, 1)),
                'total_costo' => (float) $grupo->sum('precio_total'),
                'cantidad_movimientos' => $grupo->count(),
            ])
            ->sortBy('mes')
            ->values();

        return [
            'anio' => $anio,
            'total_anual' => (float) $porMes->sum('total_costo'),
            'por_mes' => $porMes,
        ];
    }

    public function stockGeriatrico(): array
    {
        $items = StockItem::with(['proveedor', 'lotes'])
            ->where('propiedad', 'geriatrico')
            ->where('activo', true)
            ->get();

        return [
            'items' => $items,
            'resumen' => [
                'total_items' => $items->count(),
                'valor_total' => $this->valorTotalStock($items),
                'bajo_stock' => $items->filter(fn ($i) => $i->isBajoStock())->count(),
                'proximos_vencer' => $items->filter(fn ($i) => $i->isProximoVencer())->count(),
            ],
        ];
    }

    public function stockPaciente(Paciente $paciente): array
    {
        $items = StockItem::with('lotes')
            ->where('propiedad', 'paciente')
            ->where('paciente_propietario_id', $paciente->id)
            ->where('activo', true)
            ->get();

        return [
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => "{$paciente->nombre} {$paciente->apellido}",
            ],
            'items' => $items,
            'resumen' => [
                'total_items' => $items->count(),
                'valor_total' => $this->valorTotalStock($items),
            ],
        ];
    }

    public function topMedicamentos(Periodo $periodo, int $limite = 10): array
    {
        $top = MovimientoStock::with('stockItem')
            ->where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', $periodo->rango())
            ->get()
            ->groupBy('stock_item_id')
            ->map(function (Collection $grupo) {
                $item = $grupo->first()->stockItem;

                return [
                    'stock_item_id' => $grupo->first()->stock_item_id,
                    'nombre' => $item?->nombre ?? '-',
                    'tipo' => $item?->tipo ?? '-',
                    'cantidad_total' => (int) $grupo->sum('cantidad'),
                    'costo_total' => (float) $grupo->sum('precio_total'),
                    'veces_usado' => $grupo->count(),
                    'unidad_medida' => $item?->unidad_medida ?? 'unidad',
                ];
            })
            ->sortByDesc('cantidad_total')
            ->take($limite)
            ->values();

        return [
            'periodo' => $periodo->toArray(),
            'top_medicamentos' => $top,
        ];
    }

    public function resumenGeneral(): array
    {
        $stockGeriatrico = StockItem::where('propiedad', 'geriatrico')
            ->where('activo', true)
            ->get();

        $stockPacientes = StockItem::where('propiedad', 'paciente')
            ->where('activo', true)
            ->get();

        $periodo = Periodo::delMesActual();

        $costosMesActual = (float) MovimientoStock::where('tipo_movimiento', 'salida')
            ->whereBetween('created_at', $periodo->rango())
            ->sum('precio_total');

        return [
            'stock_geriatrico' => [
                'total_items' => $stockGeriatrico->count(),
                'valor_total' => $this->valorTotalStock($stockGeriatrico),
                'bajo_stock' => $stockGeriatrico->filter(fn ($i) => $i->isBajoStock())->count(),
                'proximos_vencer' => $stockGeriatrico->filter(fn ($i) => $i->isProximoVencer())->count(),
            ],
            'stock_pacientes' => [
                'total_items' => $stockPacientes->count(),
                'valor_total' => $this->valorTotalStock($stockPacientes),
                'pacientes_con_stock' => $stockPacientes->unique('paciente_propietario_id')->count(),
            ],
            'costos_mes_actual' => $costosMesActual,
            'periodo_actual' => [
                'desde' => $periodo->desde->toDateString(),
                'hasta' => $periodo->hasta->toDateString(),
            ],
        ];
    }

    private function agruparPorItem(Collection $movimientos): Collection
    {
        return $movimientos
            ->groupBy('stock_item_id')
            ->map(function (Collection $grupo) {
                $item = $grupo->first()->stockItem;

                return [
                    'stock_item_id' => $item?->id,
                    'nombre' => $item?->nombre,
                    'cantidad_total' => (int) $grupo->sum('cantidad'),
                    'costo_total' => (float) $grupo->sum('precio_total'),
                    'unidad_medida' => $item?->unidad_medida,
                ];
            })
            ->values();
    }

    private function valorTotalStock(Collection $items): float
    {
        return (float) $items->sum(fn ($i) => $i->stock_actual * ($i->precio_unitario ?? 0));
    }
}
