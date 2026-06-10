<?php

namespace Tests\Feature;

use App\Models\Cama;
use App\Models\Habitacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HabitacionesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_devuelve_habitaciones_paginadas_con_conteo(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create(['capacidad' => 2]);
        Cama::factory()->count(2)->create([
            'habitacion_id' => $habitacion->id,
            'estado' => 'ocupada',
        ]);
        Habitacion::factory()->count(2)->create();

        $response = $this->getJson('/api/habitaciones');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [['id', 'numero', 'capacidad', 'camas_totales', 'camas_ocupadas']],
            'current_page',
            'total',
        ]);
        $primera = collect($response->json('data'))->firstWhere('id', $habitacion->id);
        $this->assertSame(2, $primera['camas_totales']);
        $this->assertSame(2, $primera['camas_ocupadas']);
    }

    public function test_store_crea_habitacion(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/habitaciones', [
            'numero' => '301',
            'capacidad' => 4,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Habitación creada correctamente');
        $response->assertJsonPath('data.numero', '301');
        $this->assertDatabaseHas('habitaciones', ['numero' => '301', 'capacidad' => 4]);
    }

    public function test_store_rechaza_numero_duplicado(): void
    {
        $this->actingAsStaff();
        Habitacion::factory()->create(['numero' => '301']);

        $response = $this->postJson('/api/habitaciones', [
            'numero' => '301',
            'capacidad' => 2,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['numero']]);
    }

    public function test_store_valida_capacidad_minima(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/habitaciones', [
            'numero' => '302',
            'capacidad' => 0,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['capacidad']]);
    }

    public function test_show_devuelve_habitacion_con_camas(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create();
        Cama::factory()->count(2)->create(['habitacion_id' => $habitacion->id]);

        $response = $this->getJson("/api/habitaciones/{$habitacion->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $habitacion->id);
        $response->assertJsonCount(2, 'cama');
    }

    public function test_show_404_si_no_existe(): void
    {
        $this->actingAsStaff();

        $response = $this->getJson('/api/habitaciones/9999');

        $response->assertStatus(404);
        $response->assertJsonPath('message', 'Habitación no encontrada');
    }

    public function test_update_modifica_capacidad(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create(['capacidad' => 2]);

        $response = $this->putJson("/api/habitaciones/{$habitacion->id}", [
            'capacidad' => 4,
        ]);

        $response->assertOk();
        $this->assertSame(4, $habitacion->fresh()->capacidad);
    }

    public function test_destroy_falla_si_tiene_camas(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create();
        Cama::factory()->create(['habitacion_id' => $habitacion->id]);

        $response = $this->deleteJson("/api/habitaciones/{$habitacion->id}");

        $response->assertStatus(400);
        $response->assertJsonPath('message', 'No se puede eliminar la habitación porque tiene camas asociadas');
        $this->assertDatabaseHas('habitaciones', ['id' => $habitacion->id]);
    }

    public function test_destroy_elimina_si_no_tiene_camas(): void
    {
        $this->actingAsStaff();
        $habitacion = Habitacion::factory()->create();

        $response = $this->deleteJson("/api/habitaciones/{$habitacion->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('habitaciones', ['id' => $habitacion->id]);
    }

    public function test_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/habitaciones');

        $response->assertStatus(401);
    }
}
