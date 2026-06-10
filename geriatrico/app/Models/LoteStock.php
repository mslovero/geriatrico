<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LoteStock extends Model
{
    use HasFactory;

    protected $table = 'lotes_stock';

    protected $fillable = [
        'stock_item_id',
        'numero_lote',
        'fecha_vencimiento',
        'fecha_ingreso',
        'cantidad_inicial',
        'cantidad_actual',
        'precio_compra',
        'proveedor_factura',
        'observaciones',
        'estado'
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
        'fecha_ingreso' => 'date',
        'precio_compra' => 'decimal:2'
    ];

    // Relaciones
    public function stockItem()
    {
        return $this->belongsTo(StockItem::class);
    }

    public function registrosMedicacion()
    {
        return $this->hasMany(RegistroMedicacion::class);
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoStock::class);
    }

    // Métodos útiles
    public function isVencido()
    {
        return $this->fecha_vencimiento < Carbon::now();
    }

    public function isProximoVencer($dias = 30)
    {
        return $this->fecha_vencimiento->diffInDays(Carbon::now()) <= $dias 
            && !$this->isVencido();
    }

    public function isAgotado()
    {
        return $this->cantidad_actual <= 0;
    }

    public function diasParaVencer()
    {
        return $this->fecha_vencimiento->diffInDays(Carbon::now());
    }

    // Actualizar estado automáticamente
    public function actualizarEstado()
    {
        if ($this->isAgotado()) {
            $this->estado = 'agotado';
        } elseif ($this->isVencido()) {
            $this->estado = 'vencido';
        } else {
            $this->estado = 'activo';
        }
        $this->save();
    }

    public function descontar($cantidad)
    {
        if (! is_numeric($cantidad) || floor($cantidad) != $cantidad || $cantidad <= 0) {
            throw new \InvalidArgumentException('La cantidad a descontar debe ser un entero mayor a cero.');
        }

        if ($this->cantidad_actual < $cantidad) {
            throw \App\Exceptions\StockInsuficienteException::enLote(
                $this->numero_lote,
                (int) $this->cantidad_actual,
                (int) $cantidad,
            );
        }

        $this->cantidad_actual -= $cantidad;
        $this->actualizarEstado();

        return $this;
    }
}
