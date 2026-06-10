import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BedDouble, Hospital, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useRooms } from "./hooks/useRooms";
import { CamaEstadoBadge } from "./components/CamaEstadoBadge";
import { CamaFormDialog } from "./components/CamaFormDialog";
import { CAMA_ESTADOS } from "./types";
import type { Cama, CamaEstado, CamaFormValues, Habitacion } from "./types";

export default function CamasPage() {
  const { canManageRooms: canManage, canDeleteRooms: canDelete } = usePermissions();

  const { habitaciones, camas, loading, saveCama, removeCama } = useRooms();

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<CamaEstado | "todos">("todos");
  const [habitacionId, setHabitacionId] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cama | null>(null);
  const [deleting, setDeleting] = useState<Cama | null>(null);

  const filtradas = useMemo(() => {
    return camas.filter((c) => {
      const term = search.trim().toLowerCase();
      const matchSearch =
        term === "" ||
        c.numero_cama?.toLowerCase().includes(term) ||
        c.habitacion?.numero?.toString().includes(term);
      const matchEstado = estado === "todos" || c.estado === estado;
      const matchHab = habitacionId === "todos" || c.habitacion_id.toString() === habitacionId;
      return matchSearch && matchEstado && matchHab;
    });
  }, [camas, search, estado, habitacionId]);

  const columns = useMemo<ColumnDef<Cama, unknown>[]>(
    () => [
      {
        id: "habitacion",
        header: "Habitación",
        cell: ({ row }) => {
          const cama = row.original;
          const hab: Habitacion | null = cama.habitacion ?? null;
          return (
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Hospital className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium text-foreground">
                  Habitación {hab?.numero ?? cama.habitacion_id}
                </p>
                {hab?.piso != null && (
                  <p className="text-xs text-muted-foreground">Piso {hab.piso}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "numero_cama",
        header: "Cama",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-foreground">Cama {String(getValue())}</span>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <CamaEstadoBadge estado={row.original.estado} />,
      },
      {
        id: "acciones",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const cama = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar cama ${cama.numero_cama}`}
                  onClick={() => {
                    setEditing(cama);
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
                  aria-label={`Eliminar cama ${cama.numero_cama}`}
                  onClick={() => setDeleting(cama)}
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

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSubmit = async (values: CamaFormValues) => {
    await saveCama(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await removeCama(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <BedDouble className="h-3.5 w-3.5" />
            Inventario clínico
          </Badge>
        }
        title="Camas"
        description="Estado actual de cada cama y asignación a habitaciones."
        actions={
          canManage && (
            <Button onClick={handleNew} disabled={habitaciones.length === 0}>
              <Plus className="h-4 w-4" />
              Nueva cama
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número de cama o habitación…"
          className="sm:max-w-sm"
        />
        <Select value={estado} onValueChange={(value) => setEstado(value as CamaEstado | "todos")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {CAMA_ESTADOS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={habitacionId} onValueChange={setHabitacionId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Habitación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las habitaciones</SelectItem>
            {habitaciones.map((h) => (
              <SelectItem key={h.id} value={h.id.toString()}>
                Habitación {h.numero}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtradas}
        loading={loading}
        empty={
          <EmptyStateBlock
            icon={<BedDouble className="h-5 w-5" />}
            title="No hay camas"
            description="Probá quitar los filtros o agregá una nueva cama al sistema."
          />
        }
      />

      <CamaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cama={editing}
        habitaciones={habitaciones}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar cama"
        description={
          deleting && (
            <span>
              ¿Querés eliminar la <strong>cama {deleting.numero_cama}</strong> de la
              habitación {deleting.habitacion?.numero ?? deleting.habitacion_id}?
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
