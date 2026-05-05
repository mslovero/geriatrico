<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Añade índices para mejorar el rendimiento de queries frecuentes
     */
    public function up(): void
    {
        // Índices para stock_items
        Schema::table('stock_items', function (Blueprint $table) {
            $table->index('propiedad', 'idx_stock_items_propiedad');
            $table->index('paciente_propietario_id', 'idx_stock_items_paciente');
            $table->index('categoria', 'idx_stock_items_categoria');
            $table->index(['stock_actual', 'punto_reorden'], 'idx_stock_items_alertas');
        });

        // Índices para medicacions
        Schema::table('medicacions', function (Blueprint $table) {
            $table->index('stock_item_id', 'idx_medicacions_stock_item');
            $table->index('paciente_id', 'idx_medicacions_paciente');
        });

        // Índices para movimientos_stock
        Schema::table('movimientos_stock', function (Blueprint $table) {
            $table->index('tipo_movimiento', 'idx_movimientos_tipo');
            $table->index('stock_item_id', 'idx_movimientos_stock_item');
            $table->index('paciente_id', 'idx_movimientos_paciente');
            $table->index('created_at', 'idx_movimientos_fecha');
            $table->index(['stock_item_id', 'tipo_movimiento', 'created_at'], 'idx_movimientos_reportes');
        });

        // Índices para lotes_stock
        Schema::table('lotes_stock', function (Blueprint $table) {
            $table->index('stock_item_id', 'idx_lotes_stock_item');
            $table->index('estado', 'idx_lotes_estado');
            $table->index('fecha_vencimiento', 'idx_lotes_vencimiento');
            $table->index(['stock_item_id', 'estado', 'fecha_vencimiento'], 'idx_lotes_fifo');
        });

        // Índices para registro_medicacions (Corregido: era registro_medicaciones)
        Schema::table('registro_medicacions', function (Blueprint $table) {
            $table->index('medicacion_id', 'idx_registro_medicacion');
            $table->index('lote_stock_id', 'idx_registro_lote');
            $table->index('fecha_hora', 'idx_registro_fecha');
            $table->index(['medicacion_id', 'fecha_hora'], 'idx_registro_historial');
        });

        // Índices para notifications (Corregido: era notificaciones)
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('tipo', 'idx_notifications_tipo');
            $table->index('leida', 'idx_notifications_leida');
            $table->index('created_at', 'idx_notifications_fecha');
            $table->index(['leida', 'created_at'], 'idx_notifications_activas');
        });

        // Índices para historial_medicos (Corregido: era historiales_medicos)
        Schema::table('historial_medicos', function (Blueprint $table) {
            $table->index('paciente_id', 'idx_historiales_paciente');
            $table->index('fecha', 'idx_historiales_fecha');
            $table->index(['paciente_id', 'fecha'], 'idx_historiales_paciente_fecha');
        });

        // Índices para signo_vitals (Corregido: era signos_vitales)
        Schema::table('signo_vitals', function (Blueprint $table) {
            $table->index('paciente_id', 'idx_signos_paciente');
            $table->index('fecha', 'idx_signos_fecha');
            $table->index(['paciente_id', 'fecha'], 'idx_signos_seguimiento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->dropIndex('idx_stock_items_propiedad');
            $table->dropIndex('idx_stock_items_paciente');
            $table->dropIndex('idx_stock_items_categoria');
            $table->dropIndex('idx_stock_items_alertas');
        });

        Schema::table('medicacions', function (Blueprint $table) {
            $table->dropIndex('idx_medicacions_stock_item');
            $table->dropIndex('idx_medicacions_paciente');
        });

        Schema::table('movimientos_stock', function (Blueprint $table) {
            $table->dropIndex('idx_movimientos_tipo');
            $table->dropIndex('idx_movimientos_stock_item');
            $table->dropIndex('idx_movimientos_paciente');
            $table->dropIndex('idx_movimientos_fecha');
            $table->dropIndex('idx_movimientos_reportes');
        });

        Schema::table('lotes_stock', function (Blueprint $table) {
            $table->dropIndex('idx_lotes_stock_item');
            $table->dropIndex('idx_lotes_estado');
            $table->dropIndex('idx_lotes_vencimiento');
            $table->dropIndex('idx_lotes_fifo');
        });

        Schema::table('registro_medicacions', function (Blueprint $table) {
            $table->dropIndex('idx_registro_medicacion');
            $table->dropIndex('idx_registro_lote');
            $table->dropIndex('idx_registro_fecha');
            $table->dropIndex('idx_registro_historial');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_tipo');
            $table->dropIndex('idx_notifications_leida');
            $table->dropIndex('idx_notifications_fecha');
            $table->dropIndex('idx_notifications_activas');
        });

        Schema::table('historial_medicos', function (Blueprint $table) {
            $table->dropIndex('idx_historiales_paciente');
            $table->dropIndex('idx_historiales_fecha');
            $table->dropIndex('idx_historiales_paciente_fecha');
        });

        Schema::table('signo_vitals', function (Blueprint $table) {
            $table->dropIndex('idx_signos_paciente');
            $table->dropIndex('idx_signos_fecha');
            $table->dropIndex('idx_signos_seguimiento');
        });
    }
};
