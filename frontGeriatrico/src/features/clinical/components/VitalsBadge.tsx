import { Badge } from "@/components/ui/badge";
import { VITAL_RANGES } from "../types";
import { classifyPresion, classifyVital, statusVariant } from "../utils/vitals";

interface VitalBadgeProps {
  value: number | null | undefined;
  unit: string;
  range: keyof typeof VITAL_RANGES;
  fallback?: string;
}

export function VitalBadge({ value, unit, range, fallback = "—" }: VitalBadgeProps) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">{fallback}</span>;
  }
  const status = classifyVital(value, VITAL_RANGES[range]);
  return (
    <Badge variant={statusVariant(status)} className="tabular-nums">
      {value} {unit}
    </Badge>
  );
}

interface PresionBadgeProps {
  value?: string | null;
  fallback?: string;
}

export function PresionBadge({ value, fallback = "—" }: PresionBadgeProps) {
  if (!value) {
    return <span className="text-xs text-muted-foreground">{fallback}</span>;
  }
  const status = classifyPresion(value);
  return (
    <Badge variant={statusVariant(status)} className="tabular-nums">
      {value} mmHg
    </Badge>
  );
}
