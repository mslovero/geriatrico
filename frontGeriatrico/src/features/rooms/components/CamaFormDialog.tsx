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
import { CAMA_ESTADOS } from "../types";
import type { Cama, CamaEstado, CamaFormValues, Habitacion } from "../types";

interface CamaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cama?: Cama | null;
  habitaciones: Habitacion[];
  onSubmit: (values: CamaFormValues) => Promise<void>;
}

const emptyForm: CamaFormValues = {
  numero_cama: "",
  habitacion_id: 0,
  estado: "libre",
};

export function CamaFormDialog({
  open,
  onOpenChange,
  cama,
  habitaciones,
  onSubmit,
}: CamaFormDialogProps) {
  const [form, setForm] = useState<CamaFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (cama) {
      setForm({
        id: cama.id,
        numero_cama: cama.numero_cama,
        habitacion_id: cama.habitacion_id,
        estado: cama.estado,
      });
    } else {
      setForm({
        ...emptyForm,
        habitacion_id: habitaciones[0]?.id ?? 0,
      });
    }
    setError(null);
  }, [open, cama, habitaciones]);

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
        "No se pudo guardar la cama.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar cama" : "Nueva cama"}</DialogTitle>
          <DialogDescription>
            Asigná la habitación, número y estado actual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cama_habitacion">
              Habitación <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.habitacion_id ? String(form.habitacion_id) : ""}
              onValueChange={(value) =>
                setForm({ ...form, habitacion_id: Number(value) })
              }
            >
              <SelectTrigger id="cama_habitacion">
                <SelectValue placeholder="Seleccionar habitación" />
              </SelectTrigger>
              <SelectContent>
                {habitaciones.map((h) => (
                  <SelectItem key={h.id} value={h.id.toString()}>
                    Habitación {h.numero}
                    {h.piso != null ? ` · piso ${h.piso}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cama_numero">
              Número de cama <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cama_numero"
              value={form.numero_cama}
              onChange={(e) => setForm({ ...form, numero_cama: e.target.value })}
              required
              placeholder="Ej: A, B, 1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cama_estado">
              Estado <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.estado}
              onValueChange={(value) =>
                setForm({ ...form, estado: value as CamaEstado })
              }
            >
              <SelectTrigger id="cama_estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMA_ESTADOS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
