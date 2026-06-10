import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useHistorialMedico } from "./hooks/useHistorialMedico";
import { HistorialFormDialog } from "./components/HistorialFormDialog";
import type { HistorialMedico, HistorialMedicoFormValues } from "./types";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) {
    return dateFmt.format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  }
  return dateFmt.format(new Date(value));
}

export default function HistorialMedicoPage() {
  const { canManageHistorial: canManage, canDeleteHistorial: canDelete } =
    usePermissions();

  const { filtered, loading, search, setSearch, save, remove } = useHistorialMedico();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HistorialMedico | null>(null);
  const [deleting, setDeleting] = useState<HistorialMedico | null>(null);

  const columns = useMemo<ColumnDef<HistorialMedico, unknown>[]>(
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
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "observacion",
        header: "Observación",
        cell: ({ getValue }) => (
          <p className="max-w-md truncate text-sm text-foreground">
            {(getValue() as string) || "—"}
          </p>
        ),
      },
      {
        accessorKey: "medico_responsable",
        header: "Médico",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{(getValue() as string) || "—"}</span>
        ),
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

  const handleSubmit = async (values: HistorialMedicoFormValues) => {
    await save(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <FileText className="h-3.5 w-3.5" />
            Historial
          </Badge>
        }
        title="Historial médico"
        description="Registro clínico continuo por paciente."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva entrada
            </Button>
          )
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por paciente, médico o texto…"
        className="sm:max-w-md"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<FileText className="h-5 w-5" />}
            title="Sin entradas"
            description="Aún no hay registros en el historial médico."
          />
        }
      />

      <HistorialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        registro={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar entrada"
        description="¿Querés eliminar esta entrada del historial médico?"
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
