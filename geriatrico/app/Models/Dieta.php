<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dieta extends Model
{
    use HasFactory;

    protected $fillable = [
        'paciente_id',
        'tipo',
        'consistencia',
        'alergias',
        'observaciones'
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}
