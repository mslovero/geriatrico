<?php

namespace Database\Factories;

use App\Models\Dieta;
use App\Models\Paciente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dieta>
 */
class DietaFactory extends Factory
{
    protected $model = Dieta::class;

    public function definition(): array
    {
        return [
            'paciente_id' => Paciente::factory(),
            'tipo' => $this->faker->randomElement(['General', 'Diabética', 'Hiposódica']),
            'consistencia' => $this->faker->randomElement(['Sólida', 'Blanda', 'Procesada']),
            'alergias' => null,
            'observaciones' => null,
        ];
    }
}
