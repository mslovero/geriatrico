<?php

namespace Database\Factories;

use App\Models\Paciente;
use App\Models\SignoVital;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SignoVital>
 */
class SignoVitalFactory extends Factory
{
    protected $model = SignoVital::class;

    public function definition(): array
    {
        return [
            'paciente_id' => Paciente::factory(),
            'fecha' => now()->subHours($this->faker->numberBetween(0, 48)),
            'presion_arterial' => $this->faker->numberBetween(100, 140) . '/' . $this->faker->numberBetween(60, 90),
            'temperatura' => $this->faker->randomFloat(1, 36, 37.5),
            'frecuencia_cardiaca' => $this->faker->numberBetween(60, 100),
            'saturacion_oxigeno' => $this->faker->numberBetween(95, 100),
            'glucosa' => $this->faker->numberBetween(80, 130),
            'observaciones' => null,
            'registrado_por' => 'Sistema',
        ];
    }
}
