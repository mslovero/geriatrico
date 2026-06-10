<?php

namespace Tests\Feature;

use App\Models\Habitacion;
use App\Models\Medicacion;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * El rol administrativo se ocupa de la admisión, agenda y operaciones.
 * Debe poder VER todo lo clínico (para coordinar) pero NO modificar
 * datos médicos (medicación, signos vitales). Sí puede gestionar
 * habitaciones, pacientes (admisión) y turnos.
 */
class AdministrativoPermisosTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdministrativo(): User
    {
        $user = User::factory()->create(['role' => 'administrativo']);
        Sanctum::actingAs($user);

        return $user;
    }

    // === Pacientes: administrativo SÍ puede ===

    public function test_administrativo_puede_ver_pacientes(): void
    {
        $this->actingAsAdministrativo();
        Paciente::factory()->count(3)->create();

        $response = $this->getJson('/api/pacientes');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_administrativo_puede_crear_paciente(): void
    {
        $this->actingAsAdministrativo();

        $response = $this->postJson('/api/pacientes', [
            'nombre' => 'Nuevo',
            'apellido' => 'Residente',
            'dni' => '40000003',
            'fecha_nacimiento' => '1942-05-15',
            'estado' => 'activo',
        ]);

        $response->assertCreated();
    }

    public function test_administrativo_puede_editar_paciente(): void
    {
        $this->actingAsAdministrativo();
        $paciente = Paciente::factory()->create();

        $response = $this->putJson("/api/pacientes/{$paciente->id}", [
            'nombre' => $paciente->nombre,
            'apellido' => 'Apellido modificado',
            'dni' => $paciente->dni,
        ]);

        $response->assertOk();
    }

    public function test_administrativo_no_puede_eliminar_paciente(): void
    {
        $this->actingAsAdministrativo();
        $paciente = Paciente::factory()->create();

        $response = $this->deleteJson("/api/pacientes/{$paciente->id}");

        $response->assertStatus(403);
    }

    // === Habitaciones: administrativo SÍ puede gestionar ===

    public function test_administrativo_puede_crear_habitacion(): void
    {
        $this->actingAsAdministrativo();

        $response = $this->postJson('/api/habitaciones', [
            'numero' => '999',
            'capacidad' => 2,
        ]);

        $response->assertCreated();
    }

    // === Medicaciones: administrativo NO toca prescripciones ===

    public function test_administrativo_puede_ver_medicaciones(): void
    {
        $this->actingAsAdministrativo();
        Medicacion::factory()->count(2)->create();

        $response = $this->getJson('/api/medicamentos');

        $response->assertOk();
    }

    public function test_administrativo_no_puede_crear_medicacion(): void
    {
        $this->actingAsAdministrativo();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/medicamentos', [
            'nombre' => 'Test',
            'paciente_id' => $paciente->id,
            'origen_pago' => 'obra_social',
            'tipo' => 'sos',
        ]);

        $response->assertStatus(403);
    }

    // === Stock: administrativo SÍ gestiona ===

    public function test_administrativo_puede_ver_stock(): void
    {
        $this->actingAsAdministrativo();
        StockItem::factory()->delGeriatrico()->count(2)->create();

        $response = $this->getJson('/api/stock-items');

        $response->assertOk();
    }

    public function test_administrativo_puede_crear_stock_item(): void
    {
        $this->actingAsAdministrativo();

        $response = $this->postJson('/api/stock-items', [
            'nombre' => 'Insumo test',
            'tipo' => 'insumo',
            'unidad_medida' => 'unidad',
            'stock_actual' => 50,
            'stock_minimo' => 10,
            'propiedad' => 'geriatrico',
        ]);

        $response->assertCreated();
    }

    // === PDF: administrativo puede descargar fichas ===

    public function test_administrativo_puede_descargar_pdf_paciente(): void
    {
        $this->actingAsAdministrativo();
        $paciente = Paciente::factory()->create();

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }
}
