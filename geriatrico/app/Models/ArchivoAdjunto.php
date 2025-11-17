<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArchivoAdjunto extends Model
{

    protected $table = "archivos_adjuntos";
    protected $filiabre = [
        'paciente_id',
        'historial_medico_id',
        'tipo',
        'rutal_archivo'
    ];         
       // 🔹 Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    public function historialMedico()
    {
        return $this->belongsTo(HistorialMedico::class);
    }

}
