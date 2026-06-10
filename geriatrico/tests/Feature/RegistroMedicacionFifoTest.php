<?php

namespace Tests\Feature;

use App\Models\LoteStock;
use App\Models\Medicacion;
use App\Models\MovimientoStock;
use App\Models\Paciente;
use App\Models\RegistroMedicacion;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RegistroMedicacionFifoTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        // Las administraciones de medicación las hace personal clínico.
        $user = User::factory()->create(['role' => 'enfermero']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_obra_social_no_requiere_stock(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'obra_social',
            'stock_item_id' => null,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('registro_medicacions', [
            'medicacion_id' => $medicacion->id,
            'estado' => 'administrado',
            'lote_stock_id' => null,
        ]);
        $this->assertDatabaseCount('movimientos_stock', 0);
    }

    public function test_administra_seleccionando_lote_fifo(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 100]);

        $loteLejano = LoteStock::factory()->venceEn(180)->conCantidad(50)->create([
            'stock_item_id' => $stock->id,
            'numero_lote' => 'LOTE-LEJANO',
        ]);
        $loteProximo = LoteStock::factory()->venceEn(15)->conCantidad(50)->create([
            'stock_item_id' => $stock->id,
            'numero_lote' => 'LOTE-PROXIMO',
        ]);

        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('registro_medicacions', [
            'medicacion_id' => $medicacion->id,
            'lote_stock_id' => $loteProximo->id,
            'cantidad_administrada' => 1,
        ]);
        $this->assertSame(49, $loteProximo->fresh()->cantidad_actual);
        $this->assertSame(50, $loteLejano->fresh()->cantidad_actual);
        $this->assertSame(99, (int) $stock->fresh()->stock_actual);
        $this->assertDatabaseHas('movimientos_stock', [
            'stock_item_id' => $stock->id,
            'lote_stock_id' => $loteProximo->id,
            'tipo_movimiento' => 'salida',
            'cantidad' => 1,
        ]);
    }

    public function test_falla_si_medicacion_no_tiene_stock_vinculado(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => null,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'MedicacionSinStockVinculadoException');
        $this->assertDatabaseCount('registro_medicacions', 0);
    }

    public function test_falla_si_no_hay_lotes_disponibles(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();
        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'LoteNoDisponibleException');
        $this->assertDatabaseCount('registro_medicacions', 0);
    }

    public function test_ignora_lotes_vencidos(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();
        LoteStock::factory()->vencido()->conCantidad(100)->create([
            'stock_item_id' => $stock->id,
        ]);

        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'LoteNoDisponibleException');
    }

    public function test_falla_si_stock_pertenece_a_otro_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $otroPaciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delPaciente($otroPaciente)->create();
        LoteStock::factory()->venceEn(60)->conCantidad(20)->create([
            'stock_item_id' => $stock->id,
        ]);

        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'paciente',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'StockPropietarioMismatchException');
    }

    public function test_rechazado_no_descuenta_stock(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 50]);
        $lote = LoteStock::factory()->venceEn(60)->conCantidad(50)->create([
            'stock_item_id' => $stock->id,
        ]);
        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'rechazado',
            'observaciones' => 'paciente rechazó la toma',
        ]);

        $response->assertCreated();
        $this->assertSame(50, $lote->fresh()->cantidad_actual);
        $this->assertDatabaseCount('movimientos_stock', 0);
    }

    public function test_marca_lote_como_agotado_cuando_se_consume_completo(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();
        $lote = LoteStock::factory()->venceEn(30)->conCantidad(1)->create([
            'stock_item_id' => $stock->id,
        ]);
        $medicacion = Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/registro-medicaciones', [
            'medicacion_id' => $medicacion->id,
            'fecha_hora' => now()->toDateTimeString(),
            'estado' => 'administrado',
        ]);

        $response->assertCreated();
        $loteFresco = $lote->fresh();
        $this->assertSame(0, $loteFresco->cantidad_actual);
        $this->assertSame('agotado', $loteFresco->estado);
    }
}
