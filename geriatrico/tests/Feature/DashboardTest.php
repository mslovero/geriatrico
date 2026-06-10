<?php

namespace Tests\Feature;

use App\Models\Cama;
use App\Models\Notification;
use App\Models\Paciente;
use App\Models\SignoVital;
use App\Models\StockItem;
use App\Models\TurnoMedico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_dashboard_consolida_metricas(): void
    {
        $this->actingAsStaff();
        Paciente::factory()->count(2)->create(['estado' => 'activo']);
        Paciente::factory()->create(['estado' => 'fallecido']);
        Cama::factory()->count(3)->create(['estado' => 'libre']);
        Cama::factory()->count(2)->create(['estado' => 'ocupada']);
        StockItem::factory()->delGeriatrico()->create([
            'stock_actual' => 0,
            'stock_minimo' => 5,
            'activo' => true,
        ]);

        $response = $this->getJson('/api/dashboard-stats');

        $response->assertOk();
        $response->assertJsonPath('summary.pacientes', 2);
        $response->assertJsonPath('summary.camas.total', 5);
        $response->assertJsonPath('summary.camas.ocupadas', 2);
        $response->assertJsonPath('summary.camas.libres', 3);
        $response->assertJsonPath('summary.camas.porcentaje', 40);
        $response->assertJsonPath('summary.bajo_stock', 1);
    }

    public function test_dashboard_lista_turnos_proximos_48hs(): void
    {
        $this->actingAsStaff();
        TurnoMedico::factory()->create([
            'fecha_hora' => now()->addHours(12),
            'estado' => 'pendiente',
        ]);
        TurnoMedico::factory()->create([
            'fecha_hora' => now()->addDays(10),
            'estado' => 'pendiente',
        ]);

        $response = $this->getJson('/api/dashboard-stats');

        $response->assertOk();
        $this->assertCount(1, $response->json('turnos_proximos'));
    }

    public function test_dashboard_lista_alertas_salud(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();
        SignoVital::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha' => now()->subHours(2),
            'temperatura' => 39.0,
        ]);
        SignoVital::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha' => now()->subHours(2),
            'temperatura' => 36.5,
        ]);

        $response = $this->getJson('/api/dashboard-stats');

        $response->assertOk();
        $response->assertJsonPath('summary.alertas_salud', 1);
        $this->assertCount(1, $response->json('alertas_salud_detalles'));
    }

    public function test_dashboard_incluye_ultimas_notificaciones(): void
    {
        $this->actingAsStaff();
        Notification::factory()->count(7)->create();

        $response = $this->getJson('/api/dashboard-stats');

        $response->assertOk();
        $this->assertCount(5, $response->json('notificaciones'));
    }

    public function test_dashboard_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/dashboard-stats');

        $response->assertStatus(401);
    }
}
