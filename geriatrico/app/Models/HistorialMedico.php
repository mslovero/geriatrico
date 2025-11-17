<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialMedico extends Model
{
    protected $table = 'historial_medicos';
    protected $fillable = [
        'paciente_id',
        'fecha',
        'observacion',
        'medico_responsable',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // 🔹 Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    public function archivosAdjuntos()
    {
        return $this->hasMany(ArchivoAdjunto::class);
    }
}
