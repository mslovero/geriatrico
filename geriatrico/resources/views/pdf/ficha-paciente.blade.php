<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ficha clínica - {{ $paciente->nombre }} {{ $paciente->apellido }}</title>
    <style>
        @page { margin: 25mm 15mm 20mm 15mm; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #0f172a;
            line-height: 1.4;
            font-size: 10.5px;
            margin: 0;
            padding: 0;
        }

        /* ============ HEADER repetido en cada página ============ */
        .running-header {
            position: running(header);
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 4px;
        }
        @page { @top-center { content: element(header); } }

        /* ============ FOOTER repetido en cada página ============ */
        .running-footer {
            position: running(footer);
            color: #64748b;
            font-size: 8px;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
        }
        @page { @bottom-center { content: element(footer); } }
        @page { @bottom-right { content: "Página " counter(page); font-size: 8px; color: #64748b; } }

        /* ============ HERO ============ */
        .hero {
            background: #1e40af;
            color: white;
            padding: 14px 18px;
            margin-bottom: 14px;
        }
        .hero-table { width: 100%; border-collapse: collapse; }
        .hero-table td { vertical-align: middle; color: white; padding: 0; }
        .hero .name { font-size: 19px; font-weight: bold; }
        .hero .info { font-size: 10px; color: #cbd5e1; margin-top: 3px; }
        .hero .info strong { color: white; }
        .hero .status {
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.4);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            white-space: nowrap;
        }

        /* ============ SECCIONES ============ */
        h2.section-title {
            font-size: 10.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #1e40af;
            border-bottom: 1px solid #cbd5e1;
            padding: 3px 0 3px 0;
            margin: 0 0 8px 0;
        }
        h2.section-title .count {
            float: right;
            color: #64748b;
            font-weight: normal;
            text-transform: none;
            letter-spacing: 0;
            font-size: 9.5px;
        }
        .section { margin-bottom: 12px; }

        /* ============ INFO grid usando tabla simple ============ */
        table.info {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
        }
        table.info td {
            width: 33.3%;
            vertical-align: top;
            padding: 4px 8px 4px 0;
        }
        table.info .label {
            display: block;
            font-size: 8.5px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        table.info .value { color: #0f172a; font-size: 10.5px; }

        /* ============ TABLAS DE DATOS ============ */
        table.data {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        table.data th {
            background: #f1f5f9;
            text-align: left;
            padding: 5px 7px;
            color: #475569;
            font-size: 8.5px;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            font-weight: bold;
        }
        table.data td {
            padding: 5px 7px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }
        table.data tr:last-child td { border-bottom: 0; }

        /* ============ BADGES ============ */
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 8px;
            font-size: 8.5px;
            font-weight: bold;
        }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger  { background: #fee2e2; color: #991b1b; }
        .badge-info    { background: #dbeafe; color: #1e40af; }
        .badge-muted   { background: #f1f5f9; color: #475569; }

        /* ============ ALERTS ============ */
        .alert {
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            padding: 7px 10px;
            margin: 0 0 6px 0;
            font-size: 10px;
        }
        .alert.danger { background: #fee2e2; border-left-color: #dc2626; }
        .alert-label {
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            font-size: 9px;
            margin-right: 6px;
        }
        .alert.danger .alert-label { color: #991b1b; }

        .empty { color: #94a3b8; font-style: italic; padding: 4px 0; font-size: 10px; }
        .small { font-size: 9px; color: #64748b; }

        .period-tag {
            display: inline-block;
            padding: 1px 8px;
            border-radius: 10px;
            font-size: 8.5px;
            background: #dbeafe;
            color: #1e40af;
            margin-left: 6px;
            text-transform: uppercase;
            font-weight: bold;
        }
    </style>
</head>
<body>

<div class="running-header">
    <table style="width:100%; border-collapse: collapse">
        <tr>
            <td style="font-size:12px; font-weight:bold; color:#1e40af">RESIDENCIA PARA ADULTOS MAYORES</td>
            <td style="text-align:right; font-size:8.5px; color:#64748b">
                Generado: {{ $generadoEn->format('d/m/Y H:i') }}<br>
                Documento confidencial
            </td>
        </tr>
    </table>
</div>

<div class="running-footer">
    Documento confidencial para uso exclusivo del personal médico autorizado.
    Cualquier divulgación no autorizada está sujeta a sanciones legales (Ley 26.529).
</div>

<div class="hero">
    <table class="hero-table">
        <tr>
            <td>
                <div class="name">{{ $paciente->nombre }} {{ $paciente->apellido }}</div>
                <div class="info">
                    <strong>DNI:</strong> {{ $paciente->dni }}
                    @if($paciente->fecha_nacimiento)
                        &nbsp;&nbsp;&nbsp;<strong>Edad:</strong> {{ \Carbon\Carbon::parse($paciente->fecha_nacimiento)->age }} años
                        &nbsp;&nbsp;&nbsp;<strong>Nacimiento:</strong> {{ \Carbon\Carbon::parse($paciente->fecha_nacimiento)->format('d/m/Y') }}
                    @endif
                </div>
            </td>
            <td style="text-align:right; width: 110px">
                <span class="status">
                    @switch($paciente->estado)
                        @case('activo') Activo @break
                        @case('temporal') Temporal @break
                        @case('alta_medica') Alta médica @break
                        @case('fallecido') Fallecido @break
                        @default {{ ucfirst(str_replace('_',' ', $paciente->estado)) }}
                    @endswitch
                </span>
            </td>
        </tr>
    </table>
</div>

<div class="section">
    <h2 class="section-title">
        Información general
        <span class="period-tag">{{ $periodoLabel }}</span>
    </h2>
    <table class="info">
        <tr>
            <td>
                <span class="label">Habitación</span>
                <span class="value">{{ $paciente->habitacion->numero ?? '—' }}</span>
            </td>
            <td>
                <span class="label">Cama</span>
                <span class="value">{{ $paciente->cama->numero_cama ?? '—' }}</span>
            </td>
            <td>
                <span class="label">Médico de cabecera</span>
                <span class="value">{{ $paciente->medico_cabecera ?: '—' }}</span>
            </td>
        </tr>
    </table>
</div>

<div class="section">
    <h2 class="section-title">Contacto de emergencia</h2>
    @php $contacto = $paciente->contacto_emergencia; @endphp
    @if(is_array($contacto) && !empty(array_filter($contacto)))
        <table class="info">
            <tr>
                <td>
                    <span class="label">Nombre</span>
                    <span class="value">{{ $contacto['nombre'] ?? '—' }}</span>
                </td>
                <td>
                    <span class="label">Teléfono</span>
                    <span class="value">{{ $contacto['telefono'] ?? '—' }}</span>
                </td>
                <td>
                    <span class="label">Relación</span>
                    <span class="value">{{ $contacto['relacion'] ?? '—' }}</span>
                </td>
            </tr>
        </table>
    @else
        <p class="empty">Sin contacto de emergencia registrado.</p>
    @endif
</div>

@if($paciente->patologias)
<div class="section">
    <h2 class="section-title">Patologías y antecedentes</h2>
    <div class="alert">
        <span class="alert-label">Atención clínica:</span>
        {{ $paciente->patologias }}
    </div>
</div>
@endif

@php $dietaActual = $paciente->dietas->sortByDesc('updated_at')->first(); @endphp
@if($dietaActual)
<div class="section">
    <h2 class="section-title">Plan alimentario</h2>
    <table class="info">
        <tr>
            <td>
                <span class="label">Tipo</span>
                <span class="value">{{ $dietaActual->tipo }}</span>
            </td>
            <td>
                <span class="label">Consistencia</span>
                <span class="value">{{ $dietaActual->consistencia }}</span>
            </td>
            <td>
                <span class="label">Última actualización</span>
                <span class="value">{{ \Carbon\Carbon::parse($dietaActual->updated_at)->format('d/m/Y') }}</span>
            </td>
        </tr>
    </table>
    @if($dietaActual->alergias)
        <div class="alert danger" style="margin-top:6px">
            <span class="alert-label">Alergias alimentarias:</span>
            {{ $dietaActual->alergias }}
        </div>
    @endif
    @if($dietaActual->observaciones)
        <p class="small" style="margin-top:6px"><strong>Observaciones:</strong> {{ $dietaActual->observaciones }}</p>
    @endif
</div>
@endif

<div class="section">
    <h2 class="section-title">
        Medicación activa
        <span class="count">{{ $paciente->medicaciones->count() }} prescripcion{{ $paciente->medicaciones->count() === 1 ? '' : 'es' }}</span>
    </h2>
    @if($paciente->medicaciones->count() > 0)
        <table class="data">
            <thead>
                <tr>
                    <th>Medicamento</th>
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                    <th>Tipo</th>
                    <th>Origen</th>
                    <th>Vigencia</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paciente->medicaciones as $med)
                    <tr>
                        <td><strong>{{ $med->nombre }}</strong></td>
                        <td>{{ $med->dosis ?: '—' }}</td>
                        <td>{{ $med->frecuencia ?: '—' }}</td>
                        <td>
                            <span class="badge {{ $med->tipo === 'sos' ? 'badge-warning' : 'badge-success' }}">
                                {{ $med->tipo === 'sos' ? 'SOS' : 'Diaria' }}
                            </span>
                        </td>
                        <td>
                            @switch($med->origen_pago)
                                @case('geriatrico')<span class="badge badge-success">Geriátrico</span>@break
                                @case('obra_social')<span class="badge badge-info">O. Social</span>@break
                                @case('paciente')<span class="badge badge-warning">Paciente</span>@break
                            @endswitch
                        </td>
                        <td class="small">
                            {{ $med->fecha_inicio ? \Carbon\Carbon::parse($med->fecha_inicio)->format('d/m/y') : '—' }}
                            →
                            {{ $med->fecha_fin ? \Carbon\Carbon::parse($med->fecha_fin)->format('d/m/y') : 'Indef.' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p class="empty">Sin medicación registrada.</p>
    @endif
</div>

<div class="section">
    <h2 class="section-title">
        Signos vitales
        <span class="count">{{ $paciente->signosVitales->count() }} registro{{ $paciente->signosVitales->count() === 1 ? '' : 's' }}</span>
    </h2>
    @if($paciente->signosVitales->count() > 0)
        <table class="data">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Presión</th>
                    <th>Temp.</th>
                    <th>Pulso</th>
                    <th>SatO₂</th>
                    <th>Glucosa</th>
                    <th>Responsable</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paciente->signosVitales->sortByDesc('fecha') as $sv)
                    @php
                        $tempBadge = $sv->temperatura ? ($sv->temperatura > 38 ? 'badge-danger' : ($sv->temperatura < 36 ? 'badge-info' : 'badge-success')) : null;
                        $satBadge = $sv->saturacion_oxigeno ? ($sv->saturacion_oxigeno < 94 ? 'badge-danger' : 'badge-success') : null;
                        $glucBadge = $sv->glucosa ? ($sv->glucosa > 180 ? 'badge-danger' : ($sv->glucosa < 70 ? 'badge-info' : 'badge-success')) : null;
                    @endphp
                    <tr>
                        <td class="small">{{ \Carbon\Carbon::parse($sv->fecha)->format('d/m/Y H:i') }}</td>
                        <td>{{ $sv->presion_arterial ?: '—' }}</td>
                        <td>
                            @if($sv->temperatura)<span class="badge {{ $tempBadge }}">{{ $sv->temperatura }}°C</span>@else — @endif
                        </td>
                        <td>{{ $sv->frecuencia_cardiaca ?: '—' }}{{ $sv->frecuencia_cardiaca ? ' bpm' : '' }}</td>
                        <td>
                            @if($sv->saturacion_oxigeno)<span class="badge {{ $satBadge }}">{{ $sv->saturacion_oxigeno }}%</span>@else — @endif
                        </td>
                        <td>
                            @if($sv->glucosa)<span class="badge {{ $glucBadge }}">{{ $sv->glucosa }}</span>@else — @endif
                        </td>
                        <td class="small">{{ $sv->registrado_por ?: '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <p class="small" style="margin-top:4px">
            Rangos normales: Temp. 36-37.5°C · Pulso 60-100 bpm · SatO₂ 94-100% · Glucosa 70-140 mg/dL
        </p>
    @else
        <p class="empty">Sin registros de signos vitales en el período seleccionado.</p>
    @endif
</div>

@if($paciente->incidencias->count() > 0)
<div class="section">
    <h2 class="section-title">
        Incidencias
        <span class="count">{{ $paciente->incidencias->count() }} evento{{ $paciente->incidencias->count() === 1 ? '' : 's' }}</span>
    </h2>
    <table class="data">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Severidad</th>
                <th>Descripción</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach($paciente->incidencias->sortByDesc('fecha_hora') as $inc)
                @php
                    $sevBadge = match($inc->severidad) {
                        'leve' => 'badge-success',
                        'moderada' => 'badge-warning',
                        'grave', 'critica' => 'badge-danger',
                        default => 'badge-muted'
                    };
                @endphp
                <tr>
                    <td class="small">{{ \Carbon\Carbon::parse($inc->fecha_hora)->format('d/m/Y H:i') }}</td>
                    <td>{{ $inc->tipo }}</td>
                    <td><span class="badge {{ $sevBadge }}">{{ ucfirst($inc->severidad) }}</span></td>
                    <td>{{ $inc->descripcion }}</td>
                    <td class="small">{{ $inc->acciones_tomadas ?: '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

@php $turnos = $paciente->turnosMedicos ?? collect(); @endphp
@if($turnos->count() > 0)
<div class="section">
    <h2 class="section-title">
        Turnos médicos
        <span class="count">{{ $turnos->count() }} turno{{ $turnos->count() === 1 ? '' : 's' }}</span>
    </h2>
    <table class="data">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Especialidad</th>
                <th>Profesional</th>
                <th>Lugar</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($turnos->sortBy('fecha_hora') as $turno)
                @php
                    $estadoBadge = match($turno->estado) {
                        'pendiente' => 'badge-warning',
                        'completado' => 'badge-success',
                        'cancelado' => 'badge-muted',
                        default => 'badge-muted'
                    };
                @endphp
                <tr>
                    <td class="small">{{ \Carbon\Carbon::parse($turno->fecha_hora)->format('d/m/Y H:i') }}</td>
                    <td>{{ $turno->especialidad }}</td>
                    <td>{{ $turno->profesional }}</td>
                    <td class="small">{{ $turno->lugar ?: '—' }}</td>
                    <td><span class="badge {{ $estadoBadge }}">{{ ucfirst($turno->estado) }}</span></td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="section">
    <h2 class="section-title">
        Historial médico
        <span class="count">{{ $paciente->historial_medico->count() }} entrada{{ $paciente->historial_medico->count() === 1 ? '' : 's' }}</span>
    </h2>
    @if($paciente->historial_medico->count() > 0)
        <table class="data">
            <thead>
                <tr>
                    <th style="width:75px">Fecha</th>
                    <th style="width:150px">Médico</th>
                    <th>Observación clínica</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paciente->historial_medico->sortByDesc('fecha') as $h)
                    <tr>
                        <td class="small">{{ \Carbon\Carbon::parse($h->fecha)->format('d/m/Y') }}</td>
                        <td>{{ $h->medico_responsable ?: '—' }}</td>
                        <td>{{ $h->observacion }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p class="empty">Sin entradas en el historial médico para el período seleccionado.</p>
    @endif
</div>

</body>
</html>
