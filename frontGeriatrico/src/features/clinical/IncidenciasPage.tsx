import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";
import { useIncidencias } from "./hooks/useIncidencias";
import { fetchPersonal } from "./api";
import { IncidenciaFormDialog } from "./components/IncidenciaFormDialog";
import { SeveridadBadge } from "./components/SeveridadBadge";
import { SEVERIDADES, type Incidencia, type IncidenciaFormValues, type IncidenciaSeveridad } from "./types";

const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function IncidenciasPage() {
  const {
    canReportIncidencias: canReport,
    canEditIncidencias: canEdit,
    canDeleteIncidencias: canDelete,
  } = usePermissions();

  const { filtered, loading, filters, setFilters, resetFilters, save, remove } =
    useIncidencias();
  const [personal, setPersonal] = useState<Array<{ id: number; name: string; role?: string }>>(
    []
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Incidencia | null>(null);
  const [deleting, setDeleting] = useState<Incidencia | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPersonal(await fetchPersonal());
      } catch (error) {
        console.error("Error cargando personal:", error);
      }
    })();
  }, []);

  const columns = useMemo<ColumnDef<Incidencia, unknown>[]>(
    () => [
      {
        id: "paciente",
        header: "Paciente",
        cell: ({ row }) => {
          const p = row.original.paciente;
          return p ? (
            <span className="text-sm font-medium text-foreground">
              {p.nombre} {p.apellido}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "fecha_hora",
        header: "Fecha",
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-foreground">
            {dateTimeFmt.format(new Date(getValue<string>()))}
          </span>
        ),
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ getValue }) => (
          <Badge variant="muted">{getValue() as string}</Badge>
        ),
      },
      {
        accessorKey: "severidad",
        header: "Severidad",
        cell: ({ row }) => <SeveridadBadge severidad={row.original.severidad} />,
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ getValue }) => (
          <p className="max-w-md truncate text-sm text-foreground">
            {(getValue() as string) || "—"}
          </p>
        ),
      },
      {
        id: "reportado",
        header: "Reportado por",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.user?.name ?? "Sistema"}
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

  const handleSubmit = async (values: IncidenciaFormValues) => {
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
            <TriangleAlert className="h-3.5 w-3.5" />
            Reportes
          </Badge>
        }
        title="Incidencias"
        description="Registro de eventos clínicos, conductuales y operativos."
        actions={
          canReport && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva incidencia
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters({ search: v })}
          placeholder="Buscar por paciente, tipo o descripción…"
          className="sm:max-w-sm"
        />
        <Select
          value={filters.severidad}
          onValueChange={(v) =>
            setFilters({ severidad: v as IncidenciaSeveridad | "todos" })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las severidades</SelectItem>
            {SEVERIDADES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.search || filters.severidad !== "todos") && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Limpiar
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<TriangleAlert className="h-5 w-5" />}
            title="Sin incidencias"
            description="No hay eventos registrados en el período."
          />
        }
      />

      <IncidenciaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        registro={editing}
        personal={personal}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar incidencia"
        description="¿Querés eliminar esta incidencia? La acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
