<?php

namespace Database\Factories;

use App\Models\Habitacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Habitacion>
 */
class HabitacionFactory extends Factory
{
    protected $model = Habitacion::class;

    public function definition(): array
    {
        return [
            'numero' => $this->faker->unique()->numerify('H###'),
            'capacidad' => $this->faker->numberBetween(1, 4),
        ];
    }
}
