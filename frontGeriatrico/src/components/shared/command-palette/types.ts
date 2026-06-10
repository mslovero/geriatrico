export type PaletteMode = "mixed" | "actions" | "navigation";

export interface PacienteLite {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

export interface StockItemLite {
  id: number;
  nombre: string;
  codigo?: string | null;
  stock_actual?: number;
  unidad_medida?: string;
  bajo_stock?: boolean;
}

export interface MedicacionLite {
  id: number;
  nombre: string;
  dosis?: string | null;
  paciente?: {
    nombre: string;
    apellido: string;
  } | null;
}

export interface LoteLite {
  id: number;
  numero_lote: string;
  fecha_vencimiento?: string | null;
  estado: "activo" | "vencido" | "agotado";
  stock_item?: {
    nombre: string;
  } | null;
}

export interface PaletteCache {
  pacientes: PacienteLite[];
  stock: StockItemLite[];
  medicaciones: MedicacionLite[];
  lotes: LoteLite[];
}

export interface PaletteCacheState {
  data: PaletteCache;
  loading: {
    pacientes: boolean;
    stock: boolean;
    medicaciones: boolean;
    lotes: boolean;
  };
  ensure: (key: keyof PaletteCache) => Promise<void>;
}
