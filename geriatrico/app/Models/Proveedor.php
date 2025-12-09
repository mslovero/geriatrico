<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'proveedores';

    protected $fillable = [
        'nombre',
        'razon_social',
        'cuit',
        'telefono',
        'email',
        'direccion',
        'observaciones'
    ];

    public function stockItems()
    {
        return $this->hasMany(StockItem::class);
    }
}
