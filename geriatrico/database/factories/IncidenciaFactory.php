<?php

namespace Database\Factories;

use App\Models\Incidencia;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Incidencia>
 */
class IncidenciaFactory extends Factory
{
    protected $model = Incidencia::class;

    public function definition(): array
    {
        return [
            'paciente_id' => Paciente::factory(),
            'user_id' => User::factory(),
            'fecha_hora' => now()->subHours($this->faker->numberBetween(0, 72)),
            'tipo' => $this->faker->randomElement(['Caída', 'Médico', 'Conducta', 'Otro']),
            'severidad' => $this->faker->randomElement(['leve', 'moderada', 'grave', 'critica']),
            'descripcion' => $this->faker->sentence(12),
            'acciones_tomadas' => null,
        ];
    }
}
