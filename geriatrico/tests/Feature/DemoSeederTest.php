<?php

namespace Tests\Feature;

use App\Models\Cama;
use App\Models\Dieta;
use App\Models\Habitacion;
use App\Models\Incidencia;
use App\Models\LoteStock;
use App\Models\Medicacion;
use App\Models\Paciente;
use App\Models\Proveedor;
use App\Models\SignoVital;
use App\Models\StockItem;
use App\Models\TurnoMedico;
use App\Models\User;
use Database\Seeders\DemoSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeders_generan_entorno_completo(): void
    {
        $this->seed(UserSeeder::class);
        $this->seed(DemoSeeder::class);

        $this->assertSame(4, User::count(), 'Deben crearse 4 usuarios con rol');
        $this->assertSame(1, User::where('role', 'admin')->count());
        $this->assertSame(1, User::where('role', 'medico')->count());
        $this->assertSame(1, User::where('role', 'enfermero')->count());
        $this->assertSame(1, User::where('role', 'administrativo')->count());

        $this->assertSame(2, Proveedor::count());
        $this->assertSame(4, Habitacion::count());
        $this->assertSame(9, Cama::count(), 'Suma de capacidades');
        $this->assertSame(6, Paciente::count());
        $this->assertGreaterThanOrEqual(6, Cama::where('estado', 'ocupada')->count());

        // 8 del catálogo + 1 creado por MedicacionObserver para medicación con origen "paciente"
        $this->assertSame(9, StockItem::count());
        $this->assertGreaterThanOrEqual(7, LoteStock::count());
        $this->assertSame(11, Medicacion::count());
        $this->assertGreaterThanOrEqual(24, SignoVital::count());
        $this->assertSame(2, Incidencia::count());
        $this->assertSame(3, TurnoMedico::count());
        $this->assertSame(3, Dieta::count());
    }
}
