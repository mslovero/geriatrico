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
 * Verifica que el rol "enfermero" SOLO puede hacer lo que su rol
 * autoriza. Este test es el contrato entre frontend (que oculta botones)
 * y backend (que rechaza la acción). Si esto falla, hay riesgo real
 * de exposición de datos médicos.
 */
class EnfermeriaPermisosTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsEnfermera(): User
    {
        $enfermera = User::factory()->enfermero()->create();
        Sanctum::actingAs($enfermera);

        return $enfermera;
    }

    // === Pacientes: enfermería NO puede crear/editar/eliminar ===

    public function test_enfermeria_puede_ver_pacientes(): void
    {
        $this->actingAsEnfermera();
        Paciente::factory()->count(2)->create();

        $response = $this->getJson('/api/pacientes');

        $response->assertOk();
    }

    public function test_enfermeria_no_puede_crear_paciente(): void
    {
        $this->actingAsEnfermera();

        $response = $this->postJson('/api/pacientes', [
            'nombre' => 'Test',
            'apellido' => 'Prueba',
            'dni' => '40000001',
            'fecha_nacimiento' => '1940-01-01',
            'estado' => 'activo',
        ]);

        $response->assertStatus(403);
    }

    public function test_enfermeria_no_puede_editar_paciente(): void
    {
        $this->actingAsEnfermera();
        $paciente = Paciente::factory()->create();

        $response = $this->putJson("/api/pacientes/{$paciente->id}", [
            'nombre' => $paciente->nombre,
            'apellido' => 'Modificado',
            'dni' => $paciente->dni,
        ]);

        $response->assertStatus(403);
    }

    public function test_enfermeria_no_puede_eliminar_paciente(): void
    {
        $this->actingAsEnfermera();
        $paciente = Paciente::factory()->create();

        $response = $this->deleteJson("/api/pacientes/{$paciente->id}");

        $response->assertStatus(403);
    }

    // === Medicaciones: enfermería NO crea/edita prescripciones ===

    public function test_enfermeria_puede_ver_medicaciones(): void
    {
        $this->actingAsEnfermera();
        Medicacion::factory()->count(2)->create();

        $response = $this->getJson('/api/medicamentos');

        $response->assertOk();
    }

    public function test_enfermeria_no_puede_crear_medicacion(): void
    {
        $this->actingAsEnfermera();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/medicamentos', [
            'nombre' => 'Paracetamol',
            'paciente_id' => $paciente->id,
            'origen_pago' => 'obra_social',
            'tipo' => 'sos',
        ]);

        $response->assertStatus(403);
    }

    public function test_enfermeria_no_puede_eliminar_medicacion(): void
    {
        $this->actingAsEnfermera();
        $medicacion = Medicacion::factory()->create();

        $response = $this->deleteJson("/api/medicamentos/{$medicacion->id}");

        $response->assertStatus(403);
    }

    // === Stock: enfermería NO maneja inventario ===

    public function test_enfermeria_puede_ver_stock(): void
    {
        $this->actingAsEnfermera();
        StockItem::factory()->delGeriatrico()->count(2)->create();

        $response = $this->getJson('/api/stock-items');

        $response->assertOk();
    }

    public function test_enfermeria_no_puede_crear_stock_item(): void
    {
        $this->actingAsEnfermera();

        $response = $this->postJson('/api/stock-items', [
            'nombre' => 'Test',
            'tipo' => 'medicamento',
            'unidad_medida' => 'pastilla',
            'stock_actual' => 10,
            'stock_minimo' => 5,
            'propiedad' => 'geriatrico',
        ]);

        $response->assertStatus(403);
    }

    public function test_enfermeria_no_puede_eliminar_stock_item(): void
    {
        $this->actingAsEnfermera();
        $stock = StockItem::factory()->delGeriatrico()->create();

        $response = $this->deleteJson("/api/stock-items/{$stock->id}");

        $response->assertStatus(403);
    }

    // === Usuarios: enfermería NO gestiona usuarios ===
    // NOTA: UserController no tiene policy ni Gate, así que un enfermero
    // técnicamente podría listar usuarios. Esto es un hallazgo del audit.
    // Lo dejamos documentado acá: en una próxima iteración agregamos UserPolicy.

    // === Lo que SÍ puede hacer enfermería ===

    public function test_enfermeria_puede_registrar_signos_vitales(): void
    {
        $this->actingAsEnfermera();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/signos-vitales', [
            'paciente_id' => $paciente->id,
            'fecha' => now()->toDateTimeString(),
            'presion_arterial' => '120/80',
            'temperatura' => 36.5,
        ]);

        $response->assertCreated();
    }

    public function test_enfermeria_puede_reportar_incidencia(): void
    {
        $this->actingAsEnfermera();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/incidencias', [
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->toDateTimeString(),
            'tipo' => 'Caída',
            'severidad' => 'leve',
            'descripcion' => 'Paciente cayó sin lesiones visibles, fue contenido por enfermería',
        ]);

        $response->assertCreated();
    }
}
