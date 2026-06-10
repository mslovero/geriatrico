<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_exitoso_devuelve_token_y_user(): void
    {
        $user = User::factory()->create([
            'email' => 'pro@geriatrico.test',
            'password' => Hash::make('secreto123'),
            'role' => 'staff',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'pro@geriatrico.test',
            'password' => 'secreto123',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['message', 'access_token', 'token_type', 'user' => ['id', 'name', 'email', 'role']]);
        $response->assertJsonPath('user.id', $user->id);
        $response->assertJsonPath('token_type', 'Bearer');
        $this->assertNotEmpty($response->json('access_token'));
    }

    public function test_login_user_no_expone_password(): void
    {
        User::factory()->create([
            'email' => 'check@geriatrico.test',
            'password' => Hash::make('secreto123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'check@geriatrico.test',
            'password' => 'secreto123',
        ]);

        $response->assertOk();
        $this->assertArrayNotHasKey('password', $response->json('user'));
        $this->assertArrayNotHasKey('remember_token', $response->json('user'));
    }

    public function test_login_con_credenciales_invalidas_devuelve_401(): void
    {
        User::factory()->create([
            'email' => 'pro@geriatrico.test',
            'password' => Hash::make('secreto123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'pro@geriatrico.test',
            'password' => 'mal',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('message', 'Credenciales incorrectas');
    }

    public function test_login_valida_payload(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'no-es-email',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['email', 'password']]);
    }

    public function test_logout_invalida_token(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertOk();
        $response->assertJsonPath('message', 'Logout exitoso');
    }

    public function test_endpoints_protegidos_requieren_token(): void
    {
        $response = $this->getJson('/api/pacientes');

        $response->assertStatus(401);
        $response->assertJsonPath('message', 'No autenticado.');
    }
}
