import { Badge } from "@/components/ui/badge";

type Role = "admin" | "medico" | "enfermero" | "administrativo" | "staff" | string;

const LABEL: Record<string, string> = {
  admin: "Administrador",
  medico: "Médico",
  enfermero: "Enfermero",
  administrativo: "Administrativo",
  staff: "Staff",
};

const VARIANT: Record<string, "default" | "success" | "warning" | "muted" | "secondary"> = {
  admin: "default",
  medico: "success",
  enfermero: "secondary",
  administrativo: "muted",
  staff: "muted",
};

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge variant={VARIANT[role] ?? "muted"}>{LABEL[role] ?? role}</Badge>;
}
