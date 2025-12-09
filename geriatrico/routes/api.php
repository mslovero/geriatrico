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

Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth:sanctum');

// 🔹  (Solo Admin)
Route::apiResource('users', App\Http\Controllers\UserController::class)->middleware('auth:sanctum');

// 🔹 Pacientes
Route::apiResource('pacientes', PacienteController::class);

// 🔹 Habitaciones
Route::apiResource('habitaciones', HabitacionController::class);

// 🔹 Camas
Route::apiResource('camas', CamasController::class);

// 🔹 Historial Médico
Route::apiResource('historiales-medicos', HistorialMedicoController::class);

// 🔹 Archivos Adjuntos
Route::apiResource('archivos-adjuntos', ArchivoAdjuntoController::class);
Route::get('medicamentos/estado', [MedicacionController::class, 'estadoMedicaciones']);
Route::post('medicamentos/batch', [MedicacionController::class, 'storeBatch']);
Route::apiResource('medicamentos', MedicacionController::class);
Route::apiResource('signos-vitales', \App\Http\Controllers\SignoVitalController::class);
Route::apiResource('registro-medicaciones', \App\Http\Controllers\RegistroMedicacionController::class);
Route::apiResource('incidencias', \App\Http\Controllers\IncidenciaController::class);
Route::apiResource('dietas', \App\Http\Controllers\DietaController::class);
Route::apiResource('turnos-medicos', \App\Http\Controllers\TurnoMedicoController::class);

// 🔹 Gestión de Stock
Route::apiResource('proveedores', \App\Http\Controllers\ProveedorController::class);
Route::apiResource('stock-items', \App\Http\Controllers\StockItemController::class);
Route::apiResource('lotes-stock', \App\Http\Controllers\LoteStockController::class);
Route::apiResource('movimientos-stock', \App\Http\Controllers\MovimientoStockController::class);

// Rutas adicionales de stock
Route::get('stock-items-bajo-stock', [\App\Http\Controllers\StockItemController::class, 'bajoStock']);
Route::get('stock-items-proximos-vencer', [\App\Http\Controllers\StockItemController::class, 'proximosVencer']);
Route::post('stock-items/{id}/entrada', [\App\Http\Controllers\StockItemController::class, 'registrarEntrada']);
Route::post('stock-items/{id}/salida', [\App\Http\Controllers\StockItemController::class, 'registrarSalida']);
Route::get('movimientos-stock/paciente/{pacienteId}', [\App\Http\Controllers\MovimientoStockController::class, 'porPaciente']);
Route::post('movimientos-stock/reporte-consumo', [\App\Http\Controllers\MovimientoStockController::class, 'reporteConsumo']);
Route::post('movimientos-stock/administrar', [\App\Http\Controllers\MovimientoStockController::class, 'administrarMedicacion']);

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

