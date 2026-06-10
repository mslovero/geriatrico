import { useEffect, useState } from "react";
import { BoxesIcon, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchProveedores } from "./api";
import { useStockItems } from "./hooks/useStockItems";
import { StockItemsFilters } from "./components/StockItemsFilters";
import { StockItemsTable } from "./components/StockItemsTable";
import { StockItemFormDialog } from "./components/StockItemFormDialog";
import type { Proveedor, StockItem, StockItemFormValues } from "./types";

export default function StockItemsPage() {
  const { canManageStock: canManage, canDeleteStock: canDelete } = usePermissions();

  const { filtered, loading, filters, setFilters, resetFilters, save, remove } =
    useStockItems();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [deleting, setDeleting] = useState<StockItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProveedores(await fetchProveedores());
      } catch (error) {
        console.error("Error cargando proveedores:", error);
      }
    })();
  }, []);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (values: StockItemFormValues) => {
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
            <BoxesIcon className="h-3.5 w-3.5" />
            Stock
          </Badge>
        }
        title="Items de stock"
        description="Medicamentos e insumos del geriátrico y pacientes."
        actions={
          canManage && (
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              Nuevo item
            </Button>
          )
        }
      />

      <div className="space-y-4">
        <StockItemsFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
        <StockItemsTable
          items={filtered}
          loading={loading}
          canManage={canManage}
          canDelete={canDelete}
          onEdit={handleEdit}
          onDelete={setDeleting}
        />
      </div>

      <StockItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        proveedores={proveedores}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar item de stock"
        description={
          deleting && (
            <span>
              ¿Querés eliminar <strong>{deleting.nombre}</strong>? Esta acción puede
              afectar lotes y registros vinculados.
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
