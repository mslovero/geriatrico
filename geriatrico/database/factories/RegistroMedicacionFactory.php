<?php

namespace Database\Factories;

use App\Models\Medicacion;
use App\Models\RegistroMedicacion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RegistroMedicacion>
 */
class RegistroMedicacionFactory extends Factory
{
    protected $model = RegistroMedicacion::class;

    public function definition(): array
    {
        return [
            'medicacion_id' => Medicacion::factory(),
            'user_id' => User::factory(),
            'fecha_hora' => now(),
            'estado' => 'administrado',
            'cantidad_administrada' => 1,
        ];
    }
}
