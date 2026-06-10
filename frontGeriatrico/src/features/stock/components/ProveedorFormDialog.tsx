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
import { Textarea } from "@/components/ui/textarea";
import type { Proveedor, ProveedorFormValues } from "../types";

interface ProveedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor?: Proveedor | null;
  onSubmit: (values: ProveedorFormValues) => Promise<void>;
}

const emptyForm: ProveedorFormValues = {
  nombre: "",
  razon_social: "",
  cuit: "",
  telefono: "",
  email: "",
  direccion: "",
  observaciones: "",
};

export function ProveedorFormDialog({
  open,
  onOpenChange,
  proveedor,
  onSubmit,
}: ProveedorFormDialogProps) {
  const [form, setForm] = useState<ProveedorFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (proveedor) {
      setForm({
        id: proveedor.id,
        nombre: proveedor.nombre,
        razon_social: proveedor.razon_social ?? "",
        cuit: proveedor.cuit ?? "",
        telefono: proveedor.telefono ?? "",
        email: proveedor.email ?? "",
        direccion: proveedor.direccion ?? "",
        observaciones: proveedor.observaciones ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, proveedor]);

  const isEdicion = Boolean(form.id);

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
        "No se pudo guardar el proveedor.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          <DialogDescription>
            Datos comerciales del proveedor habitual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prov_nombre">
                Nombre fantasía <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prov_nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                placeholder="Droguería del Sud"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prov_razon">Razón social</Label>
              <Input
                id="prov_razon"
                value={form.razon_social ?? ""}
                onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                placeholder="Droguería del Sud S.A."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prov_cuit">CUIT</Label>
              <Input
                id="prov_cuit"
                value={form.cuit ?? ""}
                onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                placeholder="30-12345678-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prov_tel">Teléfono</Label>
              <Input
                id="prov_tel"
                value={form.telefono ?? ""}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="011 4444-5555"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prov_email">Email</Label>
              <Input
                id="prov_email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contacto@proveedor.com"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prov_dir">Dirección</Label>
              <Textarea
                id="prov_dir"
                rows={2}
                value={form.direccion ?? ""}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                placeholder="Calle, altura, localidad…"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prov_obs">Observaciones</Label>
              <Textarea
                id="prov_obs"
                rows={2}
                value={form.observaciones ?? ""}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              />
            </div>
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
              {submitting ? "Guardando…" : isEdicion ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
