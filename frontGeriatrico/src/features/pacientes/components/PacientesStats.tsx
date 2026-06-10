import { Activity, MapPinOff, UserCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsProps {
  stats: {
    total: number;
    activos: number;
    temporales: number;
    altas: number;
    sinUbicar: number;
  };
}

export function PacientesStats({ stats }: StatsProps) {
  const items = [
    {
      label: "Total registrados",
      value: stats.total,
      icon: <Users className="h-4 w-4" />,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Activos",
      value: stats.activos,
      icon: <UserCheck className="h-4 w-4" />,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Temporales",
      value: stats.temporales,
      icon: <Activity className="h-4 w-4" />,
      tone: "bg-warning/15 text-warning-foreground",
    },
    {
      label: "Sin ubicar",
      value: stats.sinUbicar,
      icon: <MapPinOff className="h-4 w-4" />,
      tone:
        stats.sinUbicar > 0
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
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
