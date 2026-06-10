export interface DashboardSummary {
  pacientes: number;
  camas: {
    total: number;
    ocupadas: number;
    libres: number;
    porcentaje: number;
  };
  alertas_salud: number;
  bajo_stock: number;
}

export interface PacienteSnapshot {
  id: number;
  nombre: string;
  apellido: string;
  cama_id?: number | null;
}

export interface AlertaSalud {
  id: number;
  paciente_id: number;
  paciente: PacienteSnapshot;
  temperatura?: number;
  saturacion_oxigeno?: number;
  glucosa?: number;
  fecha: string;
}

export interface TurnoProximo {
  id: number;
  fecha_hora: string;
  especialidad: string;
  profesional: string;
  paciente: PacienteSnapshot;
}

export interface NotificacionDashboard {
  id: number;
  titulo: string;
  mensaje: string;
  created_at: string;
  color?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  alertas_salud_detalles: AlertaSalud[];
  turnos_proximos: TurnoProximo[];
  notificaciones: NotificacionDashboard[];
}
