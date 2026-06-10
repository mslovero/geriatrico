<?php

namespace Database\Factories;

use App\Models\Cama;
use App\Models\Habitacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cama>
 */
class CamaFactory extends Factory
{
    protected $model = Cama::class;

    public function definition(): array
    {
        return [
            'habitacion_id' => Habitacion::factory(),
            'numero_cama' => $this->faker->numerify('C##'),
            'estado' => 'libre',
        ];
    }
}
