export interface PacienteRef {
  id: number;
  nombre: string;
  apellido: string;
}

// === Dietas ===
export type DietaTipo =
  | "General"
  | "Diabética"
  | "Hiposódica"
  | "Hipotósica"
  | "Hipercalórica"
  | "Astringente"
  | "Rica en Fibra";

export type DietaConsistencia =
  | "Sólida"
  | "Blanda"
  | "Procesada"
  | "Papilla"
  | "Líquida";

export interface Dieta {
  id: number;
  paciente_id: number;
  tipo: DietaTipo;
  consistencia: DietaConsistencia;
  alergias?: string | null;
  observaciones?: string | null;
  paciente?: PacienteRef | null;
  created_at?: string;
  updated_at?: string;
}

export interface DietaFormValues {
  id?: number;
  paciente_id: number;
  tipo: DietaTipo;
  consistencia: DietaConsistencia;
  alergias?: string;
  observaciones?: string;
}

// === Archivos ===
export interface ArchivoAdjunto {
  id: number;
  paciente_id?: number | null;
  tipo: string;
  ruta_archivo: string;
  descripcion?: string | null;
  paciente?: PacienteRef | null;
  created_at?: string;
}

export interface ArchivoFormValues {
  id?: number;
  paciente_id?: number | null;
  tipo: string;
  descripcion?: string;
  archivo?: File | null;
}

export const DIETA_TIPOS: Array<{ value: DietaTipo; label: string }> = [
  { value: "General", label: "General / Basal" },
  { value: "Diabética", label: "Diabética (sin azúcar)" },
  { value: "Hiposódica", label: "Hiposódica (sin sal)" },
  { value: "Hipotósica", label: "Hipotósica (baja en grasas)" },
  { value: "Hipercalórica", label: "Hipercalórica" },
  { value: "Astringente", label: "Astringente" },
  { value: "Rica en Fibra", label: "Rica en fibra" },
];

export const DIETA_CONSISTENCIAS: Array<{ value: DietaConsistencia; label: string }> = [
  { value: "Sólida", label: "Sólida (normal)" },
  { value: "Blanda", label: "Blanda / fácil masticación" },
  { value: "Procesada", label: "Procesada / picada" },
  { value: "Papilla", label: "Papilla / puré" },
  { value: "Líquida", label: "Líquida" },
];

export const ARCHIVO_TIPOS: Array<{ value: string; label: string }> = [
  { value: "estudio", label: "Estudio médico" },
  { value: "receta", label: "Receta" },
  { value: "consentimiento", label: "Consentimiento" },
  { value: "obra_social", label: "Obra social" },
  { value: "documento", label: "Documento personal" },
  { value: "otro", label: "Otro" },
];
