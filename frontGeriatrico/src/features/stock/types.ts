export type StockTipo = "medicamento" | "insumo";
export type StockPropiedad = "geriatrico" | "paciente";
export type LoteEstado = "activo" | "vencido" | "agotado";

export interface Proveedor {
  id: number;
  nombre: string;
  razon_social?: string | null;
  cuit?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  observaciones?: string | null;
}

export interface ProveedorFormValues {
  id?: number;
  nombre: string;
  razon_social?: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  observaciones?: string;
}

export interface StockItem {
  id: number;
  nombre: string;
  tipo: StockTipo;
  codigo?: string | null;
  descripcion?: string | null;
  unidad_medida: string;
  unidad_presentacion?: string | null;
  factor_conversion?: number | null;
  descripcion_presentacion?: string | null;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number | null;
  precio_unitario?: number | null;
  proveedor_id?: number | null;
  observaciones?: string | null;
  propiedad: StockPropiedad;
  paciente_propietario_id?: number | null;
  paciente_propietario?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
  proveedor?: Proveedor | null;
  bajo_stock?: boolean;
}

export interface StockItemFormValues {
  id?: number;
  nombre: string;
  tipo: StockTipo;
  codigo?: string;
  descripcion?: string;
  unidad_medida: string;
  unidad_presentacion?: string;
  factor_conversion?: number | null;
  descripcion_presentacion?: string;
  stock_actual?: number;
  stock_minimo: number;
  stock_maximo?: number | null;
  precio_unitario?: number | null;
  proveedor_id?: number | null;
  observaciones?: string;
  propiedad: StockPropiedad;
  paciente_propietario_id?: number | null;
  fecha_vencimiento_inicial?: string | null;
}

export interface Lote {
  id: number;
  stock_item_id: number;
  numero_lote: string;
  fecha_vencimiento?: string | null;
  fecha_ingreso?: string | null;
  cantidad_inicial: number;
  cantidad_actual: number;
  precio_compra?: number | null;
  estado: LoteEstado;
  observaciones?: string | null;
  stock_item?: StockItem | null;
}

export interface LoteFormValues {
  id?: number;
  stock_item_id: number;
  numero_lote: string;
  fecha_vencimiento: string;
  cantidad_inicial: number;
  precio_compra?: number | null;
  observaciones?: string;
}

export interface ResumenStockReporte {
  stock_geriatrico: {
    total_items: number;
    valor_total: number;
    bajo_stock: number;
    proximos_vencer: number;
  };
  stock_pacientes: {
    total_items: number;
    valor_total: number;
    pacientes_con_stock: number;
  };
  costos_mes_actual: number;
  periodo_actual: {
    desde: string;
    hasta: string;
  };
}

export interface ConsumoPaciente {
  paciente: { id: number; nombre: string };
  total_costo: number;
  total_movimientos: number;
  por_item: Array<{
    stock_item_id: number;
    nombre: string;
    cantidad_total: number;
    costo_total: number;
    unidad_medida?: string;
  }>;
}

export interface TopMedicamento {
  stock_item_id: number;
  nombre: string;
  tipo: string;
  cantidad_total: number;
  costo_total: number;
  veces_usado: number;
  unidad_medida: string;
}

export const PROPIEDADES: Array<{ value: StockPropiedad; label: string }> = [
  { value: "geriatrico", label: "Geriátrico (stock general)" },
  { value: "paciente", label: "Paciente (stock individual)" },
];

export const TIPOS_STOCK: Array<{ value: StockTipo; label: string }> = [
  { value: "medicamento", label: "Medicamento" },
  { value: "insumo", label: "Insumo médico" },
];

export const UNIDADES_MEDIDA: Array<{
  group: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    group: "Medicamentos",
    options: [
      { value: "pastilla", label: "Pastilla / Comprimido" },
      { value: "capsula", label: "Cápsula" },
      { value: "ml", label: "Mililitros (ml)" },
      { value: "gota", label: "Gotas" },
      { value: "unidad", label: "Unidades (insulina, etc.)" },
    ],
  },
  {
    group: "Insumos",
    options: [
      { value: "ampolla", label: "Ampolla" },
      { value: "jeringa", label: "Jeringa" },
      { value: "par", label: "Par (guantes)" },
    ],
  },
];

export const PRESENTACIONES: Array<{ value: string; label: string }> = [
  { value: "blister", label: "Blister" },
  { value: "frasco", label: "Frasco" },
  { value: "caja", label: "Caja" },
  { value: "pen", label: "Pen (insulina)" },
  { value: "envase", label: "Envase" },
  { value: "paquete", label: "Paquete" },
  { value: "tubo", label: "Tubo" },
];
