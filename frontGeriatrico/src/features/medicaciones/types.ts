export type MedicacionTipo = "diaria" | "sos";
export type OrigenPago = "obra_social" | "geriatrico" | "paciente";

export interface PacienteRef {
  id: number;
  nombre: string;
  apellido: string;
}

export interface StockItemRef {
  id: number;
  nombre: string;
  unidad_medida?: string;
  stock_actual?: number;
  stock_minimo?: number;
  propiedad?: "geriatrico" | "paciente";
  paciente_propietario_id?: number | null;
}

export interface Medicacion {
  id: number;
  nombre: string;
  dosis?: string | null;
  frecuencia?: string | null;
  tipo: MedicacionTipo;
  cantidad_mensual?: number | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  origen_pago: OrigenPago;
  observaciones?: string | null;
  paciente_id: number;
  stock_item_id?: number | null;
  paciente?: PacienteRef | null;
  stock_item?: StockItemRef | null;
}

export interface MedicacionFormValues {
  id?: number;
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  tipo: MedicacionTipo;
  cantidad_mensual?: number | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  origen_pago: OrigenPago;
  observaciones?: string;
  paciente_id: number;
  stock_item_id?: number | null;
}

export interface BatchMedicacionItem {
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  tipo: MedicacionTipo;
  cantidad_mensual?: number | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  origen_pago: OrigenPago;
  observaciones?: string;
  stock_item_id?: number | null;
}

export interface EstadoMedicacionDetalle {
  id: number;
  nombre: string;
  paciente: string;
  origen_pago: OrigenPago;
  stock_item_id: number | null;
  estado: "correcto" | "sin_stock" | "stock_bajo" | "sin_vincular" | "inconsistente" | "error";
  mensaje?: string;
  sugerencia?: string;
  stock_nombre?: string;
  stock_actual?: number;
  stock_minimo?: number;
  stock_propiedad?: string;
  error_consistencia?: string;
}

export interface EstadoMedicacionResumen {
  total: number;
  correctas: number;
  sin_vincular: number;
  sin_stock: number;
  stock_bajo: number;
  inconsistentes: number;
}

export interface EstadoMedicacionResponse {
  resumen: EstadoMedicacionResumen;
  alertas: {
    criticas: number;
    advertencias: number;
  };
  detalles: {
    sin_stock: EstadoMedicacionDetalle[];
    stock_bajo: EstadoMedicacionDetalle[];
    sin_vincular: EstadoMedicacionDetalle[];
    inconsistentes: EstadoMedicacionDetalle[];
  };
  correctas: EstadoMedicacionDetalle[];
}

export const ORIGENES_PAGO: Array<{ value: OrigenPago; label: string; hint: string }> = [
  {
    value: "geriatrico",
    label: "Geriátrico",
    hint: "Descontará del stock del geriátrico",
  },
  {
    value: "obra_social",
    label: "Obra social",
    hint: "Sólo registro, no afecta stock",
  },
  {
    value: "paciente",
    label: "Paciente",
    hint: "Descontará del stock personal del paciente",
  },
];

export const TIPOS_MEDICACION: Array<{ value: MedicacionTipo; label: string }> = [
  { value: "diaria", label: "Diaria (crónica)" },
  { value: "sos", label: "SOS (ocasional)" },
];
