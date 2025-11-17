<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Habitacion extends Model
{
    use HasFactory;

    protected $table = 'habitaciones';

    protected $fillable = [
        'numero',
        'capacidad'
    ];
    public function cama()
    {
        return $this->hasMany(Cama::class);
    }
    public function pacientes()
    {
        return $this->hasMany(Paciente::class);
    }

    // 🔹 Cálculo de camas ocupadas/libres
    public function camasOcupadas()
    {
        return $this->cama()->where('estado', 'ocupada');
    }

    public function camasLibres()
    {
        return $this->cama()->where('estado', 'libre');
    }
}
