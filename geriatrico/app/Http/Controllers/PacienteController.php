<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePacienteRequest;
use App\Http\Requests\UpdatePacienteRequest;
use App\Http\Resources\PacienteResource;
use App\Models\Paciente;
use App\Services\PacienteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PacienteController extends Controller
{
    public function __construct(private readonly PacienteService $pacientes)
    {
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Paciente::class);

        $pacientes = Paciente::with(['habitacion', 'cama', 'historial_medico', 'medicaciones', 'archivos'])
            ->when($request->filled('estado'), fn ($q) => $q->where('estado', $request->estado))
            ->paginate(15);

        return PacienteResource::collection($pacientes);
    }

    public function store(StorePacienteRequest $request)
    {
        Gate::authorize('create', Paciente::class);

        $paciente = $this->pacientes->crear($request->validated());

        return (new PacienteResource($paciente))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Paciente $paciente)
    {
        $paciente->load([
            'habitacion',
            'cama',
            'historial_medico',
            'medicaciones',
            'archivos',
            'signosVitales',
            'dietas',
            'incidencias',
            'turnosMedicos',
        ]);

        return new PacienteResource($paciente);
    }

    public function update(UpdatePacienteRequest $request, Paciente $paciente)
    {
        Gate::authorize('update', $paciente);

        $actualizado = $this->pacientes->actualizar($paciente, $request->validated());

        return new PacienteResource($actualizado);
    }

    public function destroy(Paciente $paciente)
    {
        Gate::authorize('delete', $paciente);

        $paciente->delete();

        return response()->json(['message' => 'Paciente eliminado correctamente.']);
    }

    /**
     * Exporta la ficha clínica del paciente como PDF.
     *
     * Filtros disponibles vía ?periodo=
     *  - ultima_revision: desde la última entrada del historial médico
     *  - 30dias (default): últimos 30 días
     *  - completo: todo el histórico clínico
     */
    public function exportPdf(Request $request, $id)
    {
        $paciente = Paciente::findOrFail($id);
        Gate::authorize('view', $paciente);

        $periodo = $request->query('periodo', '30dias');
        if (! in_array($periodo, ['ultima_revision', '30dias', 'completo'], true)) {
            $periodo = '30dias';
        }

        [$desde, $periodoLabel] = $this->resolverPeriodo($paciente, $periodo);

        $paciente->load([
            'habitacion',
            'cama',
            'medicaciones.stockItem',
            'dietas',
            'turnosMedicos' => fn ($q) => $q
                ->when($desde, fn ($q2) => $q2->where('fecha_hora', '>=', $desde))
                ->orderBy('fecha_hora'),
            'signosVitales' => fn ($q) => $q
                ->when($desde, fn ($q2) => $q2->where('fecha', '>=', $desde))
                ->orderByDesc('fecha'),
            'incidencias' => fn ($q) => $q
                ->when($desde, fn ($q2) => $q2->where('fecha_hora', '>=', $desde))
                ->orderByDesc('fecha_hora'),
            'historial_medico' => fn ($q) => $q
                ->when($desde, fn ($q2) => $q2->where('fecha', '>=', $desde))
                ->orderByDesc('fecha'),
        ]);

        $generadoEn = now();

        $pdf = Pdf::loadView('pdf.ficha-paciente', [
            'paciente' => $paciente,
            'periodoLabel' => $periodoLabel,
            'periodo' => $periodo,
            'generadoEn' => $generadoEn,
        ]);

        $nombreArchivo = sprintf(
            'Ficha_%s_%s_%s.pdf',
            str_replace(' ', '_', $paciente->nombre),
            str_replace(' ', '_', $paciente->apellido),
            $periodo,
        );

        return $pdf->download($nombreArchivo);
    }

    /**
     * Calcula la fecha desde la cual cargar las relaciones según el periodo.
     *
     * @return array{0: ?\Carbon\CarbonInterface, 1: string}
     */
    private function resolverPeriodo(Paciente $paciente, string $periodo): array
    {
        if ($periodo === 'completo') {
            return [null, 'Histórico completo'];
        }

        if ($periodo === 'ultima_revision') {
            $ultima = $paciente->historial_medico()
                ->orderByDesc('fecha')
                ->first();

            if ($ultima) {
                return [
                    \Carbon\Carbon::parse($ultima->fecha)->startOfDay(),
                    'Desde la última revisión',
                ];
            }

            return [now()->subDays(30), 'Últimos 30 días'];
        }

        return [now()->subDays(30), 'Últimos 30 días'];
    }
}
