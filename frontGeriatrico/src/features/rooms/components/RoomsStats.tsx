import { CheckCircle2, DoorOpen, Hospital, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RoomsStatsProps {
  stats: {
    totalHabitaciones: number;
    capacidadTotal: number;
    camasOcupadas: number;
    habitacionesLlenas: number;
    porcentajeOcupacion: number;
  };
}

export function RoomsStats({ stats }: RoomsStatsProps) {
  const items = [
    {
      label: "Habitaciones",
      value: stats.totalHabitaciones,
      hint: "Total registradas",
      icon: <DoorOpen className="h-4 w-4" />,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Capacidad",
      value: stats.capacidadTotal,
      hint: "Camas instaladas",
      icon: <Hospital className="h-4 w-4" />,
      tone: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Ocupación",
      value: `${stats.porcentajeOcupacion}%`,
      hint: `${stats.camasOcupadas} de ${stats.capacidadTotal} camas`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      tone:
        stats.porcentajeOcupacion >= 90
          ? "bg-warning/15 text-warning-foreground"
          : "bg-success/10 text-success",
    },
    {
      label: "Completas",
      value: stats.habitacionesLlenas,
      hint: "Sin disponibilidad",
      icon: <XCircle className="h-4 w-4" />,
      tone:
        stats.habitacionesLlenas > 0
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md ${item.tone}`}
              >
                {item.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
