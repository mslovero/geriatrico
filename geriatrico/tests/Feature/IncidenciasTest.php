<?php

namespace Tests\Feature;

use App\Models\Incidencia;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IncidenciasTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_incidencias_paginadas(): void
    {
        $this->actingAsStaff();
        Incidencia::factory()->count(3)->create();

        $response = $this->getJson('/api/incidencias');

        $response->assertOk();
        $response->assertJsonStructure(['data', 'current_page', 'total']);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_store_registra_incidencia_y_completa_usuario(): void
    {
        $user = $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/incidencias', [
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->toDateTimeString(),
            'tipo' => 'Caída',
            'severidad' => 'moderada',
            'descripcion' => 'Paciente cayó en el pasillo principal sin lesiones visibles',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('incidencias', [
            'paciente_id' => $paciente->id,
            'user_id' => $user->id,
            'severidad' => 'moderada',
        ]);
    }

    public function test_store_crea_notificacion_automatica(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $this->postJson('/api/incidencias', [
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->toDateTimeString(),
            'tipo' => 'Médico',
            'severidad' => 'critica',
            'descripcion' => 'Paciente con dificultad respiratoria severa atendido por enfermería',
        ])->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'tipo' => 'incidencia',
            'paciente_id' => $paciente->id,
            'color' => 'danger',
        ]);
    }

    public function test_store_valida_descripcion_minima(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/incidencias', [
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->toDateTimeString(),
            'tipo' => 'Otro',
            'severidad' => 'leve',
            'descripcion' => 'corto',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['descripcion']]);
    }

    public function test_store_valida_severidad(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/incidencias', [
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->toDateTimeString(),
            'tipo' => 'Caída',
            'severidad' => 'extrema',
            'descripcion' => 'cualquier descripción larga válida acá',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['severidad']]);
    }

    public function test_update_modifica_acciones_tomadas(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $incidencia = Incidencia::factory()->create();

        $response = $this->putJson("/api/incidencias/{$incidencia->id}", [
            'acciones_tomadas' => 'Se llamó a emergencias y se contuvo al residente',
        ]);

        $response->assertOk();
        $this->assertSame(
            'Se llamó a emergencias y se contuvo al residente',
            $incidencia->fresh()->acciones_tomadas,
        );
    }

    public function test_destroy_solo_admin(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $incidencia = Incidencia::factory()->create();

        $response = $this->deleteJson("/api/incidencias/{$incidencia->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('incidencias', ['id' => $incidencia->id]);
    }

    public function test_destroy_rechaza_no_admin(): void
    {
        $this->actingAsStaff();
        $incidencia = Incidencia::factory()->create();

        $response = $this->deleteJson("/api/incidencias/{$incidencia->id}");

        $response->assertStatus(403);
    }
}
