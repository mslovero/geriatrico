import { Badge } from "@/components/ui/badge";
import type { MedicacionTipo } from "../types";

interface TipoBadgeProps {
  tipo: MedicacionTipo;
}

export function TipoMedicacionBadge({ tipo }: TipoBadgeProps) {
  return tipo === "sos" ? (
    <Badge variant="warning">SOS</Badge>
  ) : (
    <Badge variant="success">Diaria</Badge>
  );
}
