<?php

namespace Database\Factories;

use App\Models\Paciente;
use App\Models\StockItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockItem>
 */
class StockItemFactory extends Factory
{
    protected $model = StockItem::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->words(2, true),
            'tipo' => 'medicamento',
            'codigo' => $this->faker->unique()->bothify('SKU-####'),
            'unidad_medida' => 'unidad',
            'stock_actual' => $this->faker->numberBetween(10, 200),
            'stock_minimo' => 5,
            'precio_unitario' => $this->faker->randomFloat(2, 10, 500),
            'propiedad' => 'geriatrico',
            'paciente_propietario_id' => null,
            'activo' => true,
        ];
    }

    public function delGeriatrico(): static
    {
        return $this->state(fn () => [
            'propiedad' => 'geriatrico',
            'paciente_propietario_id' => null,
        ]);
    }

    public function delPaciente(Paciente|int $paciente): static
    {
        $id = $paciente instanceof Paciente ? $paciente->id : $paciente;

        return $this->state(fn () => [
            'propiedad' => 'paciente',
            'paciente_propietario_id' => $id,
        ]);
    }
}
