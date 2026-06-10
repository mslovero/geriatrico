<?php

namespace Tests\Feature;

use App\Models\Proveedor;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProveedoresTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_lista_proveedores_con_conteo(): void
    {
        $this->actingAsStaff();
        $proveedor = Proveedor::factory()->create();
        StockItem::factory()->count(2)->create(['proveedor_id' => $proveedor->id]);

        $response = $this->getJson('/api/proveedores');

        $response->assertOk();
        $registro = collect($response->json())->firstWhere('id', $proveedor->id);
        $this->assertSame(2, $registro['stock_items_count']);
    }

    public function test_store_crea_proveedor(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/proveedores', [
            'nombre' => 'Droguería del Sud',
            'cuit' => '30-12345678-9',
            'email' => 'contacto@droguerias.test',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('proveedores', [
            'nombre' => 'Droguería del Sud',
            'cuit' => '30-12345678-9',
        ]);
    }

    public function test_store_valida_nombre_obligatorio(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/proveedores', [
            'cuit' => '30-12345678-9',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['nombre']]);
    }

    public function test_store_valida_email(): void
    {
        $this->actingAsStaff();

        $response = $this->postJson('/api/proveedores', [
            'nombre' => 'Test',
            'email' => 'no-es-email',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['errors' => ['email']]);
    }

    public function test_show_devuelve_proveedor_con_items(): void
    {
        $this->actingAsStaff();
        $proveedor = Proveedor::factory()->create();
        StockItem::factory()->create(['proveedor_id' => $proveedor->id]);

        $response = $this->getJson("/api/proveedores/{$proveedor->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $proveedor->id);
        $this->assertCount(1, $response->json('stock_items'));
    }

    public function test_update_modifica_proveedor(): void
    {
        $this->actingAsStaff();
        $proveedor = Proveedor::factory()->create(['telefono' => '111-1111']);

        $response = $this->putJson("/api/proveedores/{$proveedor->id}", [
            'telefono' => '999-9999',
        ]);

        $response->assertOk();
        $this->assertSame('999-9999', $proveedor->fresh()->telefono);
    }

    public function test_destroy_elimina_proveedor(): void
    {
        $this->actingAsStaff();
        $proveedor = Proveedor::factory()->create();

        $response = $this->deleteJson("/api/proveedores/{$proveedor->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('proveedores', ['id' => $proveedor->id]);
    }
}
