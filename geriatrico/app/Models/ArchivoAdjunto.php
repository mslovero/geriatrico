<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivoAdjunto extends Model
{
    use HasFactory;

    protected $table = 'archivos_adjuntos';

    protected $fillable = [
        'paciente_id',
        'historial_medico_id',
        'tipo',
        'ruta_archivo',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    public function historialMedico()
    {
        return $this->belongsTo(HistorialMedico::class);
    }
}
