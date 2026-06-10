import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useProveedores } from "./hooks/useProveedores";
import { ProveedorFormDialog } from "./components/ProveedorFormDialog";
import type { Proveedor, ProveedorFormValues } from "./types";

export default function ProveedoresPage() {
  const { canManageProveedores: canManage, canDeleteProveedores: canDelete } =
    usePermissions();

  const { filtered, loading, search, setSearch, save, remove } = useProveedores();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState<Proveedor | null>(null);

  const columns = useMemo<ColumnDef<Proveedor, unknown>[]>(
    () => [
      {
        id: "proveedor",
        header: "Proveedor",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">{p.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {p.razon_social ?? "—"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "cuit",
        header: "CUIT",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">
            {(getValue() as string) || "—"}
          </span>
        ),
      },
      {
        accessorKey: "telefono",
        header: "Teléfono",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">
            {(getValue() as string) || "—"}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          return v ? (
            <a
              href={`mailto:${v}`}
              className="text-sm text-primary hover:underline"
            >
              {v}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${p.nombre}`}
                  onClick={() => {
                    setEditing(p);
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
                  aria-label={`Eliminar ${p.nombre}`}
                  onClick={() => setDeleting(p)}
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

  const handleSubmit = async (values: ProveedorFormValues) => {
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
            <Building2 className="h-3.5 w-3.5" />
            Proveedores
          </Badge>
        }
        title="Gestión de proveedores"
        description="Información comercial y de contacto de cada proveedor habitual."
        actions={
          canManage && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo proveedor
            </Button>
          )
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre, razón social, CUIT o email…"
        className="sm:max-w-md"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<Building2 className="h-5 w-5" />}
            title="No hay proveedores"
            description="Cargá tu primer proveedor para empezar."
          />
        }
      />

      <ProveedorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        proveedor={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar proveedor"
        description={
          deleting && (
            <span>
              ¿Querés eliminar a <strong>{deleting.nombre}</strong>? Los items de stock
              vinculados quedarán sin proveedor.
            </span>
          )
        }
        confirmLabel="Sí, eliminar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
