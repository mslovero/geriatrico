<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicacion extends Model
{
    use HasFactory;
    protected $tables = 'medicacion';
     protected $fillable = [
        'nombre',
        'dosis',
        'frecuencia',
         'observaciones',
        'paciente_id',
        'tipo',
        'cantidad_mensual',
        'fecha_inicio',
        'fecha_fin'

     ];

     public function paciente() {
        return $this->belongsTo(Paciente::class);
     }
}
