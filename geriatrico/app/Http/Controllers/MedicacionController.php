<?php

namespace App\Http\Controllers;

use App\Models\Medicacion;
use Illuminate\Http\Request;

class MedicacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Medicacion::with('paciente')->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'paciente_id' => 'required|exists:pacientes,id',
            'tipo' => 'in:diaria,sos',
            'cantidad_mensual' => 'nullable|integer',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);
        $medicacion = Medicacion::create($request->all());
        return response()-> json($medicacion, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Medicacion::with('paciente')->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Medicacion $medicacion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(Request $request, $id)
    {
        $medicacion = Medicacion::findOrFail($id);
        $medicacion->update($request->all());
        return response()->json($medicacion);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
         Medicacion::findOrFail($id)->delete();
        return response()->noContent();
    }
}
