import { useState } from "react";
import { Lock, Plus, UserCog } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useUsuarios } from "./hooks/useUsuarios";
import { UsuariosFilters } from "./components/UsuariosFilters";
import { UsuariosTable } from "./components/UsuariosTable";
import { UsuarioFormDialog } from "./components/UsuarioFormDialog";
import type { Usuario, UsuarioFormValues } from "./types";

export default function UsuariosPage() {
  const { user } = useAuth();
  const { canManageUsers } = usePermissions();

  if (!canManageUsers) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyStateBlock
          icon={<Lock className="h-5 w-5 text-destructive" />}
          title="Acceso restringido"
          description="Sólo los administradores pueden gestionar usuarios del sistema."
        />
      </div>
    );
  }

  return <UsuariosPageContent currentUserId={user?.id ?? 0} />;
}

interface UsuariosPageContentProps {
  currentUserId: number;
}

function UsuariosPageContent({ currentUserId }: UsuariosPageContentProps) {
  const {
    usuariosFiltrados,
    loading,
    filters,
    setFilters,
    resetFilters,
    saveDraft,
    removeUsuario,
  } = useUsuarios();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState<Usuario | null>(null);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditing(usuario);
    setFormOpen(true);
  };

  const handleSubmit = async (values: UsuarioFormValues) => {
    await saveDraft(values);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await removeUsuario(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={
          <Badge variant="muted">
            <UserCog className="h-3.5 w-3.5" />
            Administración
          </Badge>
        }
        title="Usuarios"
        description="Gestioná las cuentas del equipo y sus permisos."
        actions={
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="space-y-4">
        <UsuariosFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
        <UsuariosTable
          usuarios={usuariosFiltrados}
          loading={loading}
          currentUserId={currentUserId}
          onEdit={handleEdit}
          onDelete={setDeleting}
        />
      </div>

      <UsuarioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        usuario={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar usuario"
        description={
          deleting && (
            <span>
              ¿Querés eliminar la cuenta de <strong>{deleting.name}</strong>?
              Esta acción no puede deshacerse.
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
