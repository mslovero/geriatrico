import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Pill,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchEstadoMedicaciones } from "./api";
import type { EstadoMedicacionDetalle, EstadoMedicacionResponse } from "./types";

type Filtro = "todos" | "sin_stock" | "stock_bajo" | "sin_vincular" | "inconsistentes";

const ESTADO_VARIANT: Record<
  EstadoMedicacionDetalle["estado"],
  "destructive" | "warning" | "default" | "muted"
> = {
  sin_stock: "destructive",
  stock_bajo: "warning",
  sin_vincular: "default",
  inconsistente: "destructive",
  error: "destructive",
  correcto: "muted",
};

const ESTADO_LABEL: Record<EstadoMedicacionDetalle["estado"], string> = {
  sin_stock: "Sin stock",
  stock_bajo: "Stock bajo",
  sin_vincular: "Sin vincular",
  inconsistente: "Inconsistente",
  error: "Error",
  correcto: "Correcta",
};

export default function EstadoMedicacionesPage() {
  const [data, setData] = useState<EstadoMedicacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await fetchEstadoMedicaciones();
      setData(res);
    } catch (error) {
      console.error("Error cargando estado:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const filtered = useMemo<EstadoMedicacionDetalle[]>(() => {
    if (!data) return [];
    switch (filtro) {
      case "sin_stock":
        return data.detalles.sin_stock;
      case "stock_bajo":
        return data.detalles.stock_bajo;
      case "sin_vincular":
        return data.detalles.sin_vincular;
      case "inconsistentes":
        return data.detalles.inconsistentes;
      default:
        return [
          ...data.detalles.sin_stock,
          ...data.detalles.stock_bajo,
          ...data.detalles.sin_vincular,
          ...data.detalles.inconsistentes,
        ];
    }
  }, [data, filtro]);

  if (loading && !data) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyStateBlock
          icon={<AlertTriangle className="h-5 w-5" />}
          title="No pudimos cargar el estado"
          description="Reintentá en unos segundos o contactá al equipo técnico."
          action={
            <Button onClick={() => void cargar()}>
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  const { resumen, alertas } = data;
  const porcentajeOk =
    resumen.total > 0 ? Math.round((resumen.correctas / resumen.total) * 100) : 0;
  const nivel =
    porcentajeOk >= 90
      ? { label: "Excelente", tone: "bg-success/10 text-success" }
      : porcentajeOk >= 70
      ? { label: "Bueno", tone: "bg-primary/10 text-primary" }
      : porcentajeOk >= 50
      ? { label: "Regular", tone: "bg-warning/15 text-warning-foreground" }
      : { label: "Crítico", tone: "bg-destructive/10 text-destructive" };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <Activity className="h-3.5 w-3.5" />
            Estado clínico
          </Badge>
        }
        title="Estado de medicaciones"
        description="Dashboard de control y alertas sobre vinculaciones y stock."
        actions={
          <Button variant="outline" onClick={() => void cargar()}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nivel de salud
              </CardTitle>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md ${nivel.tone}`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <CardDescription>
              {resumen.correctas} de {resumen.total} medicaciones correctas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {nivel.label}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full bg-success"
                style={{ width: `${porcentajeOk}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{porcentajeOk}% en orden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Críticas
              </CardTitle>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <XCircle className="h-4 w-4" />
              </span>
            </div>
            <CardDescription>Requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {alertas.criticas}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <ResumenMini label="Sin stock" value={resumen.sin_stock} />
              <ResumenMini label="Inconsistentes" value={resumen.inconsistentes} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Advertencias
              </CardTitle>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/15 text-warning-foreground">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <CardDescription>A revisar en el corto plazo</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {alertas.advertencias}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <ResumenMini label="Sin vincular" value={resumen.sin_vincular} />
              <ResumenMini label="Stock bajo" value={resumen.stock_bajo} />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medicaciones que requieren atención</CardTitle>
          <CardDescription>Filtrá por categoría de alerta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pb-0">
          <div className="flex flex-wrap gap-2 px-6">
            <FilterChip
              active={filtro === "todos"}
              onClick={() => setFiltro("todos")}
              label={`Todas (${alertas.criticas + alertas.advertencias})`}
            />
            <FilterChip
              active={filtro === "sin_stock"}
              onClick={() => setFiltro("sin_stock")}
              label={`Sin stock (${resumen.sin_stock})`}
              tone="destructive"
            />
            <FilterChip
              active={filtro === "stock_bajo"}
              onClick={() => setFiltro("stock_bajo")}
              label={`Stock bajo (${resumen.stock_bajo})`}
              tone="warning"
            />
            <FilterChip
              active={filtro === "sin_vincular"}
              onClick={() => setFiltro("sin_vincular")}
              label={`Sin vincular (${resumen.sin_vincular})`}
            />
            <FilterChip
              active={filtro === "inconsistentes"}
              onClick={() => setFiltro("inconsistentes")}
              label={`Inconsistentes (${resumen.inconsistentes})`}
              tone="destructive"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyStateBlock
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
              title="Todo en orden"
              description="No hay medicaciones que requieran atención en este filtro."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Estado</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Sugerencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={`${item.estado}-${item.id}`}>
                    <TableCell className="pl-6">
                      <Badge variant={ESTADO_VARIANT[item.estado]}>
                        {ESTADO_LABEL[item.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <span className="flex items-center gap-2">
                        <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.nombre}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {item.paciente}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {item.origen_pago}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.sugerencia ?? item.mensaje ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResumenMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/40 p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "destructive" | "warning";
}

function FilterChip({ active, onClick, label, tone }: FilterChipProps) {
  const variant = active
    ? tone === "destructive"
      ? "destructive"
      : tone === "warning"
      ? "warning"
      : "default"
    : "outline";

  return (
    <Button
      type="button"
      variant={variant === "outline" ? "outline" : "default"}
      size="sm"
      onClick={onClick}
      className={
        variant === "destructive"
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : variant === "warning"
          ? "bg-warning text-warning-foreground hover:bg-warning/90"
          : undefined
      }
    >
      {label}
    </Button>
  );
}
