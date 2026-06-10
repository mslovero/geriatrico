<?php

namespace Tests\Feature;

use App\Models\LoteStock;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StockMovimientosTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): User
    {
        $user = User::factory()->admin()->create();
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_registrar_entrada_aumenta_stock_y_crea_movimiento(): void
    {
        $user = $this->actingAsAdmin();
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 10]);

        $response = $this->postJson("/api/stock-items/{$stock->id}/entrada", [
            'cantidad' => 25,
            'motivo' => 'compra',
            'precio_total' => 1250.50,
        ]);

        $response->assertOk();
        $this->assertSame(35, (int) $stock->fresh()->stock_actual);
        $this->assertDatabaseHas('movimientos_stock', [
            'stock_item_id' => $stock->id,
            'tipo_movimiento' => 'entrada',
            'cantidad' => 25,
            'stock_anterior' => 10,
            'stock_nuevo' => 35,
            'user_id' => $user->id,
        ]);
    }

    public function test_registrar_entrada_valida_cantidad(): void
    {
        $this->actingAsAdmin();
        $stock = StockItem::factory()->delGeriatrico()->create();

        $response = $this->postJson("/api/stock-items/{$stock->id}/entrada", [
            'cantidad' => 0,
            'motivo' => 'compra',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['cantidad']]);
    }

    public function test_registrar_salida_descuenta_stock(): void
    {
        $this->actingAsAdmin();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 20]);

        $response = $this->postJson("/api/stock-items/{$stock->id}/salida", [
            'cantidad' => 5,
            'motivo' => 'uso_paciente',
            'paciente_id' => $paciente->id,
        ]);

        $response->assertOk();
        $this->assertSame(15, (int) $stock->fresh()->stock_actual);
        $this->assertDatabaseHas('movimientos_stock', [
            'stock_item_id' => $stock->id,
            'tipo_movimiento' => 'salida',
            'cantidad' => 5,
            'stock_anterior' => 20,
            'stock_nuevo' => 15,
            'paciente_id' => $paciente->id,
        ]);
    }

    public function test_registrar_salida_falla_con_stock_insuficiente(): void
    {
        $this->actingAsAdmin();
        $stock = StockItem::factory()->delGeriatrico()->create([
            'nombre' => 'Atorvastatina',
            'stock_actual' => 3,
        ]);

        $response = $this->postJson("/api/stock-items/{$stock->id}/salida", [
            'cantidad' => 10,
            'motivo' => 'uso_paciente',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'StockInsuficienteEnItemException');
        $this->assertSame(3, (int) $stock->fresh()->stock_actual);
        $this->assertDatabaseCount('movimientos_stock', 0);
    }

    public function test_bajo_stock_lista_items_en_o_bajo_minimo(): void
    {
        $this->actingAsAdmin();
        $bajo = StockItem::factory()->delGeriatrico()->create([
            'nombre' => 'A',
            'stock_actual' => 3,
            'stock_minimo' => 5,
        ]);
        StockItem::factory()->delGeriatrico()->create([
            'nombre' => 'B',
            'stock_actual' => 100,
            'stock_minimo' => 5,
        ]);

        $response = $this->getJson('/api/stock-items-bajo-stock');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.id', $bajo->id);
    }

    public function test_proximos_vencer_solo_devuelve_items_con_lotes_proximos(): void
    {
        $this->actingAsAdmin();
        $itemConVencimiento = StockItem::factory()->delGeriatrico()->create();
        $itemSinVencimientoCercano = StockItem::factory()->delGeriatrico()->create();

        LoteStock::factory()->venceEn(15)->conCantidad(50)->create([
            'stock_item_id' => $itemConVencimiento->id,
        ]);
        LoteStock::factory()->venceEn(200)->conCantidad(50)->create([
            'stock_item_id' => $itemSinVencimientoCercano->id,
        ]);

        $response = $this->getJson('/api/stock-items-proximos-vencer');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.id', $itemConVencimiento->id);
    }

    public function test_store_crea_lote_y_movimiento_inicial(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/stock-items', [
            'nombre' => 'Paracetamol',
            'tipo' => 'medicamento',
            'unidad_medida' => 'unidad',
            'stock_actual' => 100,
            'stock_minimo' => 10,
            'propiedad' => 'geriatrico',
            'precio_unitario' => 25,
        ]);

        $response->assertCreated();
        $itemId = $response->json('id');

        $this->assertDatabaseHas('lotes_stock', [
            'stock_item_id' => $itemId,
            'cantidad_inicial' => 100,
            'cantidad_actual' => 100,
            'estado' => 'activo',
        ]);
        $this->assertDatabaseHas('movimientos_stock', [
            'stock_item_id' => $itemId,
            'tipo_movimiento' => 'entrada',
            'cantidad' => 100,
            'stock_anterior' => 0,
            'stock_nuevo' => 100,
            'motivo' => 'stock_inicial_con_lote',
        ]);
    }

    public function test_administrar_medicacion_endpoint_delega_a_registro_service(): void
    {
        $user = $this->actingAsAdmin();
        $paciente = Paciente::factory()->create();
        $stockItem = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 50]);
        $lote = LoteStock::factory()->venceEn(60)->conCantidad(50)->create([
            'stock_item_id' => $stockItem->id,
        ]);
        $medicacion = \App\Models\Medicacion::factory()->create([
            'paciente_id' => $paciente->id,
            'origen_pago' => 'geriatrico',
            'stock_item_id' => $stockItem->id,
        ]);

        $response = $this->postJson('/api/movimientos-stock/administrar', [
            'medicacion_id' => $medicacion->id,
        ]);

        $response->assertOk();
        $response->assertJsonPath('lote_usado', $lote->numero_lote);
        $response->assertJsonPath('stock_restante', 49);
        $this->assertSame(49, (int) $lote->fresh()->cantidad_actual);
        $this->assertDatabaseHas('movimientos_stock', [
            'stock_item_id' => $stockItem->id,
            'tipo_movimiento' => 'salida',
            'user_id' => $user->id,
        ]);
    }
}
