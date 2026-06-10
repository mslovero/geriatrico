import { useCallback, useEffect, useState } from "react";
import { del, get, post } from "@/api/api";
import type { AppNotification, NotificacionTipo } from "@/types/notifications";

interface NotificacionesResponse {
  notificaciones: AppNotification[];
  total_no_leidas?: number;
}

interface UseNotificationsResult {
  notificaciones: AppNotification[];
  totalNoLeidas: number;
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  eliminarNotificacion: (id: number) => Promise<void>;
  formatearTiempoRelativo: (fecha: string) => string;
  getColorClass: (tipo: NotificacionTipo, color?: string) => string;
  getIcono: (tipo: NotificacionTipo, icono?: string) => string;
}

const COLORES: Record<string, string> = {
  incidencia: "warning",
  medicacion: "info",
  stock_bajo: "warning",
  stock_vencimiento: "danger",
  paciente_nuevo: "success",
  paciente_alta: "success",
  turno: "primary",
  signo_vital_alerta: "danger",
  sistema: "secondary",
};

const ICONOS: Record<string, string> = {
  incidencia: "bi-exclamation-triangle-fill",
  medicacion: "bi-capsule",
  stock_bajo: "bi-box-seam",
  stock_vencimiento: "bi-calendar-x",
  paciente_nuevo: "bi-person-plus-fill",
  paciente_alta: "bi-person-check-fill",
  turno: "bi-calendar-event",
  signo_vital_alerta: "bi-heart-pulse-fill",
  sistema: "bi-info-circle-fill",
};

export function useNotifications(pollInterval = 60_000): UseNotificationsResult {
  const [notificaciones, setNotificaciones] = useState<AppNotification[]>([]);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchNotificaciones = useCallback(async () => {
    try {
      const response = await get<NotificacionesResponse | AppNotification[]>(
        "/notificaciones/no-leidas"
      );

      if (response && !Array.isArray(response) && Array.isArray(response.notificaciones)) {
        setNotificaciones(response.notificaciones);
        setTotalNoLeidas(response.total_no_leidas ?? 0);
      } else if (Array.isArray(response)) {
        setNotificaciones(response);
        setTotalNoLeidas(response.filter((n) => !n.leida).length);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err);
      setNotificaciones([]);
      setTotalNoLeidas(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarLeida = useCallback(async (id: number) => {
    try {
      await post(`/notificaciones/${id}/marcar-leida`);
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, leida: true, leida_at: new Date().toISOString() } : n
        )
      );
      setTotalNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    try {
      await post("/notificaciones/marcar-todas-leidas");
      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, leida: true, leida_at: new Date().toISOString() }))
      );
      setTotalNoLeidas(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  const eliminarNotificacion = useCallback(
    async (id: number) => {
      try {
        await del(`/notificaciones/${id}`);
        const notif = notificaciones.find((n) => n.id === id);
        setNotificaciones((prev) => prev.filter((n) => n.id !== id));
        if (notif && !notif.leida) {
          setTotalNoLeidas((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [notificaciones]
  );

  const formatearTiempoRelativo = (fecha: string): string => {
    const now = Date.now();
    const notifDate = new Date(fecha).getTime();
    const diffMins = Math.floor((now - notifDate) / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  const getColorClass = (tipo: NotificacionTipo, color?: string): string =>
    color ?? COLORES[tipo] ?? "info";

  const getIcono = (tipo: NotificacionTipo, icono?: string): string =>
    icono ?? ICONOS[tipo] ?? "bi-bell-fill";

  useEffect(() => {
    void fetchNotificaciones();
    void post("/notificaciones/generar").catch(() => undefined);
  }, [fetchNotificaciones]);

  useEffect(() => {
    if (pollInterval <= 0) return;
    const interval = window.setInterval(() => {
      void fetchNotificaciones();
    }, pollInterval);
    return () => window.clearInterval(interval);
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
    formatearTiempoRelativo,
    getColorClass,
    getIcono,
  };
}

export default useNotifications;
