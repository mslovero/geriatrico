import { Badge } from "@/components/ui/badge";
import type { PacienteEstado } from "../types";

const ESTADO_LABEL: Record<PacienteEstado, string> = {
  activo: "Activo",
  temporal: "Temporal",
  ausente: "Ausente",
  suspendido: "Suspendido",
  alta_medica: "Alta médica",
  egresado: "Egresado",
  fallecido: "Fallecido",
  inactivo: "Inactivo",
};

const ESTADO_VARIANT: Record<
  PacienteEstado,
  "default" | "success" | "warning" | "muted" | "destructive" | "secondary"
> = {
  activo: "success",
  temporal: "default",
  ausente: "warning",
  suspendido: "warning",
  alta_medica: "muted",
  egresado: "muted",
  fallecido: "destructive",
  inactivo: "muted",
};

interface PacienteStatusBadgeProps {
  estado: PacienteEstado;
}

export function PacienteStatusBadge({ estado }: PacienteStatusBadgeProps) {
  return (
    <Badge variant={ESTADO_VARIANT[estado]}>{ESTADO_LABEL[estado] ?? estado}</Badge>
  );
}
