import { del, get, post, put } from "@/api/api";
import type { Usuario, UsuarioFormValues } from "./types";

interface CollectionResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | CollectionResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const res = await get<Usuario[] | CollectionResponse<Usuario>>("/users");
  return unwrap<Usuario>(res);
}

export async function createUsuario(values: UsuarioFormValues): Promise<Usuario> {
  return post<Usuario>("/users", values);
}

export async function updateUsuario(
  id: number,
  values: UsuarioFormValues
): Promise<Usuario> {
  const payload: Partial<UsuarioFormValues> = { ...values };
  if (!payload.password) delete payload.password;
  return put<Usuario>(`/users/${id}`, payload);
}

export async function deleteUsuario(id: number): Promise<void> {
  await del(`/users/${id}`);
}
