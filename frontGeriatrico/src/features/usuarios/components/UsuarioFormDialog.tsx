import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "../types";
import type { Usuario, UsuarioFormValues, UserRole } from "../types";

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario | null;
  onSubmit: (values: UsuarioFormValues) => Promise<void>;
}

const emptyForm: UsuarioFormValues = {
  name: "",
  email: "",
  role: "staff",
  password: "",
};

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
  onSubmit,
}: UsuarioFormDialogProps) {
  const [form, setForm] = useState<UsuarioFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (usuario) {
      setForm({
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        password: "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, usuario]);

  const isEdicion = Boolean(form.id);

  const updateField = <K extends keyof UsuarioFormValues>(
    field: K,
    value: UsuarioFormValues[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar el usuario. Revisá los datos e intentá de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {isEdicion
              ? "Actualizá los datos del usuario."
              : "Creá una cuenta para un nuevo miembro del equipo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="usuario_nombre">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="usuario_nombre"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              placeholder="Nombre completo"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usuario_email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="usuario_email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              placeholder="usuario@residencia.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usuario_role">
              Rol <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.role}
              onValueChange={(value) => updateField("role", value as UserRole)}
            >
              <SelectTrigger id="usuario_role">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usuario_password">
              Contraseña {isEdicion ? "" : <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="usuario_password"
              type="password"
              value={form.password ?? ""}
              onChange={(e) => updateField("password", e.target.value)}
              required={!isEdicion}
              minLength={8}
              placeholder={isEdicion ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
              autoComplete="new-password"
            />
            {isEdicion && (
              <p className="text-xs text-muted-foreground">
                Solo completala si querés cambiar la contraseña actual.
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando…" : isEdicion ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
