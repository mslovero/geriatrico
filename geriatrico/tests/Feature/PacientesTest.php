<?php

namespace Tests\Feature;

use App\Models\Cama;
use App\Models\Habitacion;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PacientesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): User
    {
        $user = User::factory()->admin()->create();
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_pacientes_paginados(): void
    {
        $this->actingAsAdmin();
        Paciente::factory()->count(3)->create();

        $response = $this->getJson('/api/pacientes');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'data' => [['id', 'nombre', 'apellido', 'nombre_completo', 'dni']],
            'links',
            'meta',
        ]);
    }

    public function test_index_filtra_por_estado(): void
    {
        $this->actingAsAdmin();
        Paciente::factory()->create(['estado' => 'activo']);
        Paciente::factory()->create(['estado' => 'activo']);
        Paciente::factory()->create(['estado' => 'fallecido']);

        $response = $this->getJson('/api/pacientes?estado=activo');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_store_crea_paciente_y_ocupa_cama_y_notifica(): void
    {
        $this->actingAsAdmin();
        $habitacion = Habitacion::factory()->create();
        $cama = Cama::factory()->create([
            'habitacion_id' => $habitacion->id,
            'estado' => 'libre',
        ]);

        $response = $this->postJson('/api/pacientes', [
            'nombre' => 'María',
            'apellido' => 'González',
            'dni' => '12345678',
            'fecha_nacimiento' => '1940-05-10',
            'habitacion_id' => $habitacion->id,
            'cama_id' => $cama->id,
            'estado' => 'activo',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('nombre_completo', 'María González');

        $this->assertDatabaseHas('pacientes', [
            'dni' => '12345678',
            'cama_id' => $cama->id,
        ]);
        $this->assertSame('ocupada', $cama->fresh()->estado);
        $this->assertDatabaseHas('notifications', [
            'tipo' => 'paciente_nuevo',
            'paciente_id' => $response->json('id'),
        ]);
    }

    public function test_store_rechaza_dni_duplicado(): void
    {
        $this->actingAsAdmin();
        Paciente::factory()->create(['dni' => '99999999']);

        $response = $this->postJson('/api/pacientes', [
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'dni' => '99999999',
            'fecha_nacimiento' => '1945-01-01',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['dni']]);
    }

    public function test_store_rechaza_cama_sin_habitacion(): void
    {
        $this->actingAsAdmin();
        $cama = Cama::factory()->create();

        $response = $this->postJson('/api/pacientes', [
            'nombre' => 'Ana',
            'apellido' => 'López',
            'dni' => '11111111',
            'fecha_nacimiento' => '1950-02-02',
            'cama_id' => $cama->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['habitacion_id']]);
    }

    public function test_update_libera_cama_anterior_y_ocupa_nueva(): void
    {
        $this->actingAsAdmin();
        $habitacion = Habitacion::factory()->create();
        $camaVieja = Cama::factory()->create(['habitacion_id' => $habitacion->id, 'estado' => 'ocupada']);
        $camaNueva = Cama::factory()->create(['habitacion_id' => $habitacion->id, 'estado' => 'libre']);
        $paciente = Paciente::factory()->create([
            'habitacion_id' => $habitacion->id,
            'cama_id' => $camaVieja->id,
        ]);

        $response = $this->putJson("/api/pacientes/{$paciente->id}", [
            'nombre' => $paciente->nombre,
            'apellido' => $paciente->apellido,
            'dni' => $paciente->dni,
            'habitacion_id' => $habitacion->id,
            'cama_id' => $camaNueva->id,
        ]);

        $response->assertOk();
        $this->assertSame('libre', $camaVieja->fresh()->estado);
        $this->assertSame('ocupada', $camaNueva->fresh()->estado);
    }

    public function test_destroy_soft_delete(): void
    {
        $this->actingAsAdmin();
        $paciente = Paciente::factory()->create();

        $response = $this->deleteJson("/api/pacientes/{$paciente->id}");

        $response->assertOk();
        $this->assertSoftDeleted('pacientes', ['id' => $paciente->id]);
    }

    public function test_enfermero_no_puede_eliminar_paciente(): void
    {
        $enfermero = User::factory()->enfermero()->create();
        Sanctum::actingAs($enfermero);
        $paciente = Paciente::factory()->create();

        $response = $this->deleteJson("/api/pacientes/{$paciente->id}");

        $response->assertStatus(403);
        $response->assertJsonStructure(['message']);
    }
}
