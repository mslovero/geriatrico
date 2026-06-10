<?php

namespace Database\Factories;

use App\Models\HistorialMedico;
use App\Models\Paciente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HistorialMedico>
 */
class HistorialMedicoFactory extends Factory
{
    protected $model = HistorialMedico::class;

    public function definition(): array
    {
        return [
            'paciente_id' => Paciente::factory(),
            'fecha' => now()->subDays($this->faker->numberBetween(0, 365))->toDateString(),
            'observacion' => $this->faker->paragraph(),
            'medico_responsable' => 'Dr. ' . $this->faker->lastName(),
        ];
    }
}
