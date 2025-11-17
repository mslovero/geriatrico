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
