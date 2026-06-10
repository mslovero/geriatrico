import { Badge } from "@/components/ui/badge";
import type { CamaEstado } from "../types";

const LABEL: Record<CamaEstado, string> = {
  libre: "Libre",
  ocupada: "Ocupada",
  mantenimiento: "Mantenimiento",
};

const VARIANT: Record<CamaEstado, "success" | "destructive" | "warning"> = {
  libre: "success",
  ocupada: "destructive",
  mantenimiento: "warning",
};

interface CamaEstadoBadgeProps {
  estado: CamaEstado;
}

export function CamaEstadoBadge({ estado }: CamaEstadoBadgeProps) {
  return <Badge variant={VARIANT[estado]}>{LABEL[estado]}</Badge>;
}
