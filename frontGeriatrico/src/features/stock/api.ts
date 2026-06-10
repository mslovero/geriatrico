import { del, get, post, put } from "@/api/api";
import type {
  ConsumoPaciente,
  Lote,
  LoteFormValues,
  Proveedor,
  ProveedorFormValues,
  ResumenStockReporte,
  StockItem,
  StockItemFormValues,
  TopMedicamento,
} from "./types";

interface PaginatedResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | PaginatedResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

// === Stock items ===
export async function fetchStockItems(): Promise<StockItem[]> {
  const res = await get<StockItem[] | PaginatedResponse<StockItem>>("/stock-items");
  return unwrap<StockItem>(res);
}

export const createStockItem = (v: StockItemFormValues) =>
  post<StockItem>("/stock-items", v);

export const updateStockItem = (id: number, v: StockItemFormValues) =>
  put<StockItem>(`/stock-items/${id}`, v);

export const deleteStockItem = (id: number) => del(`/stock-items/${id}`);

export async function fetchStockItemsBajoStock(): Promise<StockItem[]> {
  const res = await get<StockItem[] | PaginatedResponse<StockItem>>(
    "/stock-items-bajo-stock"
  );
  return unwrap<StockItem>(res);
}

export async function fetchStockItemsProximosVencer(): Promise<StockItem[]> {
  const res = await get<StockItem[] | PaginatedResponse<StockItem>>(
    "/stock-items-proximos-vencer"
  );
  return unwrap<StockItem>(res);
}

// === Lotes ===
export async function fetchLotes(): Promise<Lote[]> {
  const res = await get<Lote[] | PaginatedResponse<Lote>>("/lotes-stock");
  return unwrap<Lote>(res);
}

export const createLote = (v: LoteFormValues) => post<Lote>("/lotes-stock", v);

export const updateLote = (id: number, v: LoteFormValues) =>
  put<Lote>(`/lotes-stock/${id}`, v);

// === Proveedores ===
export async function fetchProveedores(): Promise<Proveedor[]> {
  const res = await get<Proveedor[] | PaginatedResponse<Proveedor>>("/proveedores");
  return unwrap<Proveedor>(res);
}

export const createProveedor = (v: ProveedorFormValues) =>
  post<Proveedor>("/proveedores", v);

export const updateProveedor = (id: number, v: ProveedorFormValues) =>
  put<Proveedor>(`/proveedores/${id}`, v);

export const deleteProveedor = (id: number) => del(`/proveedores/${id}`);

// === Reportes ===
export const fetchResumenGeneral = () =>
  get<ResumenStockReporte>("/reportes/resumen-general");

interface PeriodoArgs {
  desde?: string;
  hasta?: string;
}

function buildQuery(args: PeriodoArgs): string {
  const params = new URLSearchParams();
  if (args.desde) params.set("fecha_desde", args.desde);
  if (args.hasta) params.set("fecha_hasta", args.hasta);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const fetchConsumoPaciente = (pacienteId: number, args: PeriodoArgs = {}) =>
  get<ConsumoPaciente>(`/reportes/consumo-paciente/${pacienteId}${buildQuery(args)}`);

interface TopMedicamentosArgs extends PeriodoArgs {
  limite?: number;
}

export async function fetchTopMedicamentos(
  args: TopMedicamentosArgs = {}
): Promise<TopMedicamento[]> {
  const params = new URLSearchParams();
  params.set("limite", String(args.limite ?? 10));
  if (args.desde) params.set("fecha_desde", args.desde);
  if (args.hasta) params.set("fecha_hasta", args.hasta);
  const res = await get<{ top_medicamentos?: TopMedicamento[] }>(
    `/reportes/top-medicamentos?${params.toString()}`
  );
  return res?.top_medicamentos ?? [];
}
