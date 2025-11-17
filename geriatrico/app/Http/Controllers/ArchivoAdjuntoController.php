<?php

namespace App\Http\Controllers;

use App\Models\ArchivoAdjunto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArchivoAdjuntoController extends Controller
{
    public function index()
    {
        $archivos = ArchivoAdjunto::with(['paciente', 'historialMedico'])->get();
        return response()->json($archivos);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'paciente_id' => 'nullable|exists:pacientes,id',
            'historial_medico_id' => 'nullable|exists:historial_medicos,id',
            'tipo' => 'nullable|string|max:255',
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png',
        ]);

        // Guardar archivo en storage/app/public/adjuntos
        $ruta = $request->file('archivo')->store('adjuntos', 'public');

        $archivo = ArchivoAdjunto::create([
            'paciente_id' => $data['paciente_id'] ?? null,
            'historial_medico_id' => $data['historial_medico_id'] ?? null,
            'tipo' => $data['tipo'] ?? 'otro',
            'ruta_archivo' => $ruta,
        ]);

        return response()->json($archivo, 201);
    }

    public function show($id)
    {
        $archivo = ArchivoAdjunto::findOrFail($id);
        return response()->json($archivo);
    }

    public function destroy($id)
    {
        $archivo = ArchivoAdjunto::findOrFail($id);
        if (Storage::disk('public')->exists($archivo->ruta_archivo)) {
            Storage::disk('public')->delete($archivo->ruta_archivo);
        }

        $archivo->delete();

        return response()->json(['message' => 'Archivo eliminado correctamente']);
    }
}
