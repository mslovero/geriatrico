<?php

namespace Tests\Feature;

use App\Models\LoteStock;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LotesStockTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        // Stock y lotes los gestiona admin, medico o administrativo.
        $user = User::factory()->create(['role' => 'administrativo']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_paginado_ordenado_por_vencimiento(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create();
        LoteStock::factory()->venceEn(90)->create(['stock_item_id' => $stock->id]);
        LoteStock::factory()->venceEn(15)->create(['stock_item_id' => $stock->id]);

        $response = $this->getJson('/api/lotes-stock');

        $response->assertOk();
        $response->assertJsonStructure(['data', 'current_page', 'total']);
        $primeros = $response->json('data');
        $this->assertLessThanOrEqual(
            strtotime($primeros[1]['fecha_vencimiento']),
            strtotime($primeros[0]['fecha_vencimiento']),
        );
    }

    public function test_index_filtra_por_estado(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create();
        LoteStock::factory()->venceEn(60)->create(['stock_item_id' => $stock->id]);
        LoteStock::factory()->vencido()->create(['stock_item_id' => $stock->id]);

        $response = $this->getJson('/api/lotes-stock?estado=activo');

        $response->assertOk();
        foreach ($response->json('data') as $lote) {
            $this->assertSame('activo', $lote['estado']);
        }
    }

    public function test_store_crea_lote_y_recalcula_stock(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 0]);

        $response = $this->postJson('/api/lotes-stock', [
            'stock_item_id' => $stock->id,
            'numero_lote' => 'LOTE-2030-001',
            'fecha_vencimiento' => now()->addYear()->toDateString(),
            'cantidad_inicial' => 100,
            'precio_compra' => 25.50,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('lotes_stock', [
            'numero_lote' => 'LOTE-2030-001',
            'cantidad_inicial' => 100,
            'cantidad_actual' => 100,
        ]);
        $this->assertSame(100, (int) $stock->fresh()->stock_actual);
        $this->assertDatabaseHas('movimientos_stock', [
            'stock_item_id' => $stock->id,
            'tipo_movimiento' => 'entrada',
            'motivo' => 'compra_lote',
            'cantidad' => 100,
        ]);
    }

    public function test_store_rechaza_lote_vencido(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create();

        $response = $this->postJson('/api/lotes-stock', [
            'stock_item_id' => $stock->id,
            'numero_lote' => 'VIEJO-001',
            'fecha_vencimiento' => now()->subDay()->toDateString(),
            'cantidad_inicial' => 50,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['fecha_vencimiento']]);
    }

    public function test_update_no_permite_cantidad_mayor_a_la_inicial(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create();
        $lote = LoteStock::factory()->venceEn(60)->conCantidad(50)->create([
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->putJson("/api/lotes-stock/{$lote->id}", [
            'cantidad_actual' => 999,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('error', 'La cantidad actual no puede ser mayor a la cantidad inicial del lote');
    }

    public function test_update_descuenta_cantidad_y_actualiza_estado_agotado(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create();
        $lote = LoteStock::factory()->venceEn(60)->conCantidad(10)->create([
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->putJson("/api/lotes-stock/{$lote->id}", [
            'cantidad_actual' => 0,
        ]);

        $response->assertOk();
        $this->assertSame('agotado', $lote->fresh()->estado);
    }

    public function test_destroy_solo_admin_y_recalcula_stock(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);
        $stock = StockItem::factory()->delGeriatrico()->create(['stock_actual' => 50]);
        $lote = LoteStock::factory()->venceEn(60)->conCantidad(50)->create([
            'stock_item_id' => $stock->id,
        ]);

        $response = $this->deleteJson("/api/lotes-stock/{$lote->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('lotes_stock', ['id' => $lote->id]);
        $this->assertSame(0, (int) $stock->fresh()->stock_actual);
    }
}
