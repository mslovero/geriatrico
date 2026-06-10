import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, FileText, Pencil, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PacienteStatusBadge } from "./PacienteStatusBadge";
import type { Paciente } from "../types";

interface PacientesTableProps {
  pacientes: Paciente[];
  loading: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
}

export function PacientesTable({
  pacientes,
  loading,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
}: PacientesTableProps) {
  const columns = useMemo<ColumnDef<Paciente, unknown>[]>(
    () => [
      {
        id: "paciente",
        header: "Paciente",
        cell: ({ row }) => {
          const p = row.original;
          const initials = `${p.nombre?.[0] ?? ""}${p.apellido?.[0] ?? ""}`;
          return (
            <div className="flex items-center gap-3">
              <Avatar initials={initials} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {p.nombre} {p.apellido}
                </p>
                <p className="text-xs text-muted-foreground">DNI {p.dni}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "ubicacion",
        header: "Ubicación",
        cell: ({ row }) => {
          const p = row.original;
          if (!p.habitacion_id) {
            return <span className="text-xs text-muted-foreground">Sin ubicar</span>;
          }
          const hab = p.habitacion?.numero ?? p.habitacion_id;
          const cama = p.cama?.numero_cama ?? p.cama_id ?? "—";
          return (
            <div className="text-sm text-foreground">
              Hab. {hab}
              <span className="text-muted-foreground"> · Cama {cama}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "medico_cabecera",
        header: "Médico de cabecera",
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return value ? (
            <span className="text-sm text-foreground">{value}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <PacienteStatusBadge estado={row.original.estado} />,
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link to={`/pacientes/${p.id}/ficha`}>
                  <FileText className="h-3.5 w-3.5" />
                  Ficha
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${p.nombre} ${p.apellido}`}
                  onClick={() => onEdit(p)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${p.nombre} ${p.apellido}`}
                  onClick={() => onDelete(p)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [canDelete, canEdit, onDelete, onEdit]
  );

  return (
    <DataTable
      columns={columns}
      data={pacientes}
      loading={loading}
      empty={
        <EmptyStateBlock
          icon={<Users className="h-5 w-5" />}
          title="No encontramos pacientes"
          description="Probá ajustar los filtros o registrá un nuevo ingreso."
        />
      }
    />
  );
}
