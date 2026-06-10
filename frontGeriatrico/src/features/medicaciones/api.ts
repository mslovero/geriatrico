import { del, get, post, put } from "@/api/api";
import type {
  BatchMedicacionItem,
  EstadoMedicacionResponse,
  Medicacion,
  MedicacionFormValues,
  OrigenPago,
  StockItemRef,
} from "./types";

interface PaginatedResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | PaginatedResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export async function fetchMedicaciones(): Promise<Medicacion[]> {
  const res = await get<Medicacion[] | PaginatedResponse<Medicacion>>("/medicamentos");
  return unwrap<Medicacion>(res);
}

export const createMedicacion = (v: MedicacionFormValues) =>
  post<Medicacion>("/medicamentos", v);

export const updateMedicacion = (id: number, v: MedicacionFormValues) =>
  put<Medicacion>(`/medicamentos/${id}`, v);

export const deleteMedicacion = (id: number) => del(`/medicamentos/${id}`);

export const createMedicacionesBatch = (paciente_id: number, items: BatchMedicacionItem[]) =>
  post<Medicacion[]>("/medicamentos/batch", { paciente_id, medicamentos: items });

export async function fetchEstadoMedicaciones(): Promise<EstadoMedicacionResponse> {
  return (await get<EstadoMedicacionResponse>("/medicamentos/estado")) as EstadoMedicacionResponse;
}

interface FetchStockArgs {
  pacienteId: number;
  origen: OrigenPago;
}

export async function fetchStockItemsParaMedicacion({
  pacienteId,
  origen,
}: FetchStockArgs): Promise<StockItemRef[]> {
  if (!pacienteId || origen === "obra_social") return [];

  const params = new URLSearchParams({ activo: "1", tipo: "medicamento" });
  if (origen === "geriatrico") params.set("propiedad", "geriatrico");
  if (origen === "paciente") {
    params.set("propiedad", "paciente");
    params.set("paciente_id", String(pacienteId));
  }
  const res = await get<StockItemRef[] | PaginatedResponse<StockItemRef>>(
    `/stock-items?${params.toString()}`
  );
  return unwrap<StockItemRef>(res);
}
