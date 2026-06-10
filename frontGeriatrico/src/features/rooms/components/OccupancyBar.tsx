import type { HabitacionResumen } from "../types";

interface OccupancyBarProps {
  resumen: HabitacionResumen;
  capacidad: number;
}

export function OccupancyBar({ resumen, capacidad }: OccupancyBarProps) {
  const safeCapacidad = capacidad > 0 ? capacidad : 1;
  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <span
          className="bg-destructive"
          style={{ width: `${(resumen.ocupadas / safeCapacidad) * 100}%` }}
          title={`Ocupadas: ${resumen.ocupadas}`}
        />
        <span
          className="bg-success"
          style={{ width: `${(resumen.libres / safeCapacidad) * 100}%` }}
          title={`Libres: ${resumen.libres}`}
        />
        <span
          className="bg-warning"
          style={{ width: `${(resumen.mantenimiento / safeCapacidad) * 100}%` }}
          title={`Mantenimiento: ${resumen.mantenimiento}`}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend color="bg-success" label="Libres" value={resumen.libres} />
        <Legend color="bg-destructive" label="Ocupadas" value={resumen.ocupadas} />
        {resumen.mantenimiento > 0 && (
          <Legend color="bg-warning" label="Mant." value={resumen.mantenimiento} />
        )}
      </div>
    </div>
  );
}

interface LegendProps {
  color: string;
  label: string;
  value: number;
}

function Legend({ color, label, value }: LegendProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {label}: <strong className="text-foreground">{value}</strong>
    </span>
  );
}
