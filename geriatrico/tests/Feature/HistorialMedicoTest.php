<?php

namespace Tests\Feature;

use App\Models\HistorialMedico;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HistorialMedicoTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_historial_con_paciente(): void
    {
        $this->actingAsStaff();
        HistorialMedico::factory()->count(3)->create();

        $response = $this->getJson('/api/historiales-medicos');

        $response->assertOk();
        $this->assertCount(3, $response->json());
    }

    public function test_store_crea_entrada_de_historial(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/historiales-medicos', [
            'paciente_id' => $paciente->id,
            'fecha' => now()->toDateString(),
            'observacion' => 'Control trimestral, parámetros normales',
            'medico_responsable' => 'Dr. Pérez',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('historial_medicos', [
            'paciente_id' => $paciente->id,
            'medico_responsable' => 'Dr. Pérez',
        ]);
    }

    public function test_store_valida_paciente_existente(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/historiales-medicos', [
            'paciente_id' => 9999,
            'fecha' => now()->toDateString(),
            'observacion' => 'test',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['paciente_id']]);
    }

    public function test_update_modifica_observacion(): void
    {
        $this->actingAsStaff();
        $historial = HistorialMedico::factory()->create();

        $response = $this->putJson("/api/historiales-medicos/{$historial->id}", [
            'observacion' => 'Actualización con seguimiento adicional',
        ]);

        $response->assertOk();
        $this->assertSame(
            'Actualización con seguimiento adicional',
            $historial->fresh()->observacion,
        );
    }

    public function test_destroy_elimina_entrada(): void
    {
        $this->actingAsStaff();
        $historial = HistorialMedico::factory()->create();

        $response = $this->deleteJson("/api/historiales-medicos/{$historial->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('historial_medicos', ['id' => $historial->id]);
    }
}
