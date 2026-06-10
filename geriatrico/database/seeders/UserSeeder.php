<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            [
                'name' => 'Admin Demo',
                'email' => 'admin@geriatrico.test',
                'role' => 'admin',
            ],
            [
                'name' => 'Dra. Carolina López',
                'email' => 'medico@geriatrico.test',
                'role' => 'medico',
            ],
            [
                'name' => 'María Sánchez',
                'email' => 'enfermera@geriatrico.test',
                'role' => 'enfermero',
            ],
            [
                'name' => 'Roberto Díaz',
                'email' => 'admin-staff@geriatrico.test',
                'role' => 'administrativo',
            ],
        ];

        foreach ($usuarios as $datos) {
            User::updateOrCreate(
                ['email' => $datos['email']],
                [
                    'name' => $datos['name'],
                    'role' => $datos['role'],
                    'password' => Hash::make('password'),
                ],
            );
        }
    }
}
