export interface PacienteRef {
  id: number;
  nombre: string;
  apellido: string;
}

export interface UsuarioRef {
  id: number;
  name: string;
  role?: string;
}

// === Signos vitales ===
export interface SignoVital {
  id: number;
  paciente_id: number;
  fecha: string;
  presion_arterial?: string | null;
  temperatura?: number | null;
  frecuencia_cardiaca?: number | null;
  saturacion_oxigeno?: number | null;
  glucosa?: number | null;
  observaciones?: string | null;
  registrado_por?: string | null;
  paciente?: PacienteRef | null;
}

export interface SignoVitalFormValues {
  id?: number;
  paciente_id: number;
  fecha: string;
  presion_arterial?: string;
  temperatura?: number | null;
  frecuencia_cardiaca?: number | null;
  saturacion_oxigeno?: number | null;
  glucosa?: number | null;
  observaciones?: string;
  registrado_por: string;
}

// === Historial médico ===
export interface HistorialMedico {
  id: number;
  paciente_id: number;
  fecha: string;
  observacion: string;
  medico_responsable?: string | null;
  paciente?: PacienteRef | null;
}

export interface HistorialMedicoFormValues {
  id?: number;
  paciente_id: number;
  fecha: string;
  observacion: string;
  medico_responsable?: string;
}

// === Incidencias ===
export type IncidenciaSeveridad = "leve" | "moderada" | "grave" | "critica";

export interface Incidencia {
  id: number;
  paciente_id: number;
  fecha_hora: string;
  tipo: string;
  severidad: IncidenciaSeveridad;
  descripcion: string;
  acciones_tomadas?: string | null;
  user_id?: number | null;
  paciente?: PacienteRef | null;
  user?: UsuarioRef | null;
}

export interface IncidenciaFormValues {
  id?: number;
  paciente_id: number;
  fecha_hora: string;
  tipo: string;
  severidad: IncidenciaSeveridad;
  descripcion: string;
  acciones_tomadas?: string;
  user_id?: number | null;
}

export const TIPOS_INCIDENCIA = [
  "Caída",
  "Agresión",
  "Médico",
  "Conducta",
  "Otro",
] as const;

export const SEVERIDADES: Array<{
  value: IncidenciaSeveridad;
  label: string;
  description: string;
}> = [
  { value: "leve", label: "Leve", description: "Sin daños" },
  { value: "moderada", label: "Moderada", description: "Requiere atención simple" },
  { value: "grave", label: "Grave", description: "Requiere traslado/médico" },
  { value: "critica", label: "Crítica", description: "Riesgo de vida" },
];

// === Turnos ===
export type TurnoEstado = "pendiente" | "completado" | "cancelado";

export interface TurnoMedico {
  id: number;
  paciente_id: number;
  fecha_hora: string;
  especialidad: string;
  profesional: string;
  lugar?: string | null;
  estado: TurnoEstado;
  observaciones?: string | null;
  paciente?: PacienteRef | null;
}

export interface TurnoFormValues {
  id?: number;
  paciente_id: number;
  fecha_hora: string;
  especialidad: string;
  profesional: string;
  lugar?: string;
  estado: TurnoEstado;
  observaciones?: string;
}

export const TURNO_ESTADOS: Array<{ value: TurnoEstado; label: string }> = [
  { value: "pendiente", label: "Pendiente" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
];

// === Rangos vitales ===
export interface VitalRange {
  min: number;
  max: number;
}

export const VITAL_RANGES = {
  presion_sistolica: { min: 90, max: 140 },
  temperatura: { min: 36, max: 37.5 },
  frecuencia_cardiaca: { min: 60, max: 100 },
  saturacion_oxigeno: { min: 94, max: 100 },
  glucosa: { min: 70, max: 140 },
} satisfies Record<string, VitalRange>;
