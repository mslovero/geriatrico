<?php

namespace Tests\Feature;

use App\Models\Paciente;
use App\Models\SignoVital;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SignosVitalesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        // Signos vitales los registra personal clínico.
        $user = User::factory()->create(['role' => 'enfermero']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_registros_paginados_con_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        SignoVital::factory()->count(3)->create(['paciente_id' => $paciente->id]);

        $response = $this->getJson('/api/signos-vitales');

        $response->assertOk();
        $response->assertJsonStructure(['data', 'current_page', 'total']);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_store_crea_registro_y_completa_responsable(): void
    {
        $user = $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/signos-vitales', [
            'paciente_id' => $paciente->id,
            'fecha' => now()->toDateTimeString(),
            'presion_arterial' => '120/80',
            'temperatura' => 36.8,
            'frecuencia_cardiaca' => 75,
            'saturacion_oxigeno' => 98,
            'glucosa' => 95,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Signos vitales registrados correctamente');
        $this->assertDatabaseHas('signo_vitals', [
            'paciente_id' => $paciente->id,
            'registrado_por' => $user->name,
        ]);
    }

    public function test_store_valida_temperatura_fuera_de_rango(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/signos-vitales', [
            'paciente_id' => $paciente->id,
            'fecha' => now()->toDateTimeString(),
            'temperatura' => 50,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['temperatura']]);
    }

    public function test_historial_paciente_devuelve_lista_ordenada(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        SignoVital::factory()->count(3)->create(['paciente_id' => $paciente->id]);

        $response = $this->getJson("/api/signos-vitales/paciente/{$paciente->id}");

        $response->assertOk();
        $response->assertJsonPath('paciente.id', $paciente->id);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_update_modifica_observaciones(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $signo = SignoVital::factory()->create(['temperatura' => 36.5]);

        $response = $this->putJson("/api/signos-vitales/{$signo->id}", [
            'temperatura' => 37.2,
            'observaciones' => 'paciente febril',
        ]);

        $response->assertOk();
        $this->assertSame('37.2', (string) $signo->fresh()->temperatura);
        $this->assertSame('paciente febril', $signo->fresh()->observaciones);
    }

    public function test_destroy_elimina_registro_solo_admin(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $signo = SignoVital::factory()->create();

        $response = $this->deleteJson("/api/signos-vitales/{$signo->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('signo_vitals', ['id' => $signo->id]);
    }

    public function test_destroy_rechaza_no_admin(): void
    {
        $this->actingAsStaff();
        $signo = SignoVital::factory()->create();

        $response = $this->deleteJson("/api/signos-vitales/{$signo->id}");

        $response->assertStatus(403);
    }

    public function test_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/signos-vitales');

        $response->assertStatus(401);
    }
}
