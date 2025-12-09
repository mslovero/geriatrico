<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'tipo',
        'codigo',
        'descripcion',
        'unidad_medida',
        'unidad_presentacion',
        'factor_conversion',
        'descripcion_presentacion',
        'stock_actual',
        'stock_minimo',
        'stock_maximo',
        'precio_unitario',
        'proveedor_id',
        'fecha_vencimiento',
        'lote',
        'observaciones',
        'categoria',
        'punto_reorden',
        'ubicacion_almacen',
        'codigo_barras',
        'requiere_receta',
        'temperatura_almacenamiento',
        'propiedad',
        'paciente_propietario_id',
        'activo'
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
        'precio_unitario' => 'decimal:2',
        'requiere_receta' => 'boolean',
        'activo' => 'boolean'
    ];

    // Relaciones
    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoStock::class);
    }

    public function medicaciones()
    {
        return $this->hasMany(Medicacion::class);
    }

    public function lotes()
    {
        return $this->hasMany(LoteStock::class);
    }

    public function pacientePropietario()
    {
        return $this->belongsTo(Paciente::class, 'paciente_propietario_id');
    }

    // Métodos de ayuda para propiedad
    public function esDelGeriatrico()
    {
        return $this->propiedad === 'geriatrico';
    }

    public function esDePaciente()
    {
        return $this->propiedad === 'paciente';
    }

    public function getNombrePropietarioAttribute()
    {
        if ($this->esDelGeriatrico()) {
            return 'Geriátrico';
        }
        
        if ($this->esDePaciente() && $this->pacientePropietario) {
            return $this->pacientePropietario->nombre . ' ' . $this->pacientePropietario->apellido;
        }
        
        return '-';
    }

    // Verificar si está bajo stock mínimo
    public function isBajoStock()
    {
        return $this->stock_actual <= $this->stock_minimo;
    }

    // Verificar si necesita reorden (punto de pedido)
    public function necesitaReorden()
    {
        return $this->punto_reorden && $this->stock_actual <= $this->punto_reorden;
    }

    // Verificar si está próximo a vencer (30 días) - Ahora mira los lotes
    public function isProximoVencer()
    {
        // Si tiene lotes, verificamos si alguno está por vencer
        if ($this->lotes()->exists()) {
            return $this->lotes()
                ->where('estado', 'activo')
                ->whereDate('fecha_vencimiento', '<=', now()->addDays(30))
                ->exists();
        }
        
        // Fallback al campo antiguo si no tiene lotes
        if (!$this->fecha_vencimiento) return false;
        return $this->fecha_vencimiento->diffInDays(now()) <= 30;
    }

    // Recalcular stock total basado en lotes activos
    public function recalcularStock()
    {
        $total = $this->lotes()->where('estado', 'activo')->sum('cantidad_actual');
        $this->stock_actual = $total;
        $this->save();
        return $total;
    }

    // === MÉTODOS DE CONVERSIÓN DE UNIDADES ===

    /**
     * Convertir de unidad de presentación a unidad base
     * Ej: 5 blisters → 150 pastillas
     */
    public function convertirPresentacionABase($cantidadPresentacion)
    {
        if (!$this->factor_conversion || $this->factor_conversion <= 1) {
            return $cantidadPresentacion;
        }
        
        return $cantidadPresentacion * $this->factor_conversion;
    }

    /**
     * Convertir de unidad base a presentación (con resto)
     * Ej: 149 pastillas → ['presentacion' => 4, 'resto' => 29]
     */
    public function convertirBaseAPresentacion($cantidadBase)
    {
        if (!$this->factor_conversion || $this->factor_conversion <= 1) {
            return [
                'presentacion' => $cantidadBase,
                'resto' => 0
            ];
        }
        
        $presentacion = floor($cantidadBase / $this->factor_conversion);
        $resto = $cantidadBase % $this->factor_conversion;
        
        return [
            'presentacion' => $presentacion,
            'resto' => $resto
        ];
    }

    /**
     * Obtener texto formateado del stock con equivalencia
     * Ej: "149 pastillas (≈ 4 blisters + 29 pastillas)"
     */
    public function getStockFormateadoAttribute()
    {
        $cantidadBase = $this->stock_actual;
        $texto = "{$cantidadBase} {$this->unidad_medida}";
        
        if ($this->factor_conversion && $this->factor_conversion > 1) {
            $conversion = $this->convertirBaseAPresentacion($cantidadBase);
            
            if ($conversion['presentacion'] > 0) {
                $texto .= " (≈ {$conversion['presentacion']} {$this->unidad_presentacion}";
                
                if ($conversion['resto'] > 0) {
                    $texto .= " + {$conversion['resto']} {$this->unidad_medida}";
                }
                
                $texto .= ")";
            }
        }
        
        return $texto;
    }

    /**
     * Verificar si tiene conversión configurada
     */
    public function tieneConversion()
    {
        return $this->unidad_presentacion && $this->factor_conversion && $this->factor_conversion > 1;
    }
}
