<?php

namespace App\Http\Controllers;

use App\Models\ArchivoAdjunto;
use App\Http\Requests\StoreArchivoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class ArchivoAdjuntoController extends Controller
{
    /**
     * Listar archivos adjuntos (paginado)
     */
    public function index()
    {
        Gate::authorize('viewAny', ArchivoAdjunto::class);
        return ArchivoAdjunto::with(['paciente', 'historialMedico'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    /**
     * Subir nuevo archivo
     */
    public function store(StoreArchivoRequest $request)
    {
        Gate::authorize('create', ArchivoAdjunto::class);
        
        $validated = $request->validated();

        // Guardar archivo en storage/app/public/adjuntos
        // Usamos un nombre único para evitar colisiones
        $nombreOriginal = $request->file('archivo')->getClientOriginalName();
        $ruta = $request->file('archivo')->store('adjuntos', 'public');

        $archivo = ArchivoAdjunto::create([
            'paciente_id' => $validated['paciente_id'] ?? null,
            'historial_medico_id' => $validated['historial_medico_id'] ?? null,
            'tipo' => $validated['tipo'] ?? 'otro',
            'ruta_archivo' => $ruta,
            'nombre_original' => $nombreOriginal, // Asumiendo que existe el campo o se agregará
        ]);

        return response()->json([
            'message' => 'Archivo subido correctamente',
            'data' => $archivo->load(['paciente', 'historialMedico'])
        ], 201);
    }

    /**
     * Ver detalle de archivo
     */
    public function show(ArchivoAdjunto $archivoAdjunto)
    {
        Gate::authorize('view', $archivoAdjunto);
        return response()->json($archivoAdjunto->load(['paciente', 'historialMedico']));
    }

    /**
     * Eliminar archivo (Solo Admin)
     */
    public function destroy($id)
    {
        $archivo = ArchivoAdjunto::findOrFail($id);
        Gate::authorize('delete', $archivo);
        
        // Eliminar del almacenamiento físico
        if (Storage::disk('public')->exists($archivo->ruta_archivo)) {
            Storage::disk('public')->delete($archivo->ruta_archivo);
        }

        $archivo->delete();

        return response()->json(['message' => 'Archivo eliminado correctamente']);
    }
}
