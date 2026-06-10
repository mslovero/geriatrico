import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useTurnos } from "./hooks/useTurnos";
import { TurnoFormDialog } from "./components/TurnoFormDialog";
import { TurnoEstadoBadge } from "./components/TurnoEstadoBadge";
import { TURNO_ESTADOS, type TurnoEstado, type TurnoFormValues, type TurnoMedico } from "./types";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" });

export default function TurnosPage() {
  const { canManageTurnos: canManage, canDeleteTurnos: canDelete } = usePermissions();

  const { filtered, loading, filters, setFilters, resetFilters, save, remove } = useTurnos();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TurnoMedico | null>(null);
  const [deleting, setDeleting] = useState<TurnoMedico | null>(null);

  const columns = useMemo<ColumnDef<TurnoMedico, unknown>[]>(
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
        cell: ({ getValue }) => {
          const d = new Date(getValue<string>());
          return (
            <div className="leading-tight">
              <p className="text-sm font-medium text-foreground">{dateFmt.format(d)}</p>
              <p className="text-xs tabular-nums text-muted-foreground">{timeFmt.format(d)} hs</p>
            </div>
          );
        },
      },
      {
        accessorKey: "especialidad",
        header: "Especialidad",
        cell: ({ getValue }) => (
          <Badge variant="muted">{(getValue() as string) || "—"}</Badge>
        ),
      },
      {
        accessorKey: "profesional",
        header: "Profesional",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{(getValue() as string) || "—"}</span>
        ),
      },
      {
        accessorKey: "lugar",
        header: "Lugar",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {(getValue() as string) || "—"}
          </span>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <TurnoEstadoBadge estado={row.original.estado} />,
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canManage && (
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
    [canDelete, canManage]
  );

  const handleSubmit = async (values: TurnoFormValues) => {
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
            <CalendarClock className="h-3.5 w-3.5" />
            Agenda
          </Badge>
        }
        title="Turnos médicos"
        description="Coordinación de consultas externas y profesionales tratantes."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo turno
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters({ search: v })}
          placeholder="Buscar por paciente, profesional o especialidad…"
          className="sm:max-w-sm"
        />
        <Select
          value={filters.estado}
          onValueChange={(v) => setFilters({ estado: v as TurnoEstado | "todos" })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {TURNO_ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.search || filters.estado !== "todos") && (
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
            icon={<CalendarClock className="h-5 w-5" />}
            title="Sin turnos"
            description="No hay turnos programados que coincidan con los filtros."
          />
        }
      />

      <TurnoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        registro={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar turno"
        description="¿Querés eliminar este turno?"
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
