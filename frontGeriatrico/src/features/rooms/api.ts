import { del, get, post, put } from "@/api/api";
import type {
  Cama,
  CamaFormValues,
  Habitacion,
  HabitacionFormValues,
} from "./types";

interface CollectionResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | CollectionResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export async function fetchHabitaciones(): Promise<Habitacion[]> {
  const res = await get<Habitacion[] | CollectionResponse<Habitacion>>("/habitaciones");
  return unwrap<Habitacion>(res);
}

export async function fetchCamas(): Promise<Cama[]> {
  const res = await get<Cama[] | CollectionResponse<Cama>>("/camas");
  return unwrap<Cama>(res);
}

export const createHabitacion = (v: HabitacionFormValues) =>
  post<Habitacion>("/habitaciones", v);

export const updateHabitacion = (id: number, v: HabitacionFormValues) =>
  put<Habitacion>(`/habitaciones/${id}`, v);

export const deleteHabitacion = (id: number) => del(`/habitaciones/${id}`);

export const createCama = (v: CamaFormValues) => post<Cama>("/camas", v);

export const updateCama = (id: number, v: CamaFormValues) =>
  put<Cama>(`/camas/${id}`, v);

export const deleteCama = (id: number) => del(`/camas/${id}`);
