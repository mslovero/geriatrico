<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cama extends Model
{
    use HasFactory;

    protected $fillable = [
        'habitacion_id',
        'numero_cama',
        'estado', // 'ocupada' o 'libre'
    ];

    // 🔹 Relación con la habitación
    public function habitacion()
    {
        return $this->belongsTo(Habitacion::class);
    }

    // 🔹 Relación con paciente
    public function paciente()
    {
        return $this->hasOne(Paciente::class);
    }
}
