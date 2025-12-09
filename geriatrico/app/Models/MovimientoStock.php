<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimientoStock extends Model
{
    use HasFactory;

    protected $table = 'movimientos_stock';

    protected $fillable = [
        'stock_item_id',
        'lote_stock_id',
        'tipo_movimiento',
        'cantidad',
        'stock_anterior',
        'stock_nuevo',
        'motivo',
        'paciente_id',
        'user_id',
        'precio_total',
        'observaciones'
    ];

    protected $casts = [
        'precio_total' => 'decimal:2'
    ];

    public function stockItem()
    {
        return $this->belongsTo(StockItem::class);
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
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
