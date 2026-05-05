<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ficha Médica - {{ $paciente->nombre }} {{ $paciente->apellido }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
        .section { margin-bottom: 20px; }
        .section-title { background: #f1f5f9; padding: 5px 10px; font-weight: bold; border-left: 4px solid #2563eb; margin-bottom: 10px; text-transform: uppercase; }
        .grid { width: 100%; border-collapse: collapse; }
        .grid td { padding: 5px; vertical-align: top; }
        .label { font-weight: bold; color: #64748b; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th { background: #f8fafc; text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px; }
        table.data td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px; }
        .status { padding: 2px 8px; border-radius: 10px; font-size: 10px; }
        .status-active { background: #dcfce7; color: #166534; }
        .severity-critica { color: #ef4444; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FICHA MÉDICA DEL PACIENTE</h1>
        <p>Sistema de Gestión Geriátrica Profesional - Generado el {{ date('d/m/Y H:i') }}</p>
    </div>

    <div class="section">
        <div class="section-title">Información Personal</div>
        <table class="grid">
            <tr>
                <td width="33%"><span class="label">Nombre:</span> {{ $paciente->nombre }} {{ $paciente->apellido }}</td>
                <td width="33%"><span class="label">DNI:</span> {{ $paciente->dni }}</td>
                <td width="33%"><span class="label">Edad:</span> {{ \Carbon\Carbon::parse($paciente->fecha_nacimiento)->age }} años</td>
            </tr>
            <tr>
                <td><span class="label">Obra Social:</span> {{ $paciente->obra_social }}</td>
                <td><span class="label">Nº Afiliado:</span> {{ $paciente->numero_afiliado }}</td>
                <td><span class="label">Estado:</span> <span class="status status-active">{{ ucfirst($paciente->estado) }}</span></td>
            </tr>
            <tr>
                <td><span class="label">Habitación:</span> {{ $paciente->habitacion->numero ?? 'N/A' }}</td>
                <td><span class="label">Cama:</span> {{ $paciente->cama->nombre ?? 'N/A' }}</td>
                <td><span class="label">Ingreso:</span> {{ \Carbon\Carbon::parse($paciente->fecha_ingreso)->format('d/m/Y') }}</td>
            </tr>
        </table>
    </div>

    @if($paciente->historial_medico)
    <div class="section">
        <div class="section-title">Antecedentes Médicos</div>
        <table class="grid">
            <tr>
                <td><span class="label">Grupo Sanguíneo:</span> {{ $paciente->historial_medico->grupo_sanguineo }}</td>
            </tr>
            <tr>
                <td><span class="label">Alergias:</span> {{ $paciente->historial_medico->alergias ?: 'Ninguna registrada' }}</td>
            </tr>
            <tr>
                <td><span class="label">Diagnósticos:</span> {{ $paciente->historial_medico->diagnosticos }}</td>
            </tr>
        </table>
    </div>
    @endif

    <div class="section">
        <div class="section-title">Medicación Actual</div>
        @if($paciente->medicaciones->count() > 0)
        <table class="data">
            <thead>
                <tr>
                    <th>Medicamento</th>
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                    <th>Vía</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paciente->medicaciones as $med)
                <tr>
                    <td>{{ $med->nombre }}</td>
                    <td>{{ $med->dosis }}</td>
                    <td>Cada {{ $med->frecuencia_horas }}hs</td>
                    <td>{{ $med->via_administracion }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No hay medicación activa registrada.</p>
        @endif
    </div>

    <div class="section">
        <div class="section-title">Últimos Signos Vitales (Tendencia)</div>
        @if($paciente->signosVitales->count() > 0)
        <table class="data">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Presión</th>
                    <th>Temp.</th>
                    <th>Pulso</th>
                    <th>Sat O2</th>
                    <th>Glucosa</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paciente->signosVitales as $sv)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($sv->fecha)->format('d/m/Y H:i') }}</td>
                    <td>{{ $sv->presion_arterial ?: '-' }}</td>
                    <td>{{ $sv->temperatura ? $sv->temperatura.'°C' : '-' }}</td>
                    <td>{{ $sv->frecuencia_cardiaca ?: '-' }}</td>
                    <td>{{ $sv->saturacion_oxigeno ? $sv->saturacion_oxigeno.'%' : '-' }}</td>
                    <td>{{ $sv->glucosa ?: '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No hay registros de signos vitales recientes.</p>
        @endif
    </div>

    @if($paciente->incidencias->count() > 0)
    <div class="section">
        <div class="section-title">Recientes Incidencias</div>
        <table class="data">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Severidad</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                @foreach($paciente->incidencias as $inc)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($inc->fecha_hora)->format('d/m/Y H:i') }}</td>
                    <td>{{ $inc->tipo }}</td>
                    <td class="severity-{{ $inc->severidad }}">{{ ucfirst($inc->severidad) }}</td>
                    <td>{{ $inc->descripcion }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        Este documento es confidencial y para uso exclusivo del personal médico autorizado.
        Página 1 de 1
    </div>
</body>
</html>
