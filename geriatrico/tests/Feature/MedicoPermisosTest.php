<?php

namespace Tests\Feature;

use App\Models\Medicacion;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * El rol médico atiende, prescribe, registra observaciones — pero NO
 * realiza tareas administrativas (admisión, gestión de stock, etc.).
 *
 * Este test asegura el separación entre el rol clínico y el administrativo.
 */
class MedicoPermisosTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsMedico(): User
    {
        $medico = User::factory()->create(['role' => 'medico']);
        Sanctum::actingAs($medico);

        return $medico;
    }

    // === Pacientes: médico NO crea ni edita pacientes ===

    public function test_medico_puede_ver_pacientes(): void
    {
        $this->actingAsMedico();
        Paciente::factory()->count(2)->create();

        $response = $this->getJson('/api/pacientes');

        $response->assertOk();
    }

    public function test_medico_no_puede_crear_paciente(): void
    {
        $this->actingAsMedico();

        $response = $this->postJson('/api/pacientes', [
            'nombre' => 'Test',
            'apellido' => 'Prueba',
            'dni' => '40000002',
            'fecha_nacimiento' => '1940-01-01',
            'estado' => 'activo',
        ]);

        $response->assertStatus(403);
    }

    public function test_medico_no_puede_editar_paciente(): void
    {
        $this->actingAsMedico();
        $paciente = Paciente::factory()->create();

        $response = $this->putJson("/api/pacientes/{$paciente->id}", [
            'nombre' => $paciente->nombre,
            'apellido' => 'Modificado',
            'dni' => $paciente->dni,
        ]);

        $response->assertStatus(403);
    }

    public function test_medico_no_puede_eliminar_paciente(): void
    {
        $this->actingAsMedico();
        $paciente = Paciente::factory()->create();

        $response = $this->deleteJson("/api/pacientes/{$paciente->id}");

        $response->assertStatus(403);
    }

    // === Medicaciones: médico SÍ prescribe ===

    public function test_medico_puede_crear_medicacion(): void
    {
        $this->actingAsMedico();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/medicamentos', [
            'nombre' => 'Enalapril 10mg',
            'paciente_id' => $paciente->id,
            'origen_pago' => 'obra_social',
            'tipo' => 'diaria',
            'dosis' => '10mg',
            'frecuencia' => 'cada 12hs',
        ]);

        $response->assertCreated();
    }

    public function test_medico_puede_editar_medicacion(): void
    {
        $this->actingAsMedico();
        $medicacion = Medicacion::factory()->create();

        $response = $this->putJson("/api/medicamentos/{$medicacion->id}", [
            'dosis' => '20mg',
        ]);

        $response->assertOk();
    }

    public function test_medico_no_puede_eliminar_medicacion(): void
    {
        $this->actingAsMedico();
        $medicacion = Medicacion::factory()->create();

        $response = $this->deleteJson("/api/medicamentos/{$medicacion->id}");

        $response->assertStatus(403);
    }

    // === Stock: médico NO gestiona inventario ===

    public function test_medico_puede_ver_stock(): void
    {
        $this->actingAsMedico();
        StockItem::factory()->delGeriatrico()->count(2)->create();

        $response = $this->getJson('/api/stock-items');

        $response->assertOk();
    }
}
