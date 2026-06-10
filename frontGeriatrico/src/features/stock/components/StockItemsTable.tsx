import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BoxesIcon, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropiedadBadge } from "./PropiedadBadge";
import { StockBadge, formatPresentacion } from "./StockBadge";
import type { StockItem } from "../types";

interface StockItemsTableProps {
  items: StockItem[];
  loading: boolean;
  canManage: boolean;
  canDelete: boolean;
  onEdit: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

export function StockItemsTable({
  items,
  loading,
  canManage,
  canDelete,
  onEdit,
  onDelete,
}: StockItemsTableProps) {
  const columns = useMemo<ColumnDef<StockItem, unknown>[]>(
    () => [
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => {
          const i = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">{i.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {[i.tipo === "medicamento" ? "Medicamento" : "Insumo", i.codigo]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          );
        },
      },
      {
        id: "propiedad",
        header: "Propietario",
        cell: ({ row }) => {
          const i = row.original;
          const nombre = i.paciente_propietario
            ? `${i.paciente_propietario.nombre} ${i.paciente_propietario.apellido}`
            : null;
          return <PropiedadBadge propiedad={i.propiedad} pacienteNombre={nombre} />;
        },
      },
      {
        id: "stock",
        header: "Stock",
        cell: ({ row }) => {
          const i = row.original;
          const equiv = formatPresentacion(i);
          return (
            <div className="space-y-1">
              <StockBadge item={i} />
              {equiv && (
                <p className="text-[11px] text-muted-foreground">{equiv}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "stock_minimo",
        header: "Mínimo",
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {String(getValue() ?? 0)}
          </span>
        ),
      },
      {
        accessorKey: "precio_unitario",
        header: "Precio",
        cell: ({ getValue }) => {
          const v = getValue<number | null>();
          return v ? (
            <span className="text-sm tabular-nums text-foreground">
              ${v.toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "proveedor",
        header: "Proveedor",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.proveedor?.nombre ?? (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </span>
        ),
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const i = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${i.nombre}`}
                  onClick={() => onEdit(i)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${i.nombre}`}
                  onClick={() => onDelete(i)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [canDelete, canManage, onDelete, onEdit]
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      empty={
        <EmptyStateBlock
          icon={<BoxesIcon className="h-5 w-5" />}
          title="No hay items"
          description="Ajustá los filtros o creá un nuevo item de stock."
        />
      }
    />
  );
}

// Keep "Badge" import side-effect free in case it changes later
void Badge;
