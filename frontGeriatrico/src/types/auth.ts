export type UserRole = "admin" | "medico" | "enfermero" | "administrativo" | "staff";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
