<?php

namespace Database\Factories;

use App\Models\Paciente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Paciente>
 */
class PacienteFactory extends Factory
{
    protected $model = Paciente::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->firstName(),
            'apellido' => $this->faker->lastName(),
            'dni' => $this->faker->unique()->numerify('########'),
            'fecha_nacimiento' => $this->faker->dateTimeBetween('-95 years', '-60 years')->format('Y-m-d'),
            'habitacion_id' => null,
            'cama_id' => null,
            'contacto_emergencia' => null,
            'medico_cabecera' => $this->faker->name(),
            'estado' => 'activo',
        ];
    }
}
