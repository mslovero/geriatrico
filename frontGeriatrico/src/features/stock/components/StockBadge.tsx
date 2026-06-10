import { Badge } from "@/components/ui/badge";
import type { StockItem } from "../types";

interface StockBadgeProps {
  item: StockItem;
}

export function StockBadge({ item }: StockBadgeProps) {
  const bajo = item.stock_actual <= item.stock_minimo;
  return (
    <Badge variant={bajo ? "warning" : "success"}>
      {item.stock_actual} {item.unidad_medida}
    </Badge>
  );
}

export function formatPresentacion(item: StockItem): string | null {
  if (
    !item.unidad_presentacion ||
    !item.factor_conversion ||
    item.factor_conversion <= 1
  ) {
    return null;
  }
  const presentacion = Math.floor(item.stock_actual / item.factor_conversion);
  const resto = item.stock_actual % item.factor_conversion;
  if (presentacion === 0 && resto === 0) return null;
  const parts: string[] = [];
  if (presentacion > 0) parts.push(`${presentacion} ${item.unidad_presentacion}`);
  if (resto > 0) parts.push(`${resto} ${item.unidad_medida}`);
  return `≈ ${parts.join(" + ")}`;
}
