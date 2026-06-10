import { Badge } from "@/components/ui/badge";
import type { OrigenPago } from "../types";

const LABEL: Record<OrigenPago, string> = {
  geriatrico: "Geriátrico",
  obra_social: "Obra social",
  paciente: "Paciente",
};

const VARIANT: Record<OrigenPago, "success" | "default" | "warning"> = {
  geriatrico: "success",
  obra_social: "default",
  paciente: "warning",
};

interface OrigenPagoBadgeProps {
  origen: OrigenPago;
}

export function OrigenPagoBadge({ origen }: OrigenPagoBadgeProps) {
  return <Badge variant={VARIANT[origen]}>{LABEL[origen]}</Badge>;
}
