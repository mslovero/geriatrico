<?php

namespace App\Models;

use App\Models\Medicacion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistroMedicacion extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicacion_id',
        'user_id',
        'fecha_hora',
        'estado',
        'observaciones',
        'lote_stock_id',
        'cantidad_administrada',
        'costo_unitario'
    ];

    public function medicacion()
    {
        return $this->belongsTo(Medicacion::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loteStock()
    {
        return $this->belongsTo(LoteStock::class);
    }
}
