<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsStaff(): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_index_devuelve_notificaciones_globales_y_del_usuario(): void
    {
        $user = $this->actingAsStaff();
        Notification::factory()->create(['user_id' => null]);
        Notification::factory()->create(['user_id' => $user->id]);
        Notification::factory()->create(['user_id' => User::factory()->create()->id]);

        $response = $this->getJson('/api/notificaciones');

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    public function test_no_leidas_devuelve_solo_no_leidas_y_total(): void
    {
        $this->actingAsStaff();
        Notification::factory()->count(3)->create(['user_id' => null]);
        Notification::factory()->leida()->count(2)->create(['user_id' => null]);

        $response = $this->getJson('/api/notificaciones/no-leidas');

        $response->assertOk();
        $response->assertJsonPath('total_no_leidas', 3);
        $this->assertCount(3, $response->json('notificaciones'));
    }

    public function test_marcar_leida_actualiza_estado(): void
    {
        $this->actingAsStaff();
        $notif = Notification::factory()->create(['user_id' => null]);

        $response = $this->postJson("/api/notificaciones/{$notif->id}/marcar-leida");

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $this->assertTrue($notif->fresh()->leida);
        $this->assertNotNull($notif->fresh()->leida_at);
    }

    public function test_marcar_todas_leidas(): void
    {
        $this->actingAsStaff();
        Notification::factory()->count(3)->create(['user_id' => null]);

        $response = $this->postJson('/api/notificaciones/marcar-todas-leidas');

        $response->assertOk();
        $this->assertSame(0, Notification::where('leida', false)->count());
    }

    public function test_destroy_elimina_notificacion(): void
    {
        $this->actingAsStaff();
        $notif = Notification::factory()->create(['user_id' => null]);

        $response = $this->deleteJson("/api/notificaciones/{$notif->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('notifications', ['id' => $notif->id]);
    }

    public function test_resumen_devuelve_conteo_por_tipo(): void
    {
        $this->actingAsStaff();
        Notification::factory()->create(['user_id' => null, 'tipo' => 'incidencia']);
        Notification::factory()->count(2)->create(['user_id' => null, 'tipo' => 'stock_bajo']);

        $response = $this->getJson('/api/notificaciones/resumen');

        $response->assertOk();
        $response->assertJsonPath('total_no_leidas', 3);
        $response->assertJsonPath('por_tipo.stock_bajo', 2);
        $response->assertJsonPath('por_tipo.incidencia', 1);
    }
}
