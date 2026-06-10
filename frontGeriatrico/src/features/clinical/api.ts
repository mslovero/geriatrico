import { del, get, post, put } from "@/api/api";
import type {
  HistorialMedico,
  HistorialMedicoFormValues,
  Incidencia,
  IncidenciaFormValues,
  SignoVital,
  SignoVitalFormValues,
  TurnoFormValues,
  TurnoMedico,
} from "./types";

interface PaginatedResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | PaginatedResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

// === Signos vitales ===
export async function fetchSignosVitales(): Promise<SignoVital[]> {
  const res = await get<SignoVital[] | PaginatedResponse<SignoVital>>("/signos-vitales");
  return unwrap(res);
}

export async function fetchSignosVitalesPaciente(
  pacienteId: number,
  limit = 30
): Promise<SignoVital[]> {
  const res = await get<SignoVital[] | PaginatedResponse<SignoVital>>(
    `/signos-vitales/paciente/${pacienteId}?limit=${limit}`
  );
  return unwrap(res);
}

export const createSignoVital = (v: SignoVitalFormValues) =>
  post<SignoVital>("/signos-vitales", v);

export const updateSignoVital = (id: number, v: SignoVitalFormValues) =>
  put<SignoVital>(`/signos-vitales/${id}`, v);

export const deleteSignoVital = (id: number) => del(`/signos-vitales/${id}`);

// === Historial médico ===
export async function fetchHistorialMedico(): Promise<HistorialMedico[]> {
  const res = await get<HistorialMedico[] | PaginatedResponse<HistorialMedico>>(
    "/historiales-medicos"
  );
  return unwrap(res);
}

export const createHistorial = (v: HistorialMedicoFormValues) =>
  post<HistorialMedico>("/historiales-medicos", v);

export const updateHistorial = (id: number, v: HistorialMedicoFormValues) =>
  put<HistorialMedico>(`/historiales-medicos/${id}`, v);

export const deleteHistorial = (id: number) => del(`/historiales-medicos/${id}`);

// === Incidencias ===
export async function fetchIncidencias(): Promise<Incidencia[]> {
  const res = await get<Incidencia[] | PaginatedResponse<Incidencia>>("/incidencias");
  return unwrap(res);
}

export const createIncidencia = (v: IncidenciaFormValues) =>
  post<Incidencia>("/incidencias", v);

export const updateIncidencia = (id: number, v: IncidenciaFormValues) =>
  put<Incidencia>(`/incidencias/${id}`, v);

export const deleteIncidencia = (id: number) => del(`/incidencias/${id}`);

// === Turnos ===
export async function fetchTurnos(): Promise<TurnoMedico[]> {
  const res = await get<TurnoMedico[] | PaginatedResponse<TurnoMedico>>("/turnos-medicos");
  return unwrap(res);
}

export const createTurno = (v: TurnoFormValues) => post<TurnoMedico>("/turnos-medicos", v);

export const updateTurno = (id: number, v: TurnoFormValues) =>
  put<TurnoMedico>(`/turnos-medicos/${id}`, v);

export const deleteTurno = (id: number) => del(`/turnos-medicos/${id}`);

// === Personal (para selects de responsables) ===
interface PersonalUser {
  id: number;
  name: string;
  role: string;
}

export async function fetchPersonal(): Promise<PersonalUser[]> {
  const roles = ["enfermero", "medico", "administrativo"];
  const results = await Promise.all(
    roles.map((r) =>
      get<PersonalUser[] | PaginatedResponse<PersonalUser>>(`/users?role=${r}`)
    )
  );
  return results.flatMap((r) => unwrap<PersonalUser>(r));
}
