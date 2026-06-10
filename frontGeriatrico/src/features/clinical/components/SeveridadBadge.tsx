import { Badge } from "@/components/ui/badge";
import type { IncidenciaSeveridad } from "../types";

const LABEL: Record<IncidenciaSeveridad, string> = {
  leve: "Leve",
  moderada: "Moderada",
  grave: "Grave",
  critica: "Crítica",
};

const VARIANT: Record<IncidenciaSeveridad, "success" | "warning" | "destructive"> = {
  leve: "success",
  moderada: "warning",
  grave: "destructive",
  critica: "destructive",
};

export function SeveridadBadge({ severidad }: { severidad: IncidenciaSeveridad }) {
  return <Badge variant={VARIANT[severidad]}>{LABEL[severidad]}</Badge>;
}
