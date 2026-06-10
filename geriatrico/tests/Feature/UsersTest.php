<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_devuelve_todos_los_usuarios(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/users');

        $response->assertOk();
        $this->assertGreaterThanOrEqual(4, count($response->json()));
    }

    public function test_index_filtra_por_role(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        User::factory()->count(2)->create(['role' => 'enfermero']);
        User::factory()->count(1)->create(['role' => 'medico']);

        $response = $this->getJson('/api/users?role=enfermero');

        $response->assertOk();
        foreach ($response->json() as $u) {
            $this->assertSame('enfermero', $u['role']);
        }
    }

    public function test_store_crea_usuario_con_password_hasheada(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/users', [
            'name' => 'Nueva Enfermera',
            'email' => 'nueva@residencia.test',
            'password' => 'secreto1234',
            'role' => 'enfermero',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', [
            'email' => 'nueva@residencia.test',
            'role' => 'enfermero',
        ]);
        $usuario = User::where('email', 'nueva@residencia.test')->first();
        $this->assertTrue(Hash::check('secreto1234', $usuario->password));
    }

    public function test_store_valida_password_minima(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/users', [
            'name' => 'Test',
            'email' => 'test@residencia.test',
            'password' => 'corta',
            'role' => 'staff',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['password', 'role']]);
    }

    public function test_store_rechaza_email_duplicado(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        User::factory()->create(['email' => 'existente@residencia.test']);

        $response = $this->postJson('/api/users', [
            'name' => 'Test',
            'email' => 'existente@residencia.test',
            'password' => 'secreto1234',
            'role' => 'medico',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['email']]);
    }

    public function test_update_modifica_rol(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $user = User::factory()->create(['role' => 'staff']);

        $response = $this->putJson("/api/users/{$user->id}", [
            'role' => 'medico',
        ]);

        $response->assertOk();
        $this->assertSame('medico', $user->fresh()->role);
    }

    public function test_update_hashea_password_si_se_envia(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $user = User::factory()->create();

        $response = $this->putJson("/api/users/{$user->id}", [
            'password' => 'nuevopass1234',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('nuevopass1234', $user->fresh()->password));
    }

    public function test_destroy_elimina_usuario(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}
