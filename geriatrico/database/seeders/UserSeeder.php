<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'admin@geriatrico.com')->exists()) {
            User::create([
                'name' => 'Admin',
                'email' => 'admin@geriatrico.com',
                'password' => Hash::make('password'),
            ]);
        }
    }
}
