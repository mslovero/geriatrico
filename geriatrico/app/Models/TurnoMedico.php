<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TurnoMedico extends Model
{
    use HasFactory;

    protected $fillable = [
        'paciente_id',
        'profesional',
        'especialidad',
        'fecha_hora',
        'lugar',
        'estado',
        'observaciones'
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}
