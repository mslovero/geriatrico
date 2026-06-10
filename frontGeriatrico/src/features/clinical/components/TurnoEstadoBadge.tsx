import { Badge } from "@/components/ui/badge";
import type { TurnoEstado } from "../types";

const LABEL: Record<TurnoEstado, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

const VARIANT: Record<TurnoEstado, "warning" | "success" | "muted"> = {
  pendiente: "warning",
  completado: "success",
  cancelado: "muted",
};

export function TurnoEstadoBadge({ estado }: { estado: TurnoEstado }) {
  return <Badge variant={VARIANT[estado]}>{LABEL[estado]}</Badge>;
}
