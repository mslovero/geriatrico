<?php

namespace Tests\Feature;

use App\Models\Dieta;
use App\Models\Habitacion;
use App\Models\HistorialMedico;
use App\Models\Incidencia;
use App\Models\Medicacion;
use App\Models\Paciente;
use App\Models\SignoVital;
use App\Models\StockItem;
use App\Models\TurnoMedico;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Verifica que el endpoint de exportación de ficha PDF funciona correctamente
 * con un paciente completo (todos los datos clínicos cargados).
 *
 * El PDF puede tener bugs sutiles (campos que no existen, casts mal, etc.)
 * que solo se detectan al renderizar la vista con datos reales.
 */
class FichaPdfTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    private function pacienteCompleto(): Paciente
    {
        $habitacion = Habitacion::factory()->create(['numero' => '301']);
        $paciente = Paciente::factory()->create([
            'nombre' => 'María',
            'apellido' => 'González',
            'dni' => '14256789',
            'fecha_nacimiento' => '1942-03-12',
            'habitacion_id' => $habitacion->id,
            'medico_cabecera' => 'Dra. Carolina López',
            'patologias' => 'Hipertensión, diabetes tipo 2',
            'estado' => 'activo',
            'contacto_emergencia' => [
                'nombre' => 'Juan González',
                'telefono' => '11 2345-6789',
                'relacion' => 'hijo',
            ],
        ]);

        // Dieta
        Dieta::factory()->create([
            'paciente_id' => $paciente->id,
            'tipo' => 'Diabética',
            'consistencia' => 'Sólida',
            'alergias' => 'Frutos secos',
        ]);

        // Medicaciones
        $stock = StockItem::factory()->delGeriatrico()->create(['nombre' => 'Enalapril 10mg']);
        Medicacion::factory()->count(3)->create([
            'paciente_id' => $paciente->id,
            'stock_item_id' => $stock->id,
        ]);

        // Signos vitales (algunos con valores fuera de rango para badges)
        SignoVital::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha' => now()->subHours(2),
            'temperatura' => 38.5, // fiebre
            'saturacion_oxigeno' => 91, // baja
            'glucosa' => 195, // alta
        ]);
        SignoVital::factory()->count(3)->create([
            'paciente_id' => $paciente->id,
            'fecha' => now()->subDays(3),
        ]);

        // Incidencia
        Incidencia::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->subDays(2),
            'severidad' => 'moderada',
            'acciones_tomadas' => 'Se llamó a emergencias',
        ]);

        // Turno futuro
        TurnoMedico::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha_hora' => now()->addDays(3),
        ]);

        // Historial médico (varios para probar "ultima_revision")
        HistorialMedico::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha' => now()->subMonths(3)->toDateString(),
        ]);
        HistorialMedico::factory()->create([
            'paciente_id' => $paciente->id,
            'fecha' => now()->subDays(10)->toDateString(),
        ]);

        return $paciente;
    }

    public function test_pdf_se_genera_con_paciente_completo(): void
    {
        $this->actingAsStaff();
        $paciente = $this->pacienteCompleto();

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        // Nombre del archivo (las tildes se URL-encodean, así que matcheamos sin ellas)
        $this->assertStringContainsString('Gonz', $response->headers->get('content-disposition'));
        // Magic bytes de PDF
        $this->assertSame('%PDF', substr($response->getContent(), 0, 4));
    }

    public function test_pdf_default_usa_30_dias(): void
    {
        $this->actingAsStaff();
        $paciente = $this->pacienteCompleto();

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf");

        $response->assertOk();
        $this->assertStringContainsString('30dias', $response->headers->get('content-disposition'));
    }

    public function test_pdf_periodo_completo(): void
    {
        $this->actingAsStaff();
        $paciente = $this->pacienteCompleto();

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf?periodo=completo");

        $response->assertOk();
        $this->assertStringContainsString('completo', $response->headers->get('content-disposition'));
    }

    public function test_pdf_periodo_ultima_revision(): void
    {
        $this->actingAsStaff();
        $paciente = $this->pacienteCompleto();

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf?periodo=ultima_revision");

        $response->assertOk();
        $this->assertStringContainsString('ultima_revision', $response->headers->get('content-disposition'));
    }

    public function test_pdf_periodo_invalido_cae_en_default(): void
    {
        $this->actingAsStaff();
        $paciente = $this->pacienteCompleto();

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf?periodo=invalido");

        $response->assertOk();
        $this->assertStringContainsString('30dias', $response->headers->get('content-disposition'));
    }

    public function test_pdf_paciente_sin_datos_no_falla(): void
    {
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create([
            'medico_cabecera' => null,
            'patologias' => null,
            'contacto_emergencia' => null,
        ]);

        $response = $this->get("/api/pacientes/{$paciente->id}/pdf");

        $response->assertOk();
        $this->assertSame('%PDF', substr($response->getContent(), 0, 4));
    }

    public function test_pdf_404_si_paciente_no_existe(): void
    {
        $this->actingAsStaff();

        $response = $this->getJson('/api/pacientes/9999/pdf');

        $response->assertStatus(404);
    }

    public function test_pdf_requiere_autenticacion(): void
    {
        $response = $this->getJson('/api/pacientes/1/pdf');

        $response->assertStatus(401);
    }
}
