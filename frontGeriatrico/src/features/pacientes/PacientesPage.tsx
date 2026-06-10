import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { usePacientes } from "./hooks/usePacientes";
import { PacientesFilters } from "./components/PacientesFilters";
import { PacientesStats } from "./components/PacientesStats";
import { PacientesTable } from "./components/PacientesTable";
import { PacienteFormDialog } from "./components/PacienteFormDialog";
import type { Paciente, PacienteFormValues } from "./types";

export default function PacientesPage() {
  const { canManagePacientes, canDeletePacientes } = usePermissions();
  const {
    pacientesFiltrados,
    habitaciones,
    camas,
    loading,
    filters,
    setFilters,
    resetFilters,
    stats,
    saveDraft,
    removePaciente,
  } = usePacientes();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Paciente | null>(null);
  const [deleting, setDeleting] = useState<Paciente | null>(null);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (paciente: Paciente) => {
    setEditing(paciente);
    setFormOpen(true);
  };

  const handleSubmit = async (values: PacienteFormValues) => {
    await saveDraft(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await removePaciente(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <Users className="h-3.5 w-3.5" />
            Residentes
          </Badge>
        }
        title="Pacientes"
        description="Gestión integral de residentes, ubicación y datos clínicos."
        actions={
          canManagePacientes && (
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              Nuevo ingreso
            </Button>
          )
        }
      />

      <PacientesStats stats={stats} />

      <div className="space-y-4">
        <PacientesFilters
          filters={filters}
          habitaciones={habitaciones}
          onChange={setFilters}
          onReset={resetFilters}
        />

        <PacientesTable
          pacientes={pacientesFiltrados}
          loading={loading}
          canEdit={canManagePacientes}
          canDelete={canDeletePacientes}
          onEdit={handleEdit}
          onDelete={setDeleting}
        />
      </div>

      <PacienteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        paciente={editing}
        habitaciones={habitaciones}
        camas={camas}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar paciente"
        description={
          deleting && (
            <span>
              ¿Querés eliminar a <strong>{deleting.nombre} {deleting.apellido}</strong>?
              Esta acción puede revertirse desde la papelera del sistema.
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
