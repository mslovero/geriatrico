import { Badge } from "@/components/ui/badge";
import type { LoteEstado } from "../types";

const LABEL: Record<LoteEstado, string> = {
  activo: "Activo",
  vencido: "Vencido",
  agotado: "Agotado",
};

const VARIANT: Record<LoteEstado, "success" | "destructive" | "muted"> = {
  activo: "success",
  vencido: "destructive",
  agotado: "muted",
};

interface LoteEstadoBadgeProps {
  estado: LoteEstado;
}

export function LoteEstadoBadge({ estado }: LoteEstadoBadgeProps) {
  return <Badge variant={VARIANT[estado]}>{LABEL[estado]}</Badge>;
}
