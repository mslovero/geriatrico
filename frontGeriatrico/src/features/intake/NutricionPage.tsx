import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2, Utensils } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useDietas } from "./hooks/useDietas";
import { DietaFormDialog } from "./components/DietaFormDialog";
import type { Dieta, DietaFormValues } from "./types";

export default function NutricionPage() {
  const { canManageDietas: canManage, canDeleteDietas: canDelete } = usePermissions();

  const { filtered, loading, search, setSearch, save, remove } = useDietas();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Dieta | null>(null);
  const [deleting, setDeleting] = useState<Dieta | null>(null);

  const columns = useMemo<ColumnDef<Dieta, unknown>[]>(
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
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ getValue }) => (
          <Badge variant="muted">{getValue() as string}</Badge>
        ),
      },
      {
        accessorKey: "consistencia",
        header: "Consistencia",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "alergias",
        header: "Alergias",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          if (!v) {
            return <span className="text-xs text-muted-foreground">Sin registrar</span>;
          }
          return (
            <Badge variant="destructive" className="max-w-xs truncate">
              {v}
            </Badge>
          );
        },
      },
      {
        accessorKey: "observaciones",
        header: "Observaciones",
        cell: ({ getValue }) => (
          <p className="max-w-md truncate text-sm text-muted-foreground">
            {(getValue() as string) || "—"}
          </p>
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

  const handleSubmit = async (values: DietaFormValues) => {
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
            <Utensils className="h-3.5 w-3.5" />
            Nutrición
          </Badge>
        }
        title="Dietas"
        description="Plan alimentario y alergias por residente."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva dieta
            </Button>
          )
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por paciente, tipo o alergia…"
        className="sm:max-w-md"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<Utensils className="h-5 w-5" />}
            title="Sin dietas registradas"
            description="Cargá el plan alimentario del primer residente."
          />
        }
      />

      <DietaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        registro={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar dieta"
        description="¿Querés eliminar esta dieta? La cocina perderá esta referencia."
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
