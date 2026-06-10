import { del, get, post, put } from "@/api/api";
import type {
  ArchivoAdjunto,
  ArchivoFormValues,
  Dieta,
  DietaFormValues,
} from "./types";

interface PaginatedResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | PaginatedResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

// === Dietas ===
export async function fetchDietas(): Promise<Dieta[]> {
  const res = await get<Dieta[] | PaginatedResponse<Dieta>>("/dietas");
  return unwrap(res);
}

export const createDieta = (v: DietaFormValues) => post<Dieta>("/dietas", v);

export const updateDieta = (id: number, v: DietaFormValues) =>
  put<Dieta>(`/dietas/${id}`, v);

export const deleteDieta = (id: number) => del(`/dietas/${id}`);

// === Archivos ===
export async function fetchArchivos(): Promise<ArchivoAdjunto[]> {
  const res = await get<ArchivoAdjunto[] | PaginatedResponse<ArchivoAdjunto>>(
    "/archivos-adjuntos"
  );
  return unwrap(res);
}

function toFormData(v: ArchivoFormValues): FormData {
  const fd = new FormData();
  if (v.paciente_id) fd.append("paciente_id", String(v.paciente_id));
  fd.append("tipo", v.tipo);
  if (v.descripcion) fd.append("descripcion", v.descripcion);
  if (v.archivo) fd.append("archivo", v.archivo);
  return fd;
}

export const uploadArchivo = (v: ArchivoFormValues) =>
  post<ArchivoAdjunto>("/archivos-adjuntos", toFormData(v));

export const deleteArchivo = (id: number) => del(`/archivos-adjuntos/${id}`);
