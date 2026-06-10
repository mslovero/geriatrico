import { Badge } from "@/components/ui/badge";
import type { StockPropiedad } from "../types";

interface PropiedadBadgeProps {
  propiedad: StockPropiedad;
  pacienteNombre?: string | null;
}

export function PropiedadBadge({ propiedad, pacienteNombre }: PropiedadBadgeProps) {
  if (propiedad === "geriatrico") {
    return <Badge variant="success">Geriátrico</Badge>;
  }
  return <Badge variant="warning">{pacienteNombre ?? "Paciente"}</Badge>;
}
