export type CamaEstado = "libre" | "ocupada" | "mantenimiento";

export interface Habitacion {
  id: number;
  numero: string;
  piso?: number | null;
  capacidad: number;
}

export interface Cama {
  id: number;
  numero_cama: string;
  habitacion_id: number;
  estado: CamaEstado;
  habitacion?: Habitacion | null;
}

export interface HabitacionFormValues {
  id?: number;
  numero: string;
  piso?: number | null;
  capacidad: number;
}

export interface CamaFormValues {
  id?: number;
  numero_cama: string;
  habitacion_id: number;
  estado: CamaEstado;
}

export interface HabitacionResumen {
  totalCamas: number;
  ocupadas: number;
  libres: number;
  mantenimiento: number;
  porcentaje: number;
  estado: "llena" | "vacia" | "parcial";
}

export const CAMA_ESTADOS: Array<{ value: CamaEstado; label: string }> = [
  { value: "libre", label: "Libre" },
  { value: "ocupada", label: "Ocupada" },
  { value: "mantenimiento", label: "Mantenimiento" },
];
