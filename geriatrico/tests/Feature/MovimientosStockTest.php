<?php

namespace Tests\Feature;

use App\Models\MovimientoStock;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MovimientosStockTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_filtra_por_tipo_y_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();
        MovimientoStock::factory()->create([
            'stock_item_id' => $stock->id,
            'paciente_id' => $paciente->id,
            'tipo_movimiento' => 'salida',
        ]);
        MovimientoStock::factory()->create([
            'stock_item_id' => $stock->id,
            'tipo_movimiento' => 'entrada',
        ]);

        $response = $this->getJson("/api/movimientos-stock?tipo_movimiento=salida&paciente_id={$paciente->id}");

        $response->assertOk();
        foreach ($response->json('data') as $mov) {
            $this->assertSame('salida', $mov['tipo_movimiento']);
            $this->assertSame($paciente->id, $mov['paciente_id']);
        }
    }

    public function test_por_paciente_devuelve_solo_movimientos_del_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $otro = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();
        MovimientoStock::factory()->create(['stock_item_id' => $stock->id, 'paciente_id' => $paciente->id]);
        MovimientoStock::factory()->create(['stock_item_id' => $stock->id, 'paciente_id' => $otro->id]);

        $response = $this->getJson("/api/movimientos-stock/paciente/{$paciente->id}");

        $response->assertOk();
        foreach ($response->json('data') as $mov) {
            $this->assertSame($paciente->id, $mov['paciente_id']);
        }
    }

    public function test_administrar_medicacion_delega_y_descuenta_lote(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 50]);
        $lote = \App\Models\LoteStock::factory()
            ->venceEn(60)
            ->conCantidad(50)
            ->create(['stock_item_id' => $stock->id]);
        $medicacion = \App\Models\Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->postJson('/api/movimientos-stock/administrar', [
            'medicacion_id' => $medicacion->id,
        ]);

        $response->assertOk();
        $response->assertJsonPath('lote_usado', $lote->numero_lote);
        $this->assertSame(49, (int) $lote->fresh()->cantidad_actual);
    }
}
