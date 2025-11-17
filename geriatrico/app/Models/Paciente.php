<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Paciente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pacientes';

    protected $fillable = [
        'nombre',
        'apellido',
        'dni',
        'fecha_nacimiento',
        'habitacion_id',
         'cama_id',
        'contacto_emergencia',
        'medico_cabecera',
        'estado',
    ];

    protected $casts = [
        'contacto_emergencia' => 'array',
        'fecha_nacimiento' => 'date:Y-m-d',
    ];

     public function cama()
    {
        return $this->belongsTo(Cama::class);
    }
    // 🔹 Relaciones
    public function habitacion()
    {
        return $this->belongsTo(Habitacion::class);
    }
   

    public function historialMedico()
    {
        return $this->hasMany(HistorialMedico::class);
    }

    public function medicaciones()
    {
        return $this->hasMany(Medicacion::class);
    }

    public function archivos()
    {
        return $this->hasMany(ArchivoAdjunto::class);
    }

    // 🔹 Accessor: nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellido}";
    }

    // 🔹 Scopes: filtros comunes
    public function scopeActivos($query)
    {
        return $query->whereIn('estado', ['activo', 'temporal']);
    }

    public function scopeNoActivos($query)
    {
        return $query->whereNotIn('estado', ['activo', 'temporal']);
    }

    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function Medicacion()
{
    return $this->hasMany(Medicacion::class);
}
}
