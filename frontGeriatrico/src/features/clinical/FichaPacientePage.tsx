import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Cake,
  Download,
  FileText,
  HeartPulse,
  Hospital,
  IdCard,
  Loader2,
  Phone,
  Pill,
  Printer,
  Stethoscope,
  TriangleAlert,
  Utensils,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api, { API_URL } from "@/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { get } from "@/api/api";
import { PacienteStatusBadge } from "@/features/pacientes/components/PacienteStatusBadge";
import { OrigenPagoBadge } from "@/features/medicaciones/components/OrigenPagoBadge";
import { TipoMedicacionBadge } from "@/features/medicaciones/components/TipoMedicacionBadge";
import { TurnoEstadoBadge } from "./components/TurnoEstadoBadge";
import { SeveridadBadge } from "./components/SeveridadBadge";
import { PresionBadge, VitalBadge } from "./components/VitalsBadge";
import { VitalSignsChart } from "./components/VitalSignsChart";
import type { Paciente } from "@/features/pacientes/types";
import type { Medicacion } from "@/features/medicaciones/types";
import type {
  HistorialMedico,
  Incidencia,
  SignoVital,
  TurnoMedico,
} from "./types";

interface DietaResumen {
  id: number;
  tipo?: string;
  detalle?: string;
  fecha?: string;
  updated_at?: string;
  observaciones?: string;
}

interface PacienteFicha extends Paciente {
  medicaciones?: Medicacion[];
  signosVitales?: SignoVital[];
  signos_vitales?: SignoVital[];
  dietas?: DietaResumen[];
  incidencias?: Incidencia[];
  turnosMedicos?: TurnoMedico[];
  turnos_medicos?: TurnoMedico[];
  historial_medico?: HistorialMedico[];
}

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" });

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) {
    return dateFmt.format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  }
  return dateFmt.format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return `${dateFmt.format(d)} · ${timeFmt.format(d)}`;
}

function calcularEdad(fecha?: string | null): number | null {
  if (!fecha) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  const birth = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(fecha);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

type Periodo = "ultima_revision" | "30dias" | "completo";

const PERIODOS: Array<{ value: Periodo; label: string; description: string }> = [
  {
    value: "ultima_revision",
    label: "Desde la última revisión",
    description: "Datos posteriores a la última entrada del historial médico",
  },
  {
    value: "30dias",
    label: "Últimos 30 días",
    description: "Resumen reciente — usado por defecto",
  },
  {
    value: "completo",
    label: "Histórico completo",
    description: "Todo el historial clínico del paciente",
  },
];

export default function FichaPacientePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<PacienteFicha | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPeriodo, setDownloadingPeriodo] = useState<Periodo | null>(null);

  const handleDownloadPdf = async (periodo: Periodo) => {
    if (!id) return;
    setDownloadingPeriodo(periodo);
    try {
      const response = await api.get(`/pacientes/${id}/pdf`, {
        params: { periodo },
        responseType: "blob",
      });

      // Obtener nombre del archivo del header del backend
      const disposition = response.headers["content-disposition"] as string | undefined;
      let filename = `ficha-paciente-${periodo}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
        if (match?.[1]) {
          filename = decodeURIComponent(match[1].replace(/^utf-8''/i, ""));
        }
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("No se pudo descargar la ficha. Reintentá en unos segundos.");
    } finally {
      setDownloadingPeriodo(null);
    }
  };
  // Eliminar el warning de unused (lo dejamos disponible para evitar dead code)
  void API_URL;

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await get<PacienteFicha>(`/pacientes/${id}`);
        if (res) setPaciente(res);
      } catch (error) {
        console.error("Error cargando paciente:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyStateBlock
          icon={<TriangleAlert className="h-5 w-5" />}
          title="Paciente no encontrado"
          description="Verificá el enlace o volvé al listado."
          action={
            <Button variant="outline" onClick={() => navigate("/pacientes")}>
              <ArrowLeft className="h-4 w-4" />
              Volver a pacientes
            </Button>
          }
        />
      </div>
    );
  }

  const edad = calcularEdad(paciente.fecha_nacimiento ?? null);
  const dietaActual = (paciente.dietas ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
    )[0];
  const signos = paciente.signosVitales ?? paciente.signos_vitales ?? [];
  const turnos = paciente.turnosMedicos ?? paciente.turnos_medicos ?? [];
  const initials = `${paciente.nombre[0] ?? ""}${paciente.apellido[0] ?? ""}`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <IdCard className="h-3.5 w-3.5" />
            Ficha digital
          </Badge>
        }
        title={`${paciente.nombre} ${paciente.apellido}`}
        description="Vista consolidada del residente."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir vista
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={downloadingPeriodo !== null}>
                  {downloadingPeriodo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Descargar ficha
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Elegí el período</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PERIODOS.map((p) => (
                  <DropdownMenuItem
                    key={p.value}
                    disabled={downloadingPeriodo !== null}
                    onSelect={() => void handleDownloadPdf(p.value)}
                    className="flex-col items-start gap-0 py-2"
                  >
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {p.description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              initials={initials}
              className="h-16 w-16 text-lg"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <IdCard className="h-3.5 w-3.5" />
                  DNI {paciente.dni}
                </span>
                {paciente.fecha_nacimiento && (
                  <span className="inline-flex items-center gap-1">
                    <Cake className="h-3.5 w-3.5" />
                    {formatDate(paciente.fecha_nacimiento)}
                    {edad ? ` · ${edad} años` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PacienteStatusBadge estado={paciente.estado} />
            {paciente.habitacion && (
              <Badge variant="muted">
                <Hospital className="h-3.5 w-3.5" />
                Hab. {paciente.habitacion.numero}
                {paciente.cama && ` · Cama ${paciente.cama.numero_cama}`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          label="Médico de cabecera"
          value={paciente.medico_cabecera ?? "Sin asignar"}
          icon={<Stethoscope className="h-4 w-4" />}
        />
        <InfoCard
          label="Contacto de emergencia"
          value={paciente.contacto_emergencia?.nombre ?? "Sin registrar"}
          hint={paciente.contacto_emergencia?.telefono ?? undefined}
          icon={<Phone className="h-4 w-4" />}
        />
        <InfoCard
          label="Dieta vigente"
          value={dietaActual?.tipo ?? dietaActual?.detalle ?? "Sin definir"}
          hint={dietaActual ? formatDate(dietaActual.fecha ?? dietaActual.updated_at) : undefined}
          icon={<Utensils className="h-4 w-4" />}
        />
      </section>

      {paciente.patologias && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Patologías relevantes:</span> {paciente.patologias}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="signos" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="signos">
            <HeartPulse className="h-3.5 w-3.5" /> Signos
          </TabsTrigger>
          <TabsTrigger value="medicaciones">
            <Pill className="h-3.5 w-3.5" /> Medicaciones
          </TabsTrigger>
          <TabsTrigger value="turnos">
            <Calendar className="h-3.5 w-3.5" /> Turnos
          </TabsTrigger>
          <TabsTrigger value="incidencias">
            <TriangleAlert className="h-3.5 w-3.5" /> Incidencias
          </TabsTrigger>
          <TabsTrigger value="historial">
            <FileText className="h-3.5 w-3.5" /> Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signos" className="space-y-4">
          <VitalSignsChart pacienteId={Number(paciente.id)} />
          <SignosTable signos={signos.slice(0, 10)} />
        </TabsContent>

        <TabsContent value="medicaciones">
          <MedicacionesList medicaciones={paciente.medicaciones ?? []} />
        </TabsContent>

        <TabsContent value="turnos">
          <TurnosList turnos={turnos} />
        </TabsContent>

        <TabsContent value="incidencias">
          <IncidenciasList incidencias={paciente.incidencias ?? []} />
        </TabsContent>

        <TabsContent value="historial">
          <HistorialList historial={paciente.historial_medico ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}

function InfoCard({ label, value, hint, icon }: InfoCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </span>
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function SignosTable({ signos }: { signos: SignoVital[] }) {
  if (signos.length === 0) {
    return (
      <Card>
        <EmptyStateBlock
          icon={<HeartPulse className="h-5 w-5" />}
          title="Sin registros recientes"
          description="No hay mediciones de signos vitales para este paciente."
        />
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimos signos vitales</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border">
          {signos.map((s) => (
            <li key={s.id} className="px-6 py-4">
              <p className="text-sm font-medium text-foreground">
                {formatDateTime(s.fecha)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <PresionBadge value={s.presion_arterial ?? null} />
                <VitalBadge value={s.temperatura} unit="°C" range="temperatura" />
                <VitalBadge value={s.frecuencia_cardiaca} unit="bpm" range="frecuencia_cardiaca" />
                <VitalBadge value={s.saturacion_oxigeno} unit="%" range="saturacion_oxigeno" />
                <VitalBadge value={s.glucosa} unit="mg/dL" range="glucosa" />
              </div>
              {s.observaciones && (
                <p className="mt-2 text-xs text-muted-foreground">{s.observaciones}</p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MedicacionesList({ medicaciones }: { medicaciones: Medicacion[] }) {
  if (medicaciones.length === 0) {
    return (
      <Card>
        <EmptyStateBlock
          icon={<Pill className="h-5 w-5" />}
          title="Sin medicaciones registradas"
        />
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border">
          {medicaciones.map((m) => (
            <li key={m.id} className="px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {[m.dosis, m.frecuencia].filter(Boolean).join(" · ") || "Sin detalles"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TipoMedicacionBadge tipo={m.tipo} />
                  <OrigenPagoBadge origen={m.origen_pago} />
                </div>
              </div>
              {(m.fecha_inicio || m.fecha_fin) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Vigencia: {formatDate(m.fecha_inicio)} → {formatDate(m.fecha_fin)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TurnosList({ turnos }: { turnos: TurnoMedico[] }) {
  if (turnos.length === 0) {
    return (
      <Card>
        <EmptyStateBlock
          icon={<Calendar className="h-5 w-5" />}
          title="Sin turnos programados"
        />
      </Card>
    );
  }
  const ordenados = [...turnos].sort(
    (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
  );
  return (
    <Card>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border">
          {ordenados.map((t) => {
            const d = new Date(t.fecha_hora);
            return (
              <li key={t.id} className="flex items-start gap-3 px-6 py-4">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 py-1.5 text-center">
                  <span className="text-base font-semibold tabular-nums leading-none text-foreground">
                    {d.getDate()}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {d.toLocaleString("es-AR", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.especialidad}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.profesional}</p>
                  <p className="mt-1 text-xs tabular-nums text-foreground">
                    {timeFmt.format(d)} hs
                    {t.lugar && <span className="text-muted-foreground"> · {t.lugar}</span>}
                  </p>
                </div>
                <TurnoEstadoBadge estado={t.estado} />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function IncidenciasList({ incidencias }: { incidencias: Incidencia[] }) {
  if (incidencias.length === 0) {
    return (
      <Card>
        <EmptyStateBlock
          icon={<TriangleAlert className="h-5 w-5" />}
          title="Sin incidencias registradas"
        />
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border">
          {incidencias.map((i) => (
            <li key={i.id} className="px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{i.tipo}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(i.fecha_hora)}
                  </p>
                </div>
                <SeveridadBadge severidad={i.severidad} />
              </div>
              <p className="mt-2 text-sm text-foreground">{i.descripcion}</p>
              {i.acciones_tomadas && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Acciones:</span>{" "}
                    {i.acciones_tomadas}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function HistorialList({ historial }: { historial: HistorialMedico[] }) {
  if (historial.length === 0) {
    return (
      <Card>
        <EmptyStateBlock
          icon={<FileText className="h-5 w-5" />}
          title="Sin entradas en el historial"
        />
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border">
          {historial.map((h) => (
            <li key={h.id} className="px-6 py-4">
              <p className="text-sm font-medium text-foreground">{formatDate(h.fecha)}</p>
              {h.medico_responsable && (
                <p className="text-xs text-muted-foreground">{h.medico_responsable}</p>
              )}
              <p className="mt-2 text-sm text-foreground">{h.observacion}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
