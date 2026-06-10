<?php

namespace Tests\Feature;

use App\Models\Cama;
use App\Models\Habitacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CamasTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_devuelve_camas_con_habitacion(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create();
        Cama::factory()->count(2)->create(['habitacion_id' => $habitacion->id]);

        $response = $this->getJson('/api/camas');

        $response->assertOk();
        $response->assertJsonCount(2);
        $response->assertJsonPath('0.habitacion.id', $habitacion->id);
    }

    public function test_store_crea_cama(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create(['capacidad' => 4]);

        $response = $this->postJson('/api/camas', [
            'habitacion_id' => $habitacion->id,
            'numero_cama' => 'CAMA-101-A',
            'estado' => 'libre',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Cama creada correctamente');
        $this->assertDatabaseHas('camas', [
            'habitacion_id' => $habitacion->id,
            'numero_cama' => 'CAMA-101-A',
            'estado' => 'libre',
        ]);
    }

    public function test_store_rechaza_si_habitacion_no_existe(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/camas', [
            'habitacion_id' => 9999,
            'numero_cama' => 'X-1',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['habitacion_id']]);
    }

    public function test_store_falla_si_habitacion_esta_a_capacidad_maxima(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create(['capacidad' => 1]);
        Cama::factory()->create(['habitacion_id' => $habitacion->id]);

        $response = $this->postJson('/api/camas', [
            'habitacion_id' => $habitacion->id,
            'numero_cama' => 'CAMA-EXTRA',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'La habitación ya alcanzó su capacidad máxima. No se pueden agregar más camas.');
    }

    public function test_store_rechaza_numero_cama_duplicado(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create(['capacidad' => 4]);
        Cama::factory()->create([
            'habitacion_id' => $habitacion->id,
            'numero_cama' => 'CAMA-UNICA',
        ]);

        $response = $this->postJson('/api/camas', [
            'habitacion_id' => $habitacion->id,
            'numero_cama' => 'CAMA-UNICA',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['numero_cama']]);
    }

    public function test_show_devuelve_cama_con_habitacion(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create();
        $cama = Cama::factory()->create(['habitacion_id' => $habitacion->id]);

        $response = $this->getJson("/api/camas/{$cama->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $cama->id);
        $response->assertJsonPath('habitacion.id', $habitacion->id);
    }

    public function test_update_modifica_estado(): void
    {
        $this->actingAsStaff();
        $cama = Cama::factory()->create(['estado' => 'libre']);

        $response = $this->putJson("/api/camas/{$cama->id}", [
            'estado' => 'mantenimiento',
        ]);

        $response->assertOk();
        $this->assertSame('mantenimiento', $cama->fresh()->estado);
    }

    public function test_destroy_elimina_cama(): void
    {
        $this->actingAsStaff();
        $cama = Cama::factory()->create();

        $response = $this->deleteJson("/api/camas/{$cama->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('camas', ['id' => $cama->id]);
    }

    public function test_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/camas');

        $response->assertStatus(401);
    }
}
