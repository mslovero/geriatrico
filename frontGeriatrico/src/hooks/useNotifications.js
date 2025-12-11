import { useState, useEffect, useCallback } from 'react';
import { get, post, del } from '../api/api';

/**
 * Hook para manejar las notificaciones del sistema
 * Provee funcionalidades para obtener, marcar como leídas y eliminar notificaciones
 */
export function useNotifications(pollInterval = 60000) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar notificaciones no leídas del servidor
   */
  const fetchNotificaciones = useCallback(async () => {
    try {
      const response = await get('/notificaciones/no-leidas');
      
      if (response && response.notificaciones) {
        setNotificaciones(response.notificaciones);
        setTotalNoLeidas(response.total_no_leidas || 0);
      } else if (Array.isArray(response)) {
        setNotificaciones(response);
        setTotalNoLeidas(response.filter(n => !n.leida).length);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err);
      // Si hay error, usar array vacío
      setNotificaciones([]);
      setTotalNoLeidas(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marcar una notificación como leída
   */
  const marcarLeida = async (id) => {
    try {
      await post(`/notificaciones/${id}/marcar-leida`);
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true, leida_at: new Date().toISOString() } : n)
      );
      setTotalNoLeidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  /**
   * Marcar todas las notificaciones como leídas
   */
  const marcarTodasLeidas = async () => {
    try {
      await post('/notificaciones/marcar-todas-leidas');
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => ({ ...n, leida: true, leida_at: new Date().toISOString() }))
      );
      setTotalNoLeidas(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  /**
   * Eliminar una notificación
   */
  const eliminarNotificacion = async (id) => {
    try {
      await del(`/notificaciones/${id}`);
      
      // Actualizar estado local
      const notif = notificaciones.find(n => n.id === id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.leida) {
        setTotalNoLeidas(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  /**
   * Generar notificaciones automáticas (para mantener actualizadas las alertas)
   */
  const generarAutomaticas = async () => {
    try {
      await post('/notificaciones/generar');
      // Recargar después de generar
      await fetchNotificaciones();
    } catch (err) {
      console.error('Error generating notifications:', err);
    }
  };

  /**
   * Formatear tiempo relativo
   */
  const formatearTiempoRelativo = (fecha) => {
    const now = new Date();
    const notifDate = new Date(fecha);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifDate.toLocaleDateString('es-AR');
  };

  /**
   * Obtener color de la notificación
   */
  const getColorClass = (tipo, color) => {
    const colores = {
      incidencia: 'warning',
      medicacion: 'info',
      stock_bajo: 'warning',
      stock_vencimiento: 'danger',
      paciente_nuevo: 'success',
      paciente_alta: 'success',
      turno: 'primary',
      signo_vital_alerta: 'danger',
      sistema: 'secondary',
    };
    return color || colores[tipo] || 'info';
  };

  /**
   * Obtener icono de la notificación
   */
  const getIcono = (tipo, icono) => {
    const iconos = {
      incidencia: 'bi-exclamation-triangle-fill',
      medicacion: 'bi-capsule',
      stock_bajo: 'bi-box-seam',
      stock_vencimiento: 'bi-calendar-x',
      paciente_nuevo: 'bi-person-plus-fill',
      paciente_alta: 'bi-person-check-fill',
      turno: 'bi-calendar-event',
      signo_vital_alerta: 'bi-heart-pulse-fill',
      sistema: 'bi-info-circle-fill',
    };
    return icono || iconos[tipo] || 'bi-bell-fill';
  };

  // Cargar notificaciones al montar
  useEffect(() => {
    fetchNotificaciones();
    
    // También generar automáticas al inicio (si el endpoint existe)
    generarAutomaticas().catch(() => {});
  }, [fetchNotificaciones]);

  // Polling para actualizar periódicamente
  useEffect(() => {
    if (pollInterval > 0) {
      const interval = setInterval(fetchNotificaciones, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, fetchNotificaciones]);

  return {
    notificaciones,
    totalNoLeidas,
    loading,
    error,
    refresh: fetchNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
    generarAutomaticas,
    formatearTiempoRelativo,
    getColorClass,
    getIcono,
  };
}

export default useNotifications;
