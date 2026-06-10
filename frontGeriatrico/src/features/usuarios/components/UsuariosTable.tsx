import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Usuario } from "../types";

interface UsuariosTableProps {
  usuarios: Usuario[];
  loading: boolean;
  currentUserId?: number;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

export function UsuariosTable({
  usuarios,
  loading,
  currentUserId,
  onEdit,
  onDelete,
}: UsuariosTableProps) {
  const columns = useMemo<ColumnDef<Usuario, unknown>[]>(
    () => [
      {
        id: "usuario",
        header: "Usuario",
        cell: ({ row }) => {
          const u = row.original;
          const initials = u.name?.slice(0, 2) ?? "?";
          return (
            <div className="flex items-center gap-3">
              <Avatar initials={initials} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = u.id === currentUserId;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${u.name}`}
                onClick={() => onEdit(u)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar ${u.name}`}
                onClick={() => onDelete(u)}
                disabled={isSelf}
                title={isSelf ? "No podés eliminar tu propio usuario" : "Eliminar"}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [currentUserId, onDelete, onEdit]
  );

  return (
    <DataTable
      columns={columns}
      data={usuarios}
      loading={loading}
      empty={
        <EmptyStateBlock
          icon={<Users className="h-5 w-5" />}
          title="No hay usuarios"
          description="Probá ajustar los filtros o crear un nuevo usuario."
        />
      }
    />
  );
}
