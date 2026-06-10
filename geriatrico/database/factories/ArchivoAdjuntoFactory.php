<?php

namespace Database\Factories;

use App\Models\ArchivoAdjunto;
use App\Models\Paciente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ArchivoAdjunto>
 */
class ArchivoAdjuntoFactory extends Factory
{
    protected $model = ArchivoAdjunto::class;

    public function definition(): array
    {
        return [
            'paciente_id' => Paciente::factory(),
            'historial_medico_id' => null,
            'tipo' => $this->faker->randomElement(['estudio', 'receta', 'documento']),
            'ruta_archivo' => 'adjuntos/' . $this->faker->uuid() . '.pdf',
        ];
    }
}
