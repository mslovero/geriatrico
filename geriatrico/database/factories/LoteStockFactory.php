<?php

namespace Database\Factories;

use App\Models\LoteStock;
use App\Models\StockItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoteStock>
 */
class LoteStockFactory extends Factory
{
    protected $model = LoteStock::class;

    public function definition(): array
    {
        $cantidad = $this->faker->numberBetween(20, 200);

        return [
            'stock_item_id' => StockItem::factory(),
            'numero_lote' => strtoupper($this->faker->bothify('LOT-####')),
            'fecha_vencimiento' => now()->addMonths($this->faker->numberBetween(3, 24))->toDateString(),
            'fecha_ingreso' => now()->toDateString(),
            'cantidad_inicial' => $cantidad,
            'cantidad_actual' => $cantidad,
            'precio_compra' => $this->faker->randomFloat(2, 50, 500),
            'estado' => 'activo',
        ];
    }

    public function venceEn(int $dias): static
    {
        return $this->state(fn () => [
            'fecha_vencimiento' => now()->addDays($dias)->toDateString(),
        ]);
    }

    public function vencido(): static
    {
        return $this->state(fn () => [
            'fecha_vencimiento' => now()->subDays(1)->toDateString(),
            'estado' => 'vencido',
        ]);
    }

    public function agotado(): static
    {
        return $this->state(fn () => [
            'cantidad_actual' => 0,
            'estado' => 'agotado',
        ]);
    }

    public function conCantidad(int $cantidad): static
    {
        return $this->state(fn () => [
            'cantidad_inicial' => $cantidad,
            'cantidad_actual' => $cantidad,
        ]);
    }
}
