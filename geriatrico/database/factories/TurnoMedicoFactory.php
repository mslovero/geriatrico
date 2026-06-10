<?php

namespace Database\Factories;

use App\Models\Paciente;
use App\Models\TurnoMedico;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TurnoMedico>
 */
class TurnoMedicoFactory extends Factory
{
    protected $model = TurnoMedico::class;

    public function definition(): array
    {
        return [
            'paciente_id' => Paciente::factory(),
            'profesional' => 'Dr. ' . $this->faker->lastName(),
            'especialidad' => $this->faker->randomElement(['Cardiología', 'Clínica', 'Traumatología']),
            'fecha_hora' => now()->addDays($this->faker->numberBetween(1, 30)),
            'lugar' => 'Consultorio externo',
            'estado' => 'pendiente',
            'observaciones' => null,
        ];
    }
}
