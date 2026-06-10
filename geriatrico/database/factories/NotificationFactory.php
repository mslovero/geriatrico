<?php

namespace Database\Factories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'tipo' => 'sistema',
            'titulo' => $this->faker->sentence(4),
            'mensaje' => $this->faker->sentence(),
            'leida' => false,
            'leida_at' => null,
            'paciente_id' => null,
            'user_id' => null,
        ];
    }

    public function leida(): static
    {
        return $this->state(fn () => [
            'leida' => true,
            'leida_at' => now(),
        ]);
    }
}
