import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Pencil, Pill, Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { OrigenPagoBadge } from "./OrigenPagoBadge";
import { TipoMedicacionBadge } from "./TipoMedicacionBadge";
import type { Medicacion } from "../types";

interface MedicacionesTableProps {
  medicaciones: Medicacion[];
  loading: boolean;
  canManage: boolean;
  canDelete: boolean;
  canAdminister: boolean;
  onEdit: (medicacion: Medicacion) => void;
  onDelete: (medicacion: Medicacion) => void;
  onAdministrar: (medicacion: Medicacion) => void;
}

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return dateFmt.format(new Date(Number(y), Number(m) - 1, Number(d)));
}

export function MedicacionesTable({
  medicaciones,
  loading,
  canManage,
  canDelete,
  canAdminister,
  onEdit,
  onDelete,
  onAdministrar,
}: MedicacionesTableProps) {
  const columns = useMemo<ColumnDef<Medicacion, unknown>[]>(
    () => [
      {
        id: "medicacion",
        header: "Medicación",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div>
              <p className="text-sm font-medium text-foreground">{m.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {[m.dosis, m.frecuencia].filter(Boolean).join(" · ") || "Sin detalles"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => <TipoMedicacionBadge tipo={row.original.tipo} />,
      },
      {
        accessorKey: "origen_pago",
        header: "Origen",
        cell: ({ row }) => <OrigenPagoBadge origen={row.original.origen_pago} />,
      },
      {
        id: "paciente",
        header: "Paciente",
        cell: ({ row }) => {
          const p = row.original.paciente;
          return p ? (
            <span className="text-sm text-foreground">
              {p.nombre} {p.apellido}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sin asignar</span>
          );
        },
      },
      {
        id: "fechas",
        header: "Vigencia",
        cell: ({ row }) => {
          const m = row.original;
          if (!m.fecha_inicio && !m.fecha_fin) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <span className="text-xs text-muted-foreground">
              {formatDate(m.fecha_inicio)} → {formatDate(m.fecha_fin)}
            </span>
          );
        },
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canAdminister && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onAdministrar(m)}
                  aria-label={`Administrar ${m.nombre}`}
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Administrar
                </Button>
              )}
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${m.nombre}`}
                  onClick={() => onEdit(m)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${m.nombre}`}
                  onClick={() => onDelete(m)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [canAdminister, canDelete, canManage, onAdministrar, onDelete, onEdit]
  );

  return (
    <DataTable
      columns={columns}
      data={medicaciones}
      loading={loading}
      empty={
        <EmptyStateBlock
          icon={<Pill className="h-5 w-5" />}
          title="No encontramos medicaciones"
          description="Probá ajustar los filtros o registrar una nueva medicación."
        />
      }
    />
  );
}
