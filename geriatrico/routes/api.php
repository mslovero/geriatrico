<?php
use App\Http\Controllers\ArchivoAdjuntoController;
use App\Http\Controllers\CamasController;
use App\Http\Controllers\HabitacionController;
use App\Http\Controllers\HistorialMedicoController;
use App\Http\Controllers\MedicacionController;
use App\Http\Controllers\PacienteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
    
})->middleware('auth:sanctum');

// 🔐 Rutas públicas (sin autenticación)
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // Máximo 5 intentos de login por minuto

// 🎭 Demo reset (público pero protegido por token + flag DEMO_MODE)
Route::post('/demo/reset', [App\Http\Controllers\DemoResetController::class, 'reset'])
    ->middleware('throttle:6,60'); // Máx 6 resets por hora

// 🔐 Todas las rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);

    // 🔹 Usuarios (Solo Admin)
    Route::apiResource('users', App\Http\Controllers\UserController::class);

    // 🔹 Pacientes
    Route::get('pacientes/{id}/pdf', [PacienteController::class, 'exportPdf']);
    Route::apiResource('pacientes', PacienteController::class);

    // 🔹 Habitaciones
    Route::apiResource('habitaciones', HabitacionController::class);

    // 🔹 Camas
    Route::apiResource('camas', CamasController::class);

    // 🔹 Historial Médico
    Route::apiResource('historiales-medicos', HistorialMedicoController::class);

    // 🔹 Archivos Adjuntos
    Route::apiResource('archivos-adjuntos', ArchivoAdjuntoController::class);

    // 🔹 Medicamentos
    Route::get('medicamentos/estado', [MedicacionController::class, 'estadoMedicaciones']);
    Route::post('medicamentos/batch', [MedicacionController::class, 'storeBatch'])
        ->middleware('throttle:10,1'); // Máximo 10 creaciones batch por minuto
    Route::apiResource('medicamentos', MedicacionController::class);

    // 🔹 Signos Vitales
    Route::get('signos-vitales/paciente/{pacienteId}', [\App\Http\Controllers\SignoVitalController::class, 'historialPaciente']);
    Route::apiResource('signos-vitales', \App\Http\Controllers\SignoVitalController::class);

    // 🔹 Registro de Medicaciones
    Route::apiResource('registro-medicaciones', \App\Http\Controllers\RegistroMedicacionController::class)
        ->middleware('throttle:30,1'); // Máximo 30 registros por minuto

    // 🔹 Incidencias
    Route::apiResource('incidencias', \App\Http\Controllers\IncidenciaController::class);

    // 🔹 Dietas
    Route::apiResource('dietas', \App\Http\Controllers\DietaController::class);

    // 🔹 Turnos Médicos
    Route::apiResource('turnos-medicos', \App\Http\Controllers\TurnoMedicoController::class);

    // 🔹 Gestión de Stock
    Route::apiResource('proveedores', \App\Http\Controllers\ProveedorController::class);
    Route::apiResource('stock-items', \App\Http\Controllers\StockItemController::class)
        ->middleware('throttle:20,1'); // Máximo 20 operaciones de stock por minuto
    Route::apiResource('lotes-stock', \App\Http\Controllers\LoteStockController::class)
        ->middleware('throttle:15,1'); // Máximo 15 operaciones de lotes por minuto
    Route::apiResource('movimientos-stock', \App\Http\Controllers\MovimientoStockController::class);

    // Rutas adicionales de stock
    Route::get('stock-items-bajo-stock', [\App\Http\Controllers\StockItemController::class, 'bajoStock']);
    Route::get('stock-items-proximos-vencer', [\App\Http\Controllers\StockItemController::class, 'proximosVencer']);
    Route::post('stock-items/{id}/entrada', [\App\Http\Controllers\StockItemController::class, 'registrarEntrada'])
        ->middleware('throttle:20,1'); // Máximo 20 entradas/salidas por minuto
    Route::post('stock-items/{id}/salida', [\App\Http\Controllers\StockItemController::class, 'registrarSalida'])
        ->middleware('throttle:20,1');
    Route::get('movimientos-stock/paciente/{pacienteId}', [\App\Http\Controllers\MovimientoStockController::class, 'porPaciente']);
    Route::post('movimientos-stock/reporte-consumo', [\App\Http\Controllers\MovimientoStockController::class, 'reporteConsumo']);
    Route::post('movimientos-stock/administrar', [\App\Http\Controllers\MovimientoStockController::class, 'administrarMedicacion'])
        ->middleware('throttle:30,1'); // Máximo 30 administraciones por minuto

    // 🔹 Reportes de Stock y Costos
    Route::prefix('reportes')->group(function () {
        Route::get('consumo-geriatrico', [\App\Http\Controllers\ReportesController::class, 'consumoGeriatrico']);
        Route::get('consumo-paciente/{pacienteId}', [\App\Http\Controllers\ReportesController::class, 'consumoPaciente']);
        Route::get('costos-mensuales', [\App\Http\Controllers\ReportesController::class, 'costosMensuales']);
        Route::get('stock-geriatrico', [\App\Http\Controllers\ReportesController::class, 'stockGeriatrico']);
        Route::get('stock-paciente/{pacienteId}', [\App\Http\Controllers\ReportesController::class, 'stockPaciente']);
        Route::get('top-medicamentos', [\App\Http\Controllers\ReportesController::class, 'topMedicamentos']);
        Route::get('resumen-general', [\App\Http\Controllers\ReportesController::class, 'resumenGeneral']);
    });

    // 🔹 Notificaciones
    Route::prefix('notificaciones')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('no-leidas', [\App\Http\Controllers\NotificationController::class, 'noLeidas']);
        Route::get('resumen', [\App\Http\Controllers\NotificationController::class, 'resumen']);
        Route::post('generar', [\App\Http\Controllers\NotificationController::class, 'generarAutomaticas']);
        Route::post('{id}/marcar-leida', [\App\Http\Controllers\NotificationController::class, 'marcarLeida']);
        Route::post('marcar-todas-leidas', [\App\Http\Controllers\NotificationController::class, 'marcarTodasLeidas']);
        Route::delete('{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);
        Route::delete('limpiar-antiguas', [\App\Http\Controllers\NotificationController::class, 'limpiarAntiguas']);
    });

    // 🔹 Dashboard General
    // 🔹 Dashboard General
    Route::get('dashboard-stats', [\App\Http\Controllers\DashboardController::class, 'index']);

    // 🔹 Suscripciones Push
    Route::post('push-subscriptions', [\App\Http\Controllers\PushSubscriptionController::class, 'update']);
    Route::post('push-subscriptions/delete', [\App\Http\Controllers\PushSubscriptionController::class, 'destroy']);
    Route::post('push-test', function (Request $request) {
        $request->user()->notify(new \App\Notifications\TestPushNotification);
        return response()->json(['message' => 'Notificación de prueba enviada']);
    });
});
