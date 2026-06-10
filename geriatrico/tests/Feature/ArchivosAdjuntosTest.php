<?php

namespace Tests\Feature;

use App\Models\ArchivoAdjunto;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArchivosAdjuntosTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_archivos_paginados(): void
    {
        $this->actingAsStaff();
        ArchivoAdjunto::factory()->count(3)->create();

        $response = $this->getJson('/api/archivos-adjuntos');

        $response->assertOk();
        $response->assertJsonStructure(['data', 'current_page', 'total']);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_store_sube_archivo_y_persiste_referencia(): void
    {
        Storage::fake('public');
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/archivos-adjuntos', [
            'paciente_id' => $paciente->id,
            'tipo' => 'estudio',
            'archivo' => UploadedFile::fake()->create('estudio.pdf', 200, 'application/pdf'),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Archivo subido correctamente');
        $this->assertDatabaseHas('archivos_adjuntos', [
            'paciente_id' => $paciente->id,
            'tipo' => 'estudio',
        ]);
        $archivo = ArchivoAdjunto::first();
        Storage::disk('public')->assertExists($archivo->ruta_archivo);
    }

    public function test_store_valida_tipo_de_archivo(): void
    {
        Storage::fake('public');
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/archivos-adjuntos', [
            'paciente_id' => $paciente->id,
            'tipo' => 'documento',
            'archivo' => UploadedFile::fake()->create('virus.exe', 50, 'application/x-msdownload'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['archivo']]);
    }

    public function test_store_valida_tamanio_maximo(): void
    {
        Storage::fake('public');
        $this->actingAsStaff();
        $paciente = Paciente::factory()->create();

        $response = $this->postJson('/api/archivos-adjuntos', [
            'paciente_id' => $paciente->id,
            'tipo' => 'documento',
            'archivo' => UploadedFile::fake()->create('grande.pdf', 11000, 'application/pdf'),
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['archivo']]);
    }

    public function test_destroy_elimina_archivo_y_storage(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/archivos-adjuntos', [
            'paciente_id' => Paciente::factory()->create()->id,
            'tipo' => 'estudio',
            'archivo' => UploadedFile::fake()->create('a.pdf', 100, 'application/pdf'),
        ])->assertCreated();

        $archivo = ArchivoAdjunto::first();

        $response = $this->deleteJson("/api/archivos-adjuntos/{$archivo->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('archivos_adjuntos', ['id' => $archivo->id]);
        Storage::disk('public')->assertMissing($archivo->ruta_archivo);
    }

    public function test_destroy_rechaza_no_admin(): void
    {
        $this->actingAsStaff();
        $archivo = ArchivoAdjunto::factory()->create();

        $response = $this->deleteJson("/api/archivos-adjuntos/{$archivo->id}");

        $response->assertStatus(403);
    }
}
