<?php

namespace Tests\Feature;

use App\Models\Medicacion;
use App\Models\Paciente;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MedicacionStoreBatchTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        // Las medicaciones (prescripciones) sólo las puede crear un médico o admin.
        // Este helper mantiene el nombre por compatibilidad con los tests antiguos.
        $user = User::factory()->create(['role' => 'medico']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_crea_multiples_medicaciones_en_un_lote(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $payload = [
            'paciente_id' => $paciente->id,
            'medicamentos' => [
                [
                    'nombre' => 'Paracetamol',
                    'dosis' => '500mg',
                    'frecuencia' => 'cada 8hs',
                    'tipo' => 'diaria',
                    'origen_pago' => 'obra_social',
                ],
                [
                    'nombre' => 'Ibuprofeno',
                    'dosis' => '400mg',
                    'tipo' => 'sos',
                    'origen_pago' => 'obra_social',
                ],
            ],
        ];

        $response = $this->postJson('/api/medicamentos/batch', $payload);

        $response->assertCreated();
        $response->assertJsonCount(2);
        $this->assertDatabaseCount('medicacions', 2);
        $this->assertDatabaseHas('medicacions', [
            'paciente_id' => $paciente->id,
            'nombre' => 'Paracetamol',
        ]);
    }

    public function test_falla_si_stock_geriatrico_pertenece_a_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delPaciente($paciente)->create([
            'nombre' => 'Atorvastatina',
        ]);

        $response = $this->postJson('/api/medicamentos/batch', [
            'paciente_id' => $paciente->id,
            'medicamentos' => [
                [
                    'nombre' => 'Atorvastatina',
                    'origen_pago' => 'geriatrico',
                    'stock_item_id' => $stock->id,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'StockPropietarioMismatchException');
        $this->assertDatabaseCount('medicacions', 0);
    }

    public function test_falla_si_stock_de_paciente_pertenece_a_otro_paciente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $otroPaciente = Paciente::factory()->create();
        $stockDeOtro = StockItem::factory()->delPaciente($otroPaciente)->create([
            'nombre' => 'Losartán',
        ]);

        $response = $this->postJson('/api/medicamentos/batch', [
            'paciente_id' => $paciente->id,
            'medicamentos' => [
                [
                    'nombre' => 'Losartán',
                    'origen_pago' => 'paciente',
                    'stock_item_id' => $stockDeOtro->id,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('code', 'StockPropietarioMismatchException');
        $this->assertDatabaseCount('medicacions', 0);
    }

    public function test_acepta_stock_geriatrico_consistente(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stock = StockItem::factory()->delGeriatrico()->create();

        $response = $this->postJson('/api/medicamentos/batch', [
            'paciente_id' => $paciente->id,
            'medicamentos' => [
                [
                    'nombre' => 'Enalapril',
                    'origen_pago' => 'geriatrico',
                    'stock_item_id' => $stock->id,
                ],
            ],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('medicacions', [
            'nombre' => 'Enalapril',
            'stock_item_id' => $stock->id,
        ]);
    }

    public function test_payload_invalido_devuelve_422_con_errors(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/medicamentos/batch', [
            'paciente_id' => 99999,
            'medicamentos' => [],
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'message',
            'errors' => ['paciente_id', 'medicamentos'],
        ]);
    }

    public function test_rollback_si_segunda_medicacion_falla(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        $stockMal = StockItem::factory()->delPaciente($paciente)->create();

        $response = $this->postJson('/api/medicamentos/batch', [
            'paciente_id' => $paciente->id,
            'medicamentos' => [
                [
                    'nombre' => 'Primera',
                    'origen_pago' => 'obra_social',
                ],
                [
                    'nombre' => 'Segunda',
                    'origen_pago' => 'geriatrico',
                    'stock_item_id' => $stockMal->id,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('medicacions', 0);
    }

    public function test_requiere_autenticacion(): void
    {
        $response = $this->postJson('/api/medicamentos/batch', [
            'paciente_id' => 1,
            'medicamentos' => [
                ['nombre' => 'X', 'origen_pago' => 'obra_social'],
            ],
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('message', 'No autenticado.');
    }
}
