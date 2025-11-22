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
Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/users', [App\Http\Controllers\UserController::class, 'index'])->middleware('auth:sanctum');

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
Route::apiResource('medicaciones', MedicacionController::class);
Route::apiResource('signos-vitales', \App\Http\Controllers\SignoVitalController::class);
Route::apiResource('registro-medicaciones', \App\Http\Controllers\RegistroMedicacionController::class);
Route::apiResource('incidencias', \App\Http\Controllers\IncidenciaController::class);
Route::apiResource('dietas', \App\Http\Controllers\DietaController::class);
Route::apiResource('turnos-medicos', \App\Http\Controllers\TurnoMedicoController::class);
