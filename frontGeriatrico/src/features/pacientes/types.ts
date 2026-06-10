export type PacienteEstado =
  | "activo"
  | "temporal"
  | "ausente"
  | "suspendido"
  | "alta_medica"
  | "egresado"
  | "fallecido"
  | "inactivo";

export interface ContactoEmergencia {
  nombre?: string;
  telefono?: string;
  relacion?: string;
}

export interface Habitacion {
  id: number;
  numero: string;
  capacidad: number;
}

export interface Cama {
  id: number;
  numero_cama: string;
  habitacion_id: number;
  estado: "libre" | "ocupada" | "mantenimiento";
}

export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  nombre_completo?: string;
  dni: string;
  fecha_nacimiento?: string | null;
  habitacion_id?: number | null;
  cama_id?: number | null;
  contacto_emergencia?: ContactoEmergencia | null;
  medico_cabecera?: string | null;
  patologias?: string | null;
  estado: PacienteEstado;
  habitacion?: Habitacion | null;
  cama?: Cama | null;
  created_at?: string;
  updated_at?: string;
}

export interface PacienteFormValues {
  id?: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento?: string | null;
  habitacion_id?: number | null;
  cama_id?: number | null;
  contacto_emergencia?: ContactoEmergencia | null;
  medico_cabecera?: string | null;
  patologias?: string | null;
  estado: PacienteEstado;
}

export const PACIENTE_ESTADOS: Array<{ value: PacienteEstado; label: string }> = [
  { value: "activo", label: "Activo" },
  { value: "temporal", label: "Temporal" },
  { value: "alta_medica", label: "Alta médica" },
  { value: "fallecido", label: "Fallecido" },
  { value: "inactivo", label: "Inactivo" },
];
