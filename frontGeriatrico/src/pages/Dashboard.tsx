import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  HeartPulse,
  Pill,
  Plus,
  Radio,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { get, post } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  AlertaSalud,
  DashboardData,
  NotificacionDashboard,
  TurnoProximo,
} from "@/types/dashboard";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});
const fullDateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushSending, setPushSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await get<DashboardData>("/dashboard-stats");
        if (!cancelled && res) setData(res);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const { summary, alertas_salud_detalles, notificaciones, turnos_proximos } = data;
  const ocupacionVariant = summary.camas.porcentaje >= 90 ? "destructive" : "default";
  const firstName = user?.name?.split(" ")[0] ?? "";

  const handlePush = async () => {
    try {
      setPushSending(true);
      await post("/push-test");
      void Swal.fire({
        title: "Notificación enviada",
        text: "Se sincronizaron los dispositivos conectados.",
        icon: "success",
        confirmButtonColor: "hsl(221 83% 53%)",
      });
    } catch {
      void Swal.fire("Error", "No se pudo establecer conexión", "error");
    } finally {
      setPushSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader firstName={firstName} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Pacientes activos"
          value={summary.pacientes}
          hint="Residentes registrados"
          icon={<Users className="h-4 w-4" />}
          href="/pacientes"
        />
        <KpiCard
          label="Ocupación"
          value={`${summary.camas.porcentaje}%`}
          hint={`${summary.camas.libres} camas disponibles`}
          icon={<HeartPulse className="h-4 w-4" />}
          href="/camas"
          accent={ocupacionVariant === "destructive" ? "warning" : "default"}
        />
        <KpiCard
          label="Alertas de salud"
          value={summary.alertas_salud}
          hint="Registradas hoy"
          icon={<Activity className="h-4 w-4" />}
          href="/signos-vitales"
          accent={summary.alertas_salud > 0 ? "destructive" : "success"}
        />
        <KpiCard
          label="Stock bajo"
          value={summary.bajo_stock}
          hint="Insumos críticos"
          icon={<Pill className="h-4 w-4" />}
          href="/stock/items"
          accent={summary.bajo_stock > 0 ? "warning" : "success"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AlertasCard alertas={alertas_salud_detalles} />
          <NotificacionesCard notificaciones={notificaciones} />
        </div>

        <div className="space-y-6">
          {user?.role === "admin" && (
            <PushCard onSync={handlePush} loading={pushSending} />
          )}
          <TurnosCard turnos={turnos_proximos} />
        </div>
      </div>
    </div>
  );
}

interface DashboardHeaderProps {
  firstName: string;
}

function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Badge variant="muted" className="mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Panel ejecutivo
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {firstName ? `Hola, ${firstName}` : "Bienvenido"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen operativo de la residencia. Actualizado en tiempo real.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/signos-vitales">
            <Stethoscope className="h-4 w-4" />
            Registrar signos
          </Link>
        </Button>
        <Button asChild>
          <Link to="/pacientes">
            <Plus className="h-4 w-4" />
            Nuevo ingreso
          </Link>
        </Button>
      </div>
    </header>
  );
}

type KpiAccent = "default" | "warning" | "destructive" | "success";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  href: string;
  accent?: KpiAccent;
}

function KpiCard({ label, value, hint, icon, href, accent = "default" }: KpiCardProps) {
  const accentClasses: Record<KpiAccent, string> = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  };

  return (
    <Link to={href} className="group focus-visible:outline-none">
      <Card className="h-full transition-all group-hover:border-foreground/20 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                accentClasses[accent]
              )}
            >
              {icon}
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
    </Link>
  );
}

function AlertasCard({ alertas }: { alertas: AlertaSalud[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Alertas médicas críticas
          </CardTitle>
          <CardDescription>
            Monitoreo automático de signos vitales en las últimas 24 horas
          </CardDescription>
        </div>
        {alertas.length > 0 && (
          <Badge variant="destructive">{alertas.length}</Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {alertas.length === 0 ? (
          <EmptyBlock
            icon={<ShieldCheck className="h-6 w-6 text-success" />}
            title="Todo bajo control"
            description="No se registran alertas críticas."
          />
        ) : (
          <ul className="divide-y divide-border">
            {alertas.map((alerta) => (
              <li
                key={alerta.id}
                className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={`${alerta.paciente.nombre[0] ?? ""}${alerta.paciente.apellido[0] ?? ""}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {alerta.paciente.nombre} {alerta.paciente.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cama {alerta.paciente.cama_id ?? "—"} · {fullDateFmt.format(new Date(alerta.fecha))} hs
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {alerta.temperatura !== undefined && alerta.temperatura > 38 && (
                    <Badge variant="destructive">Fiebre {alerta.temperatura}°C</Badge>
                  )}
                  {alerta.saturacion_oxigeno !== undefined && alerta.saturacion_oxigeno < 94 && (
                    <Badge variant="warning">Sat O₂ {alerta.saturacion_oxigeno}%</Badge>
                  )}
                  {alerta.glucosa !== undefined && alerta.glucosa > 180 && (
                    <Badge variant="destructive">Glucosa {alerta.glucosa}</Badge>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/pacientes/${alerta.paciente_id}/ficha`}>
                      Ver ficha
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function NotificacionesCard({ notificaciones }: { notificaciones: NotificacionDashboard[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BellRing className="h-4 w-4" />
          </span>
          Centro de auditoría
        </CardTitle>
        <CardDescription>Últimos eventos del sistema</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {notificaciones.length === 0 ? (
          <EmptyBlock
            icon={<BellRing className="h-6 w-6 text-muted-foreground" />}
            title="Sin notificaciones recientes"
            description="No hay actividad registrada para mostrar."
          />
        ) : (
          <ul className="divide-y divide-border">
            {notificaciones.map((notif) => (
              <li
                key={notif.id}
                className="flex items-start justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <BellRing className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{notif.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{notif.mensaje}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground/80">
                      {dateFmt.format(new Date(notif.created_at))}
                    </p>
                  </div>
                </div>
                <Link
                  to="/notificaciones"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Ver notificación"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Separator />
        <div className="px-6 py-4">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link to="/notificaciones">
              Ver historial completo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PushCard({ onSync, loading }: { onSync: () => void; loading: boolean }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Radio className="h-4 w-4" />
          </span>
          Conectividad Push
        </CardTitle>
        <CardDescription>
          Verificá la sincronización con los dispositivos del personal médico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onSync} disabled={loading} variant="default" className="w-full">
          {loading ? "Sincronizando…" : "Sincronizar dispositivos"}
        </Button>
      </CardContent>
    </Card>
  );
}

function TurnosCard({ turnos }: { turnos: TurnoProximo[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarClock className="h-4 w-4" />
          </span>
          Próximos turnos
        </CardTitle>
        <CardDescription>Agenda médica de las próximas 48 horas</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {turnos.length === 0 ? (
          <EmptyBlock
            icon={<CalendarClock className="h-6 w-6 text-muted-foreground" />}
            title="Agenda despejada"
            description="No hay turnos programados."
          />
        ) : (
          <ul className="divide-y divide-border">
            {turnos.map((turno) => {
              const fecha = new Date(turno.fecha_hora);
              return (
                <li key={turno.id} className="flex items-start gap-3 px-6 py-4">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 py-1.5 text-center">
                    <span className="text-base font-semibold tabular-nums leading-none text-foreground">
                      {fecha.getDate()}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {fecha.toLocaleString("es-AR", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {turno.paciente.nombre} {turno.paciente.apellido}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="muted">{turno.especialidad}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {turno.profesional}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium tabular-nums text-foreground">
                      {timeFmt.format(fecha)} hs
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Separator />
        <div className="px-6 py-4">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to="/turnos">
              Gestionar agenda
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyBlockProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyBlock({ icon, title, description }: EmptyBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {icon}
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-48" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
