<?php

namespace Database\Factories;

use App\Models\MovimientoStock;
use App\Models\StockItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MovimientoStock>
 */
class MovimientoStockFactory extends Factory
{
    protected $model = MovimientoStock::class;

    public function definition(): array
    {
        return [
            'stock_item_id' => StockItem::factory(),
            'tipo_movimiento' => 'salida',
            'cantidad' => 1,
            'stock_anterior' => 10,
            'stock_nuevo' => 9,
            'motivo' => 'administracion_paciente',
            'paciente_id' => null,
            'user_id' => null,
            'precio_total' => 100.00,
        ];
    }
}
