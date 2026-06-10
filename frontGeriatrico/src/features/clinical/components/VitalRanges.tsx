import { Activity, Droplet, HeartPulse, Thermometer, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { label: "Presión", value: "90-140 mmHg", icon: <Activity className="h-4 w-4" /> },
  {
    label: "Temperatura",
    value: "36-37.5 °C",
    icon: <Thermometer className="h-4 w-4" />,
  },
  { label: "Pulso", value: "60-100 bpm", icon: <HeartPulse className="h-4 w-4" /> },
  {
    label: "Sat O₂",
    value: "94-100 %",
    icon: <Wind className="h-4 w-4" />,
  },
  { label: "Glucosa", value: "70-140 mg/dL", icon: <Droplet className="h-4 w-4" /> },
];

export function VitalRanges() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-success/10 text-success">
                {item.icon}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold tabular-nums text-foreground">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
