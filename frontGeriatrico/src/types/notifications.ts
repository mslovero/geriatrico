export type NotificacionTipo =
  | "incidencia"
  | "medicacion"
  | "stock_bajo"
  | "stock_vencimiento"
  | "paciente_nuevo"
  | "paciente_alta"
  | "turno"
  | "signo_vital_alerta"
  | "sistema"
  | string;

export interface NotificacionPacienteRef {
  id: number;
  nombre: string;
  apellido: string;
}

export interface AppNotification {
  id: number;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  enlace?: string | null;
  color?: string;
  icono?: string;
  leida: boolean;
  leida_at?: string | null;
  created_at: string;
  paciente?: NotificacionPacienteRef | null;
}
