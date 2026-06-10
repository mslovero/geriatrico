import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/hooks/usePermissions";
import { useSignosVitales } from "./hooks/useSignosVitales";
import { fetchPersonal } from "./api";
import { SignoVitalFormDialog } from "./components/SignoVitalFormDialog";
import { PresionBadge, VitalBadge } from "./components/VitalsBadge";
import { VitalRanges } from "./components/VitalRanges";
import { VitalSignsChart } from "./components/VitalSignsChart";
import type { SignoVital, SignoVitalFormValues } from "./types";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function SignosVitalesPage() {
  const {
    canRegisterSignosVitales: canRegister,
    canEditSignosVitales: canEdit,
    canDeleteSignosVitales: canDelete,
  } = usePermissions();

  const { filtered, loading, search, setSearch, save, remove } = useSignosVitales();
  const [personal, setPersonal] = useState<Array<{ id: number; name: string; role?: string }>>(
    []
  );
  const [chartPaciente, setChartPaciente] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SignoVital | null>(null);
  const [deleting, setDeleting] = useState<SignoVital | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPersonal(await fetchPersonal());
      } catch (error) {
        console.error("Error cargando personal:", error);
      }
    })();
  }, []);

  const columns = useMemo<ColumnDef<SignoVital, unknown>[]>(
    () => [
      {
        id: "paciente",
        header: "Paciente",
        cell: ({ row }) => {
          const p = row.original.paciente;
          if (!p) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-3">
              <Avatar initials={`${p.nombre[0] ?? ""}${p.apellido[0] ?? ""}`} />
              <span className="text-sm font-medium text-foreground">
                {p.nombre} {p.apellido}
              </span>
            </div>
          );
        },
      },
      {
        id: "fecha",
        header: "Fecha",
        cell: ({ row }) => {
          const d = new Date(row.original.fecha);
          return (
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">{dateFmt.format(d)}</p>
              <p className="text-xs text-muted-foreground">{timeFmt.format(d)} hs</p>
            </div>
          );
        },
      },
      {
        id: "presion",
        header: "Presión",
        cell: ({ row }) => <PresionBadge value={row.original.presion_arterial ?? null} />,
      },
      {
        id: "temperatura",
        header: "Temp.",
        cell: ({ row }) => (
          <VitalBadge value={row.original.temperatura} unit="°C" range="temperatura" />
        ),
      },
      {
        id: "pulso",
        header: "Pulso",
        cell: ({ row }) => (
          <VitalBadge
            value={row.original.frecuencia_cardiaca}
            unit="bpm"
            range="frecuencia_cardiaca"
          />
        ),
      },
      {
        id: "sato2",
        header: "Sat O₂",
        cell: ({ row }) => (
          <VitalBadge
            value={row.original.saturacion_oxigeno}
            unit="%"
            range="saturacion_oxigeno"
          />
        ),
      },
      {
        id: "glucosa",
        header: "Glucosa",
        cell: ({ row }) => (
          <VitalBadge value={row.original.glucosa} unit="mg/dL" range="glucosa" />
        ),
      },
      {
        accessorKey: "registrado_por",
        header: "Responsable",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {(getValue() as string) || "—"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar"
                  onClick={() => {
                    setEditing(r);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar"
                  onClick={() => setDeleting(r)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [canDelete, canEdit]
  );

  const handleSubmit = async (values: SignoVitalFormValues) => {
    await save(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <Activity className="h-3.5 w-3.5" />
            Monitoreo
          </Badge>
        }
        title="Signos vitales"
        description="Mediciones continuas con clasificación automática de rangos."
        actions={
          canRegister && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo registro
            </Button>
          )
        }
      />

      <VitalRanges />

      <div className="space-y-2">
        <Label htmlFor="chart-paciente">Analizar tendencia del paciente</Label>
        <PatientCombobox
          id="chart-paciente"
          value={chartPaciente}
          onChange={setChartPaciente}
          placeholder="Seleccionar paciente para ver evolución"
        />
      </div>

      {chartPaciente && <VitalSignsChart pacienteId={Number(chartPaciente)} />}

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por paciente o responsable…"
          className="sm:max-w-sm"
        />

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          empty={
            <EmptyStateBlock
              icon={<Activity className="h-5 w-5" />}
              title="No hay registros"
              description="Cargá el primer registro de signos vitales."
            />
          }
        />
      </div>

      <SignoVitalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        registro={editing}
        personal={personal}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar registro"
        description="¿Querés eliminar este registro de signos vitales?"
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
