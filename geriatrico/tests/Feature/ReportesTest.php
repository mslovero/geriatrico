<?php

namespace Tests\Feature;

use App\Models\MovimientoStock;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_consumo_geriatrico_filtra_por_propiedad_y_periodo(): void
    {
        $this->actingAsStaff();

        $stockGeriatrico = StockItem::factory()->delGeriatrico()->create(['nombre' => 'Paracetamol']);
        $paciente = Paciente::factory()->create();
        $stockPaciente = StockItem::factory()->delPaciente($paciente)->create(['nombre' => 'Atorvastatina']);

        MovimientoStock::factory()->create([
            'stock_item_id' => $stockGeriatrico->id,
            'cantidad' => 3,
            'precio_total' => 300,
            'created_at' => now()->subDays(5),
        ]);
        MovimientoStock::factory()->create([
            'stock_item_id' => $stockPaciente->id,
            'cantidad' => 99,
            'precio_total' => 9999,
            'created_at' => now()->subDays(5),
        ]);
        MovimientoStock::factory()->create([
            'stock_item_id' => $stockGeriatrico->id,
            'cantidad' => 1000,
            'precio_total' => 50000,
            'created_at' => now()->subYear(),
        ]);

        $response = $this->getJson('/api/reportes/consumo-geriatrico?fecha_desde='
            .now()->subDays(30)->toDateString()
            .'&fecha_hasta='.now()->toDateString());

        $response->assertOk();
        $this->assertEqualsWithDelta(300, $response->json('total_costo'), 0.001);
        $response->assertJsonPath('total_movimientos', 1);
        $response->assertJsonCount(1, 'por_item');
        $response->assertJsonPath('por_item.0.nombre', 'Paracetamol');
        $response->assertJsonPath('por_item.0.cantidad_total', 3);
    }

    public function test_consumo_paciente_solo_devuelve_movimientos_del_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $otroPaciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();

        MovimientoStock::factory()->create([
            'stock_item_id' => $stock->id,
            'paciente_id' => $paciente->id,
            'cantidad' => 2,
            'precio_total' => 200,
            'created_at' => now()->subDays(2),
        ]);
        MovimientoStock::factory()->create([
            'stock_item_id' => $stock->id,
            'paciente_id' => $otroPaciente->id,
            'cantidad' => 50,
            'precio_total' => 5000,
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->getJson("/api/reportes/consumo-paciente/{$paciente->id}");

        $response->assertOk();
        $response->assertJsonPath('paciente.id', $paciente->id);
        $this->assertEqualsWithDelta(200, $response->json('total_costo'), 0.001);
        $response->assertJsonPath('total_movimientos', 1);
    }

    public function test_consumo_paciente_404_si_no_existe(): void
    {
        $this->actingAsStaff();

        $response = $this->getJson('/api/reportes/consumo-paciente/9999');

        $response->assertStatus(404);
        $response->assertJsonPath('message', 'Recurso no encontrado.');
    }

    public function test_costos_mensuales_agrega_por_mes(): void
    {
        $this->actingAsStaff();
        $stock = StockItem::factory()->delGeriatrico()->create();
        $anio = now()->year;

        MovimientoStock::factory()->count(2)->create([
            'stock_item_id' => $stock->id,
            'precio_total' => 100,
            'created_at' => now()->setDate($anio, 1, 15),
        ]);
        MovimientoStock::factory()->create([
            'stock_item_id' => $stock->id,
            'precio_total' => 300,
            'created_at' => now()->setDate($anio, 6, 10),
        ]);

        $response = $this->getJson("/api/reportes/costos-mensuales?anio={$anio}");

        $response->assertOk();
        $response->assertJsonPath('anio', $anio);
        $this->assertEqualsWithDelta(500, $response->json('total_anual'), 0.001);

        $porMes = collect($response->json('por_mes'));
        $this->assertEqualsWithDelta(200, (float) $porMes->firstWhere('mes', 1)['total_costo'], 0.001);
        $this->assertEqualsWithDelta(300, (float) $porMes->firstWhere('mes', 6)['total_costo'], 0.001);
    }

    public function test_costos_mensuales_valida_anio(): void
    {
        $this->actingAsStaff();

        $response = $this->getJson('/api/reportes/costos-mensuales?anio=1990');

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors' => ['anio']]);
    }

    public function test_stock_geriatrico_calcula_valor_total(): void
    {
        $this->actingAsStaff();
        StockItem::factory()->delGeriatrico()->create([
            'stock_actual' => 10,
            'precio_unitario' => 50,
            'stock_minimo' => 5,
        ]);
        StockItem::factory()->delGeriatrico()->create([
            'stock_actual' => 4,
            'precio_unitario' => 25,
            'stock_minimo' => 5,
        ]);
        $paciente = Paciente::factory()->create();
        StockItem::factory()->delPaciente($paciente)->create([
            'stock_actual' => 999,
            'precio_unitario' => 999,
        ]);

        $response = $this->getJson('/api/reportes/stock-geriatrico');

        $response->assertOk();
        $response->assertJsonPath('resumen.total_items', 2);
        $this->assertEqualsWithDelta(600, $response->json('resumen.valor_total'), 0.001);
        $response->assertJsonPath('resumen.bajo_stock', 1);
    }

    public function test_top_medicamentos_ordena_por_cantidad_descendente(): void
    {
        $this->actingAsStaff();
        $a = StockItem::factory()->delGeriatrico()->create(['nombre' => 'A']);
        $b = StockItem::factory()->delGeriatrico()->create(['nombre' => 'B']);
        $c = StockItem::factory()->delGeriatrico()->create(['nombre' => 'C']);

        MovimientoStock::factory()->create(['stock_item_id' => $a->id, 'cantidad' => 10, 'created_at' => now()->subDays(2)]);
        MovimientoStock::factory()->create(['stock_item_id' => $b->id, 'cantidad' => 50, 'created_at' => now()->subDays(2)]);
        MovimientoStock::factory()->create(['stock_item_id' => $c->id, 'cantidad' => 30, 'created_at' => now()->subDays(2)]);

        $response = $this->getJson('/api/reportes/top-medicamentos?limite=2');

        $response->assertOk();
        $response->assertJsonCount(2, 'top_medicamentos');
        $response->assertJsonPath('top_medicamentos.0.nombre', 'B');
        $response->assertJsonPath('top_medicamentos.1.nombre', 'C');
    }

    public function test_resumen_general_consolida_metricas(): void
    {
        $this->actingAsStaff();
        $stockGeriatrico = StockItem::factory()->delGeriatrico()->create([
            'stock_actual' => 10,
            'precio_unitario' => 100,
        ]);
        $paciente = Paciente::factory()->create();
        StockItem::factory()->delPaciente($paciente)->create(['stock_actual' => 5, 'precio_unitario' => 40]);

        MovimientoStock::factory()->create([
            'stock_item_id' => $stockGeriatrico->id,
            'precio_total' => 250,
            'created_at' => now()->startOfMonth()->addDays(3),
        ]);

        $response = $this->getJson('/api/reportes/resumen-general');

        $response->assertOk();
        $response->assertJsonPath('stock_geriatrico.total_items', 1);
        $this->assertEqualsWithDelta(1000, $response->json('stock_geriatrico.valor_total'), 0.001);
        $response->assertJsonPath('stock_pacientes.total_items', 1);
        $this->assertEqualsWithDelta(200, $response->json('stock_pacientes.valor_total'), 0.001);
        $this->assertEqualsWithDelta(250, $response->json('costos_mes_actual'), 0.001);
    }

    public function test_top_medicamentos_valida_limite(): void
    {
        $this->actingAsStaff();

        $response = $this->getJson('/api/reportes/top-medicamentos?limite=999');

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['limite']]);
    }
}
