import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Droplet, HeartPulse, Thermometer, Wind } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSignosVitalesPaciente } from "../api";

type Metric = "temperatura" | "saturacion_oxigeno" | "frecuencia_cardiaca" | "glucosa";

interface ChartPoint {
  fecha_corta: string;
  temperatura: number | null;
  saturacion_oxigeno: number | null;
  frecuencia_cardiaca: number | null;
  glucosa: number | null;
}

const METRICS: Array<{
  key: Metric;
  label: string;
  color: string;
  icon: React.ReactNode;
  unit: string;
}> = [
  {
    key: "temperatura",
    label: "Temperatura",
    color: "hsl(0 84% 60%)",
    icon: <Thermometer className="h-3.5 w-3.5" />,
    unit: "°C",
  },
  {
    key: "saturacion_oxigeno",
    label: "Sat. O₂",
    color: "hsl(217 91% 60%)",
    icon: <Wind className="h-3.5 w-3.5" />,
    unit: "%",
  },
  {
    key: "frecuencia_cardiaca",
    label: "Pulso",
    color: "hsl(330 81% 60%)",
    icon: <HeartPulse className="h-3.5 w-3.5" />,
    unit: "bpm",
  },
  {
    key: "glucosa",
    label: "Glucosa",
    color: "hsl(38 92% 50%)",
    icon: <Droplet className="h-3.5 w-3.5" />,
    unit: "mg/dL",
  },
];

interface VitalSignsChartProps {
  pacienteId: number;
}

export function VitalSignsChart({ pacienteId }: VitalSignsChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<Metric>("temperatura");

  useEffect(() => {
    if (!pacienteId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchSignosVitalesPaciente(pacienteId);
        if (cancelled) return;
        const formatted = res.map<ChartPoint>((item) => ({
          fecha_corta: new Date(item.fecha).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperatura: item.temperatura ?? null,
          saturacion_oxigeno: item.saturacion_oxigeno ?? null,
          frecuencia_cardiaca: item.frecuencia_cardiaca ?? null,
          glucosa: item.glucosa ?? null,
        }));
        setData(formatted.reverse());
      } catch (error) {
        console.error("Error cargando historial de signos:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pacienteId]);

  const current = useMemo(
    () => METRICS.find((m) => m.key === metric) ?? METRICS[0],
    [metric]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Evolución de signos vitales
          </CardTitle>
          <CardDescription>Últimos 30 registros del paciente</CardDescription>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map((m) => (
            <Button
              key={m.key}
              variant={metric === m.key ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setMetric(m.key)}
            >
              {m.icon}
              {m.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : data.length === 0 ? (
          <EmptyStateBlock
            icon={<Activity className="h-5 w-5" />}
            title="Sin registros"
            description="Cargá signos vitales para ver la evolución."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="fecha_corta"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value) => [
                    `${value ?? "—"} ${current.unit}`,
                    current.label,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={current.color}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
