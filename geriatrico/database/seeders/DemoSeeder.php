<?php

namespace Database\Seeders;

use App\Models\Cama;
use App\Models\Dieta;
use App\Models\Habitacion;
use App\Models\HistorialMedico;
use App\Models\Incidencia;
use App\Models\LoteStock;
use App\Models\Medicacion;
use App\Models\Notification;
use App\Models\Paciente;
use App\Models\Proveedor;
use App\Models\SignoVital;
use App\Models\StockItem;
use App\Models\TurnoMedico;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Personal para asignar como reporteros
        $admin = User::where('email', 'admin@geriatrico.test')->first();
        $medico = User::where('email', 'medico@geriatrico.test')->first();
        $enfermera = User::where('email', 'enfermera@geriatrico.test')->first();

        // === Proveedores ===
        $drogueria = Proveedor::create([
            'nombre' => 'Droguería del Sud',
            'razon_social' => 'Droguería del Sud S.A.',
            'cuit' => '30-12345678-9',
            'telefono' => '011 4444-5555',
            'email' => 'contacto@drogueriasud.test',
            'direccion' => 'Av. Belgrano 1234, CABA',
        ]);

        $kohler = Proveedor::create([
            'nombre' => 'Kohler Insumos Médicos',
            'razon_social' => 'Kohler S.R.L.',
            'cuit' => '30-87654321-7',
            'telefono' => '011 5555-7777',
            'email' => 'ventas@kohler.test',
            'direccion' => 'Calle Falsa 456, San Isidro',
        ]);

        // === Habitaciones y camas ===
        $habitaciones = [];
        foreach ([['101', 1, 2], ['102', 1, 2], ['201', 2, 3], ['202', 2, 2]] as [$num, $piso, $cap]) {
            $habitaciones[$num] = Habitacion::create([
                'numero' => $num,
                'capacidad' => $cap,
                // 'piso' => $piso, // sólo si el campo existe en la migration
            ]);
            for ($i = 1; $i <= $cap; $i++) {
                Cama::create([
                    'habitacion_id' => $habitaciones[$num]->id,
                    'numero_cama' => "{$num}-" . chr(64 + $i),
                    'estado' => 'libre',
                ]);
            }
        }

        // === Pacientes ===
        $pacientesData = [
            ['nombre' => 'María', 'apellido' => 'González', 'dni' => '14256789', 'fecha' => '1942-03-12', 'med' => 'Dra. Carolina López', 'pat' => 'Hipertensión, diabetes tipo 2'],
            ['nombre' => 'Juan', 'apellido' => 'Pérez', 'dni' => '11234567', 'fecha' => '1938-08-25', 'med' => 'Dr. Martín Rivero', 'pat' => 'EPOC, artrosis'],
            ['nombre' => 'Rosa', 'apellido' => 'Fernández', 'dni' => '13987654', 'fecha' => '1945-11-03', 'med' => 'Dra. Carolina López', 'pat' => 'Alzheimer moderado'],
            ['nombre' => 'Carlos', 'apellido' => 'Romero', 'dni' => '10456321', 'fecha' => '1935-01-18', 'med' => 'Dr. Martín Rivero', 'pat' => 'Insuficiencia cardíaca'],
            ['nombre' => 'Elena', 'apellido' => 'Martínez', 'dni' => '12876543', 'fecha' => '1948-06-09', 'med' => 'Dra. Carolina López', 'pat' => 'Diabetes tipo 2'],
            ['nombre' => 'Roberto', 'apellido' => 'Suárez', 'dni' => '11765432', 'fecha' => '1940-12-22', 'med' => 'Dr. Martín Rivero', 'pat' => 'Parkinson inicial'],
        ];

        $pacientes = [];
        $camasLibres = Cama::where('estado', 'libre')->orderBy('id')->get();
        foreach ($pacientesData as $idx => $data) {
            $cama = $camasLibres[$idx] ?? null;
            $paciente = Paciente::create([
                'nombre' => $data['nombre'],
                'apellido' => $data['apellido'],
                'dni' => $data['dni'],
                'fecha_nacimiento' => $data['fecha'],
                'habitacion_id' => $cama?->habitacion_id,
                'cama_id' => $cama?->id,
                'medico_cabecera' => $data['med'],
                'patologias' => $data['pat'],
                'estado' => 'activo',
                'contacto_emergencia' => [
                    'nombre' => 'Familiar de ' . $data['nombre'],
                    'telefono' => '11 2345-' . str_pad((string) random_int(1000, 9999), 4, '0'),
                    'relacion' => 'hijo/a',
                ],
            ]);
            $cama?->update(['estado' => 'ocupada']);
            $pacientes[] = $paciente;
        }

        // === Stock items + lotes ===
        $catalogo = [
            ['nombre' => 'Enalapril 10mg', 'unidad' => 'pastilla', 'presentacion' => 'blister', 'factor' => 20, 'stock' => 5, 'min' => 30, 'precio' => 15.50],
            ['nombre' => 'Metformina 850mg', 'unidad' => 'pastilla', 'presentacion' => 'blister', 'factor' => 30, 'stock' => 120, 'min' => 60, 'precio' => 18.00],
            ['nombre' => 'Paracetamol 500mg', 'unidad' => 'pastilla', 'presentacion' => 'blister', 'factor' => 10, 'stock' => 80, 'min' => 50, 'precio' => 5.00],
            ['nombre' => 'Atorvastatina 20mg', 'unidad' => 'pastilla', 'presentacion' => 'blister', 'factor' => 28, 'stock' => 0, 'min' => 20, 'precio' => 35.00],
            ['nombre' => 'Insulina NPH 100UI/ml', 'unidad' => 'unidad', 'presentacion' => 'pen', 'factor' => 100, 'stock' => 300, 'min' => 100, 'precio' => 850.00],
            ['nombre' => 'Furosemida 40mg', 'unidad' => 'pastilla', 'presentacion' => 'blister', 'factor' => 20, 'stock' => 60, 'min' => 30, 'precio' => 12.00],
            ['nombre' => 'Levodopa 250mg', 'unidad' => 'pastilla', 'presentacion' => 'blister', 'factor' => 30, 'stock' => 90, 'min' => 60, 'precio' => 45.00],
            ['nombre' => 'Jeringa 5ml', 'unidad' => 'unidad', 'presentacion' => 'caja', 'factor' => 100, 'stock' => 200, 'min' => 150, 'precio' => 2.50],
        ];

        $stocks = [];
        foreach ($catalogo as $item) {
            $stockItem = StockItem::create([
                'nombre' => $item['nombre'],
                'tipo' => str_contains($item['nombre'], 'Jeringa') ? 'insumo' : 'medicamento',
                'unidad_medida' => $item['unidad'],
                'unidad_presentacion' => $item['presentacion'],
                'factor_conversion' => $item['factor'],
                'stock_actual' => $item['stock'],
                'stock_minimo' => $item['min'],
                'precio_unitario' => $item['precio'],
                'propiedad' => 'geriatrico',
                'proveedor_id' => $item['precio'] > 100 ? $kohler->id : $drogueria->id,
                'activo' => true,
            ]);
            $stocks[] = $stockItem;

            // Crear lote sólo si hay stock — alguno vencido, otro próximo a vencer
            if ($item['stock'] > 0) {
                $fechaVencimiento = match (true) {
                    $item['nombre'] === 'Furosemida 40mg' => now()->addDays(15)->toDateString(), // próximo a vencer
                    $item['nombre'] === 'Paracetamol 500mg' => now()->addDays(10)->toDateString(), // próximo a vencer
                    default => now()->addMonths(random_int(6, 18))->toDateString(),
                };

                LoteStock::create([
                    'stock_item_id' => $stockItem->id,
                    'numero_lote' => 'LOTE-' . strtoupper(substr($item['nombre'], 0, 3)) . '-' . random_int(1000, 9999),
                    'fecha_vencimiento' => $fechaVencimiento,
                    'fecha_ingreso' => now()->subDays(random_int(5, 30))->toDateString(),
                    'cantidad_inicial' => $item['stock'],
                    'cantidad_actual' => $item['stock'],
                    'precio_compra' => $item['precio'] * 0.85,
                    'estado' => 'activo',
                ]);
            }
        }

        // === Medicaciones por paciente (uso del catálogo de stock) ===
        $medicacionesPlan = [
            // [paciente_idx, stock_idx, dosis, frecuencia, origen, tipo]
            [0, 0, '10mg', 'cada 12hs', 'geriatrico', 'diaria'], // María - Enalapril
            [0, 1, '850mg', 'cada 12hs con comidas', 'geriatrico', 'diaria'], // María - Metformina
            [0, 2, '500mg', 'cada 8hs según necesidad', 'obra_social', 'sos'], // María - Paracetamol
            [1, 5, '40mg', '1 vez al día', 'geriatrico', 'diaria'], // Juan - Furosemida
            [1, 2, '500mg', 'cada 6hs si dolor', 'obra_social', 'sos'], // Juan - Paracetamol
            [2, 0, '10mg', 'cada 12hs', 'geriatrico', 'diaria'], // Rosa - Enalapril
            [3, 5, '40mg', '1 vez al día', 'geriatrico', 'diaria'], // Carlos - Furosemida
            [3, 3, '20mg', '1 vez por la noche', 'paciente', 'diaria'], // Carlos - Atorvastatina (sin stock!)
            [4, 1, '850mg', 'cada 12hs con comidas', 'geriatrico', 'diaria'], // Elena - Metformina
            [4, 4, '20 UI', 'antes del desayuno', 'obra_social', 'diaria'], // Elena - Insulina
            [5, 6, '250mg', 'cada 8hs', 'geriatrico', 'diaria'], // Roberto - Levodopa
        ];

        foreach ($medicacionesPlan as $plan) {
            [$pIdx, $sIdx, $dosis, $frec, $origen, $tipo] = $plan;
            $paciente = $pacientes[$pIdx];
            $stock = $stocks[$sIdx];

            Medicacion::create([
                'nombre' => $stock->nombre,
                'dosis' => $dosis,
                'frecuencia' => $frec,
                'tipo' => $tipo,
                'origen_pago' => $origen,
                'stock_item_id' => $origen === 'geriatrico' ? $stock->id : null,
                'paciente_id' => $paciente->id,
                'fecha_inicio' => now()->subMonths(random_int(1, 6))->toDateString(),
                'cantidad_mensual' => $tipo === 'diaria' ? 60 : null,
            ]);
        }

        // === Signos vitales (algunos con alertas) ===
        foreach ($pacientes as $i => $p) {
            for ($d = 0; $d < 4; $d++) {
                $esAlerta = $d === 0 && in_array($i, [1, 3]); // Juan y Carlos hoy con alerta
                SignoVital::create([
                    'paciente_id' => $p->id,
                    'fecha' => now()->subDays($d)->subHours(random_int(0, 8)),
                    'presion_arterial' => $esAlerta ? '160/95' : random_int(110, 130) . '/' . random_int(65, 85),
                    'temperatura' => $esAlerta ? 38.5 : 36.0 + (random_int(0, 12) / 10),
                    'frecuencia_cardiaca' => $esAlerta ? 105 : random_int(65, 90),
                    'saturacion_oxigeno' => $esAlerta ? 91 : random_int(95, 99),
                    'glucosa' => $esAlerta ? 195 : random_int(80, 130),
                    'registrado_por' => $enfermera?->name ?? 'Sistema',
                    'observaciones' => $esAlerta ? 'Paciente con signos de descompensación, alertar al médico' : null,
                ]);
            }
        }

        // === Incidencias ===
        Incidencia::create([
            'paciente_id' => $pacientes[2]->id,
            'user_id' => $enfermera?->id,
            'fecha_hora' => now()->subDays(2)->setTime(14, 30),
            'tipo' => 'Caída',
            'severidad' => 'moderada',
            'descripcion' => 'Paciente cayó en el baño al intentar levantarse sin ayuda. Sin lesiones visibles pero con dolor en cadera izquierda.',
            'acciones_tomadas' => 'Se solicitó evaluación traumatológica de control. Reforzar uso de andador.',
        ]);

        Incidencia::create([
            'paciente_id' => $pacientes[3]->id,
            'user_id' => $medico?->id,
            'fecha_hora' => now()->subHours(8),
            'tipo' => 'Médico',
            'severidad' => 'grave',
            'descripcion' => 'Episodio de disnea súbita con desaturación. Atendido por médico de guardia y enfermería.',
            'acciones_tomadas' => 'Oxigenoterapia 3L/min, control con cardiología. Mejora luego de 1h.',
        ]);

        // === Turnos próximos ===
        TurnoMedico::create([
            'paciente_id' => $pacientes[0]->id,
            'profesional' => 'Dr. Acosta',
            'especialidad' => 'Endocrinología',
            'fecha_hora' => now()->addHours(20),
            'lugar' => 'Hospital Italiano - 4° piso',
            'estado' => 'pendiente',
        ]);

        TurnoMedico::create([
            'paciente_id' => $pacientes[3]->id,
            'profesional' => 'Dra. Ramírez',
            'especialidad' => 'Cardiología',
            'fecha_hora' => now()->addDays(2)->setTime(10, 0),
            'lugar' => 'Consultorio externo',
            'estado' => 'pendiente',
        ]);

        TurnoMedico::create([
            'paciente_id' => $pacientes[5]->id,
            'profesional' => 'Dr. Bianchi',
            'especialidad' => 'Neurología',
            'fecha_hora' => now()->addDays(7)->setTime(15, 30),
            'lugar' => 'Sanatorio Mater Dei',
            'estado' => 'pendiente',
        ]);

        // === Dietas ===
        Dieta::create([
            'paciente_id' => $pacientes[0]->id,
            'tipo' => 'Diabética',
            'consistencia' => 'Sólida',
            'alergias' => 'Sin alergias conocidas',
            'observaciones' => 'Sin azúcar agregada, controlar carbohidratos.',
        ]);

        Dieta::create([
            'paciente_id' => $pacientes[2]->id,
            'tipo' => 'General',
            'consistencia' => 'Papilla',
            'alergias' => 'Frutos secos',
            'observaciones' => 'Asistencia para alimentación. Evitar líquidos finos.',
        ]);

        Dieta::create([
            'paciente_id' => $pacientes[3]->id,
            'tipo' => 'Hiposódica',
            'consistencia' => 'Blanda',
            'alergias' => null,
            'observaciones' => 'Restricción de sodio por insuficiencia cardíaca.',
        ]);

        // === Historial médico ===
        HistorialMedico::create([
            'paciente_id' => $pacientes[0]->id,
            'fecha' => now()->subMonths(3)->toDateString(),
            'observacion' => 'Control trimestral. HbA1c 7.2%. Buen control glucémico. Continuar plan actual.',
            'medico_responsable' => 'Dra. Carolina López',
        ]);

        HistorialMedico::create([
            'paciente_id' => $pacientes[3]->id,
            'fecha' => now()->subWeeks(2)->toDateString(),
            'observacion' => 'Ajuste de furosemida por edemas. Se indica control de peso diario.',
            'medico_responsable' => 'Dr. Martín Rivero',
        ]);

        // === Notificaciones ===
        Notification::create([
            'tipo' => 'stock_bajo',
            'titulo' => 'Stock bajo',
            'mensaje' => 'Enalapril 10mg tiene 5 unidades (mínimo 30)',
            'enlace' => '/stock/items',
        ]);

        Notification::create([
            'tipo' => 'stock_vencimiento',
            'titulo' => 'Vencimiento próximo',
            'mensaje' => 'Furosemida 40mg vence en 15 días',
            'enlace' => '/stock/lotes',
        ]);

        Notification::create([
            'tipo' => 'paciente_nuevo',
            'titulo' => 'Nuevo ingreso',
            'mensaje' => 'Se ha registrado el paciente Roberto Suárez',
            'enlace' => '/pacientes/' . $pacientes[5]->id . '/ficha',
            'paciente_id' => $pacientes[5]->id,
        ]);
    }
}
