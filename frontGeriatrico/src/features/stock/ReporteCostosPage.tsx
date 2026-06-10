import { useEffect, useState } from "react";
import { CalendarRange, CircleDollarSign, PieChart, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchConsumoPaciente,
  fetchResumenGeneral,
  fetchTopMedicamentos,
} from "./api";
import type {
  ConsumoPaciente,
  ResumenStockReporte,
  TopMedicamento,
} from "./types";

export default function ReporteCostosPage() {
  const [resumen, setResumen] = useState<ResumenStockReporte | null>(null);
  const [resumenLoading, setResumenLoading] = useState(true);
  const [paciente, setPaciente] = useState("");
  const [consumo, setConsumo] = useState<ConsumoPaciente | null>(null);
  const [consumoLoading, setConsumoLoading] = useState(false);
  const [topMeds, setTopMeds] = useState<TopMedicamento[]>([]);
  const [topLoading, setTopLoading] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setResumenLoading(true);
        const data = await fetchResumenGeneral();
        if (data) setResumen(data);
      } catch (error) {
        console.error("Error cargando resumen:", error);
      } finally {
        setResumenLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setTopLoading(true);
        const data = await fetchTopMedicamentos({ desde, hasta });
        if (!cancelled) setTopMeds(data);
      } catch (error) {
        console.error("Error cargando top medicamentos:", error);
      } finally {
        if (!cancelled) setTopLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [desde, hasta]);

  useEffect(() => {
    if (!paciente) {
      setConsumo(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setConsumoLoading(true);
        const data = await fetchConsumoPaciente(Number(paciente), { desde, hasta });
        if (!cancelled && data) setConsumo(data);
      } catch (error) {
        console.error("Error cargando consumo paciente:", error);
      } finally {
        if (!cancelled) setConsumoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paciente, desde, hasta]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <PieChart className="h-3.5 w-3.5" />
            Reportes
          </Badge>
        }
        title="Costos y consumo"
        description="Análisis financiero de medicamentos e insumos."
        actions={
          (desde || hasta) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDesde("");
                setHasta("");
              }}
            >
              Limpiar filtros
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Período de análisis</CardTitle>
          <CardDescription>
            Filtrá los reportes por rango de fechas. Por defecto se usa el mes actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="rep_desde">Desde</Label>
              <Input
                id="rep_desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep_hasta">Hasta</Label>
              <Input
                id="rep_hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="rep_paciente">Reporte por paciente</Label>
              <PatientCombobox
                id="rep_paciente"
                value={paciente}
                onChange={setPaciente}
                placeholder="Seleccionar paciente"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {resumenLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        resumen && (
          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              label="Stock geriátrico"
              value={`$${resumen.stock_geriatrico.valor_total.toFixed(0)}`}
              hint={`${resumen.stock_geriatrico.total_items} items registrados`}
              icon={<CircleDollarSign className="h-4 w-4" />}
              tone="bg-primary/10 text-primary"
            />
            <KpiCard
              label="Stock pacientes"
              value={`$${resumen.stock_pacientes.valor_total.toFixed(0)}`}
              hint={`${resumen.stock_pacientes.pacientes_con_stock} pacientes con stock`}
              icon={<CircleDollarSign className="h-4 w-4" />}
              tone="bg-warning/15 text-warning-foreground"
            />
            <KpiCard
              label="Costos del mes"
              value={`$${resumen.costos_mes_actual.toFixed(0)}`}
              hint={`${resumen.periodo_actual.desde} → ${resumen.periodo_actual.hasta}`}
              icon={<CalendarRange className="h-4 w-4" />}
              tone="bg-success/10 text-success"
            />
          </section>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-warning-foreground" />
            Top medicamentos
          </CardTitle>
          <CardDescription>
            Más consumidos en el período seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {topLoading ? (
            <div className="space-y-2 px-6 pb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : topMeds.length === 0 ? (
            <EmptyStateBlock
              icon={<Trophy className="h-5 w-5" />}
              title="Sin datos en el período"
              description="Probá ampliar el rango de fechas o cargar consumos."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Medicamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Veces usado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMeds.map((t) => (
                  <TableRow key={t.stock_item_id}>
                    <TableCell className="pl-6 font-medium text-foreground">
                      {t.nombre}
                    </TableCell>
                    <TableCell className="text-xs uppercase text-muted-foreground">
                      {t.tipo}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {t.cantidad_total} {t.unidad_medida}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      ${t.costo_total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {t.veces_usado}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {paciente && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consumo del paciente</CardTitle>
            <CardDescription>
              {consumo
                ? `${consumo.paciente.nombre} · ${consumo.total_movimientos} movimientos · $${consumo.total_costo.toFixed(
                    2
                  )}`
                : "Cargando…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {consumoLoading || !consumo ? (
              <div className="space-y-2 px-6 pb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : consumo.por_item.length === 0 ? (
              <EmptyStateBlock
                icon={<CircleDollarSign className="h-5 w-5" />}
                title="Sin consumos en el período"
                description="No hay movimientos registrados para este paciente."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Item</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumo.por_item.map((it) => (
                    <TableRow key={it.stock_item_id}>
                      <TableCell className="pl-6 font-medium text-foreground">
                        {it.nombre}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {it.cantidad_total} {it.unidad_medida ?? ""}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        ${it.costo_total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}

function KpiCard({ label, value, hint, icon, tone }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}
          >
            {icon}
          </span>
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
