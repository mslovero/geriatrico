<?php

namespace Tests\Feature;

use App\Models\Paciente;
use App\Models\TurnoMedico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TurnosTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_turnos_paginados(): void
    {
        $this->actingAsStaff();
        TurnoMedico::factory()->count(3)->create();

        $response = $this->getJson('/api/turnos-medicos');

        $response->assertOk();
        $response->assertJsonStructure(['data', 'current_page', 'total']);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_store_crea_turno_futuro(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/turnos-medicos', [
            'paciente_id' => $paciente->id,
            'profesional' => 'Dra. García',
            'especialidad' => 'Cardiología',
            'fecha_hora' => now()->addDays(7)->toDateTimeString(),
            'estado' => 'pendiente',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('turno_medicos', [
            'paciente_id' => $paciente->id,
            'profesional' => 'Dra. García',
        ]);
    }

    public function test_store_rechaza_turno_en_el_pasado(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/turnos-medicos', [
            'paciente_id' => $paciente->id,
            'profesional' => 'Dra. García',
            'especialidad' => 'Cardiología',
            'fecha_hora' => now()->subDays(1)->toDateTimeString(),
            'estado' => 'pendiente',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['fecha_hora']]);
    }

    public function test_update_marca_completado(): void
    {
        $this->actingAsStaff();
        $turno = TurnoMedico::factory()->create(['estado' => 'pendiente']);

        $response = $this->putJson("/api/turnos-medicos/{$turno->id}", [
            'estado' => 'completado',
        ]);

        $response->assertOk();
        $this->assertSame('completado', $turno->fresh()->estado);
    }

    public function test_destroy_solo_admin(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $turno = TurnoMedico::factory()->create();

        $response = $this->deleteJson("/api/turnos-medicos/{$turno->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('turno_medicos', ['id' => $turno->id]);
    }

    public function test_destroy_rechaza_no_admin(): void
    {
        $this->actingAsStaff();
        $turno = TurnoMedico::factory()->create();

        $response = $this->deleteJson("/api/turnos-medicos/{$turno->id}");

        $response->assertStatus(403);
    }
}
