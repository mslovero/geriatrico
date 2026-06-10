<?php

namespace App\Http\Controllers;

use App\Http\Requests\CostosMensualesRequest;
use App\Http\Requests\PeriodoReporteRequest;
use App\Http\Requests\TopMedicamentosRequest;
use App\Models\Paciente;
use App\Services\ReporteService;
use App\Support\Periodo;

class ReportesController extends Controller
{
    public function __construct(private readonly ReporteService $reportes)
    {
    }

    public function consumoGeriatrico(PeriodoReporteRequest $request)
    {
        $periodo = Periodo::desde($request->input('fecha_desde'), $request->input('fecha_hasta'));

        return response()->json($this->reportes->consumoGeriatrico($periodo));
    }

    public function consumoPaciente(int $pacienteId, PeriodoReporteRequest $request)
    {
        $paciente = Paciente::findOrFail($pacienteId);
        $periodo = Periodo::desde($request->input('fecha_desde'), $request->input('fecha_hasta'));

        return response()->json($this->reportes->consumoPaciente($paciente, $periodo));
    }

    public function costosMensuales(CostosMensualesRequest $request)
    {
        $anio = (int) ($request->input('anio') ?? now()->year);

        return response()->json($this->reportes->costosMensuales($anio));
    }

    public function stockGeriatrico()
    {
        return response()->json($this->reportes->stockGeriatrico());
    }

    public function stockPaciente(int $pacienteId)
    {
        $paciente = Paciente::findOrFail($pacienteId);

        return response()->json($this->reportes->stockPaciente($paciente));
    }

    public function topMedicamentos(TopMedicamentosRequest $request)
    {
        $periodo = Periodo::desde($request->input('fecha_desde'), $request->input('fecha_hasta'));
        $limite = (int) ($request->input('limite') ?? 10);

        return response()->json($this->reportes->topMedicamentos($periodo, $limite));
    }

    public function resumenGeneral()
    {
        return response()->json($this->reportes->resumenGeneral());
    }
}
