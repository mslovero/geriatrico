import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Layers, Pill, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useMedicaciones } from "./hooks/useMedicaciones";
import { MedicacionesFilters } from "./components/MedicacionesFilters";
import { MedicacionesTable } from "./components/MedicacionesTable";
import { MedicacionFormDialog } from "./components/MedicacionFormDialog";
import { AdministrarMedicacionDialog } from "./components/AdministrarMedicacionDialog";
import type { Medicacion, MedicacionFormValues } from "./types";

export default function MedicacionesPage() {
  const {
    canManageMedicaciones: canManage,
    canDeleteMedicaciones: canDelete,
    canAdministerMedicaciones: canAdminister,
  } = usePermissions();

  const { filtered, loading, filters, setFilters, resetFilters, save, remove, refresh } =
    useMedicaciones();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicacion | null>(null);
  const [deleting, setDeleting] = useState<Medicacion | null>(null);
  const [administrar, setAdministrar] = useState<Medicacion | null>(null);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (m: Medicacion) => {
    setEditing(m);
    setFormOpen(true);
  };

  const handleSubmit = async (values: MedicacionFormValues) => {
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
            <Pill className="h-3.5 w-3.5" />
            Medicamentos
          </Badge>
        }
        title="Gestión de medicamentos"
        description="Tratamientos activos por residente con trazabilidad de stock."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/medicamentos/estado">
                <Activity className="h-4 w-4" />
                Estado stock
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/medicamentos/carga">
                <Layers className="h-4 w-4" />
                Carga masiva
              </Link>
            </Button>
            {canManage && (
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4" />
                Nueva medicación
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-4">
        <MedicacionesFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
        />
        <MedicacionesTable
          medicaciones={filtered}
          loading={loading}
          canManage={canManage}
          canDelete={canDelete}
          canAdminister={canAdminister}
          onEdit={handleEdit}
          onDelete={setDeleting}
          onAdministrar={setAdministrar}
        />
      </div>

      <MedicacionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        medicacion={editing}
        onSubmit={handleSubmit}
      />

      <AdministrarMedicacionDialog
        open={Boolean(administrar)}
        onOpenChange={(open) => !open && setAdministrar(null)}
        medicacion={administrar}
        onSuccess={() => void refresh()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar medicación"
        description={
          deleting && (
            <span>
              ¿Querés eliminar <strong>{deleting.nombre}</strong>? Esta acción no se puede
              deshacer.
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
