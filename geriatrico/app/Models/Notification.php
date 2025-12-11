<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'tipo',
        'titulo',
        'mensaje',
        'icono',
        'color',
        'enlace',
        'user_id',
        'paciente_id',
        'leida',
        'leida_at',
    ];

    protected $casts = [
        'leida' => 'boolean',
        'leida_at' => 'datetime',
    ];

    /**
     * Tipos de notificación disponibles
     */
    const TIPOS = [
        'incidencia' => ['icono' => 'bi-exclamation-triangle-fill', 'color' => 'warning'],
        'medicacion' => ['icono' => 'bi-capsule', 'color' => 'info'],
        'stock_bajo' => ['icono' => 'bi-box-seam', 'color' => 'warning'],
        'stock_vencimiento' => ['icono' => 'bi-calendar-x', 'color' => 'danger'],
        'paciente_nuevo' => ['icono' => 'bi-person-plus-fill', 'color' => 'success'],
        'paciente_alta' => ['icono' => 'bi-person-check-fill', 'color' => 'success'],
        'turno' => ['icono' => 'bi-calendar-event', 'color' => 'primary'],
        'signo_vital_alerta' => ['icono' => 'bi-heart-pulse-fill', 'color' => 'danger'],
        'sistema' => ['icono' => 'bi-info-circle-fill', 'color' => 'secondary'],
    ];

    /**
     * Obtener el icono por defecto según el tipo
     */
    public function getIconoAttribute($value)
    {
        if ($value) return $value;
        return self::TIPOS[$this->tipo]['icono'] ?? 'bi-bell-fill';
    }

    /**
     * Obtener el color por defecto según el tipo
     */
    public function getColorAttribute($value)
    {
        if ($value && $value !== 'info') return $value;
        return self::TIPOS[$this->tipo]['color'] ?? 'info';
    }

    /**
     * Relación con usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con paciente
     */
    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    /**
     * Scope para notificaciones no leídas
     */
    public function scopeNoLeidas($query)
    {
        return $query->where('leida', false);
    }

    /**
     * Scope para notificaciones del usuario actual o globales
     */
    public function scopeParaUsuario($query, $userId = null)
    {
        return $query->where(function($q) use ($userId) {
            $q->whereNull('user_id');
            if ($userId) {
                $q->orWhere('user_id', $userId);
            }
        });
    }

    /**
     * Marcar como leída
     */
    public function marcarLeida()
    {
        $this->update([
            'leida' => true,
            'leida_at' => now(),
        ]);
    }

    /**
     * Crear notificación de incidencia
     */
    public static function crearIncidencia($paciente, $descripcion, $userId = null)
    {
        return self::create([
            'tipo' => 'incidencia',
            'titulo' => 'Nueva Incidencia',
            'mensaje' => "Paciente {$paciente->nombre} {$paciente->apellido}: {$descripcion}",
            'enlace' => "/incidencias",
            'paciente_id' => $paciente->id,
            'user_id' => $userId,
        ]);
    }

    /**
     * Crear notificación de stock bajo
     */
    public static function crearStockBajo($item)
    {
        return self::create([
            'tipo' => 'stock_bajo',
            'titulo' => 'Stock Bajo',
            'mensaje' => "{$item->nombre} tiene stock bajo: {$item->stock_actual} unidades (mínimo: {$item->stock_minimo})",
            'enlace' => "/stock/items",
        ]);
    }

    /**
     * Crear notificación de vencimiento próximo
     */
    public static function crearVencimientoProximo($item, $lote)
    {
        return self::create([
            'tipo' => 'stock_vencimiento',
            'titulo' => 'Vencimiento Próximo',
            'mensaje' => "{$item->nombre} (Lote: {$lote->numero_lote}) vence el " . $lote->fecha_vencimiento->format('d/m/Y'),
            'enlace' => "/stock/lotes",
        ]);
    }

    /**
     * Crear notificación de nuevo paciente
     */
    public static function crearNuevoPaciente($paciente)
    {
        return self::create([
            'tipo' => 'paciente_nuevo',
            'titulo' => 'Nuevo Ingreso',
            'mensaje' => "Se ha registrado el paciente {$paciente->nombre} {$paciente->apellido}",
            'enlace' => "/pacientes/{$paciente->id}/ficha",
            'paciente_id' => $paciente->id,
        ]);
    }

    /**
     * Crear notificación de medicación pendiente
     */
    public static function crearMedicacionPendiente($cantidadPendientes)
    {
        return self::create([
            'tipo' => 'medicacion',
            'titulo' => 'Medicaciones Pendientes',
            'mensaje' => "Hay {$cantidadPendientes} medicaciones pendientes de administrar",
            'enlace' => "/administracion-medicamentos",
        ]);
    }

    /**
     * Crear notificación de turno programado
     */
    public static function crearTurnoProgramado($turno, $paciente)
    {
        return self::create([
            'tipo' => 'turno',
            'titulo' => 'Turno Programado',
            'mensaje' => "Turno de {$paciente->nombre} {$paciente->apellido} - {$turno->especialidad}",
            'enlace' => "/turnos",
            'paciente_id' => $paciente->id,
        ]);
    }
}
