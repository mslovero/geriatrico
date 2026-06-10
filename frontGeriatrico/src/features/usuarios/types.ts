export type UserRole = "admin" | "medico" | "enfermero" | "administrativo" | "staff";

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioFormValues {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export const USER_ROLES: Array<{ value: UserRole; label: string }> = [
  { value: "admin", label: "Administrador" },
  { value: "medico", label: "Médico" },
  { value: "enfermero", label: "Enfermero" },
  { value: "administrativo", label: "Administrativo" },
  { value: "staff", label: "Staff" },
];
