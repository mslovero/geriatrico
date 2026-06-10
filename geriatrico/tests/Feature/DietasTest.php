<?php

namespace Tests\Feature;

use App\Models\Dieta;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DietasTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_dietas_con_paciente(): void
    {
        $this->actingAsStaff();
        Dieta::factory()->count(3)->create();

        $response = $this->getJson('/api/dietas');

        $response->assertOk();
        $this->assertCount(3, $response->json());
    }

    public function test_store_crea_dieta(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/dietas', [
            'paciente_id' => $paciente->id,
            'tipo' => 'Diabética',
            'consistencia' => 'Blanda',
            'alergias' => 'Frutos secos',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('dietas', [
            'paciente_id' => $paciente->id,
            'tipo' => 'Diabética',
            'alergias' => 'Frutos secos',
        ]);
    }

    public function test_store_valida_campos_obligatorios(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/dietas', [
            'paciente_id' => 9999,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['paciente_id', 'tipo', 'consistencia']]);
    }

    public function test_update_modifica_consistencia(): void
    {
        $this->actingAsStaff();
        $dieta = Dieta::factory()->create(['consistencia' => 'Sólida']);

        $response = $this->putJson("/api/dietas/{$dieta->id}", [
            'consistencia' => 'Papilla',
        ]);

        $response->assertOk();
        $this->assertSame('Papilla', $dieta->fresh()->consistencia);
    }

    public function test_destroy_elimina_dieta(): void
    {
        $this->actingAsStaff();
        $dieta = Dieta::factory()->create();

        $response = $this->deleteJson("/api/dietas/{$dieta->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('dietas', ['id' => $dieta->id]);
    }
}
