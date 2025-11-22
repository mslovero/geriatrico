<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SignoVital extends Model
{
    use HasFactory;

    protected $fillable = [
        'paciente_id',
        'fecha',
        'presion_arterial',
        'temperatura',
        'frecuencia_cardiaca',
        'saturacion_oxigeno',
        'glucosa',
        'observaciones',
        'registrado_por'
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}
