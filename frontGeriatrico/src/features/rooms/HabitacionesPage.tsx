import { useMemo, useState } from "react";
import { DoorOpen, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";
import { useRooms } from "./hooks/useRooms";
import { RoomsStats } from "./components/RoomsStats";
import { HabitacionCard } from "./components/HabitacionCard";
import { HabitacionFormDialog } from "./components/HabitacionFormDialog";
import type { Habitacion, HabitacionFormValues } from "./types";

export default function HabitacionesPage() {
  const { canManageRooms: canManage, canDeleteRooms: canDelete } = usePermissions();

  const {
    habitaciones,
    loading,
    stats,
    pisos,
    getResumen,
    saveHabitacion,
    removeHabitacion,
  } = useRooms();

  const [search, setSearch] = useState("");
  const [piso, setPiso] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habitacion | null>(null);
  const [deleting, setDeleting] = useState<Habitacion | null>(null);

  const filtradas = useMemo(() => {
    return habitaciones.filter((h) => {
      const term = search.trim().toLowerCase();
      const matchSearch =
        term === "" ||
        h.numero?.toString().toLowerCase().includes(term) ||
        h.piso?.toString().includes(term);
      const matchPiso = piso === "todos" || (h.piso ?? 1).toString() === piso;
      return matchSearch && matchPiso;
    });
  }, [habitaciones, search, piso]);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (habitacion: Habitacion) => {
    setEditing(habitacion);
    setFormOpen(true);
  };

  const handleSubmit = async (values: HabitacionFormValues) => {
    await saveHabitacion(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await removeHabitacion(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <DoorOpen className="h-3.5 w-3.5" />
            Espacios
          </Badge>
        }
        title="Habitaciones"
        description="Administración y control de espacios físicos."
        actions={
          canManage && (
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              Nueva habitación
            </Button>
          )
        }
      />

      <RoomsStats stats={stats} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número o piso…"
          className="sm:max-w-sm"
        />
        <Select value={piso} onValueChange={setPiso}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Piso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los pisos</SelectItem>
            {pisos.map((p) => (
              <SelectItem key={p} value={p.toString()}>
                Piso {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyStateBlock
            icon={<DoorOpen className="h-5 w-5" />}
            title="No encontramos habitaciones"
            description="Probá quitar los filtros o registrar una nueva habitación."
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((h) => (
            <HabitacionCard
              key={h.id}
              habitacion={h}
              resumen={getResumen(h)}
              onEdit={canManage ? handleEdit : undefined}
              onDelete={canDelete ? setDeleting : undefined}
            />
          ))}
        </div>
      )}

      <HabitacionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        habitacion={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar habitación"
        description={
          deleting && (
            <span>
              ¿Querés eliminar la <strong>Habitación {deleting.numero}</strong>?
              Las camas asociadas también se removerán.
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
