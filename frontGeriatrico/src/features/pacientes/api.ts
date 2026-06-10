import { del, get, post, put } from "@/api/api";
import type {
  Cama,
  Habitacion,
  Paciente,
  PacienteFormValues,
} from "./types";

interface CollectionResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | CollectionResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export async function fetchPacientes(): Promise<Paciente[]> {
  const res = await get<Paciente[] | CollectionResponse<Paciente>>("/pacientes");
  return unwrap<Paciente>(res);
}

export async function fetchHabitaciones(): Promise<Habitacion[]> {
  const res = await get<Habitacion[] | CollectionResponse<Habitacion>>("/habitaciones");
  return unwrap<Habitacion>(res);
}

export async function fetchCamas(): Promise<Cama[]> {
  const res = await get<Cama[] | CollectionResponse<Cama>>("/camas");
  return unwrap<Cama>(res);
}

export async function createPaciente(values: PacienteFormValues): Promise<Paciente> {
  return post<Paciente>("/pacientes", values);
}

export async function updatePaciente(
  id: number,
  values: PacienteFormValues
): Promise<Paciente> {
  return put<Paciente>(`/pacientes/${id}`, values);
}

export async function deletePaciente(id: number): Promise<void> {
  await del(`/pacientes/${id}`);
}
