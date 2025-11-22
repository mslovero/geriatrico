<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Medicacion;
use App\Models\User;

class RegistroMedicacion extends Model
{
    protected $fillable = [
        'medicacion_id',
        'user_id',
        'fecha_hora',
        'estado',
        'observaciones'
    ];

    public function medicacion()
    {
        return $this->belongsTo(Medicacion::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
