<?php

namespace Database\Factories;

use App\Models\Medicacion;
use App\Models\Paciente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medicacion>
 */
class MedicacionFactory extends Factory
{
    protected $model = Medicacion::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->word(),
            'dosis' => '1 comprimido',
            'frecuencia' => 'cada 8 horas',
            'paciente_id' => Paciente::factory(),
            'tipo' => 'diaria',
            'origen_pago' => 'geriatrico',
            'stock_item_id' => null,
        ];
    }
}
