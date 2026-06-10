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
import type { Habitacion, HabitacionFormValues } from "../types";

interface HabitacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitacion?: Habitacion | null;
  onSubmit: (values: HabitacionFormValues) => Promise<void>;
}

const emptyForm: HabitacionFormValues = {
  numero: "",
  piso: 1,
  capacidad: 1,
};

export function HabitacionFormDialog({
  open,
  onOpenChange,
  habitacion,
  onSubmit,
}: HabitacionFormDialogProps) {
  const [form, setForm] = useState<HabitacionFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (habitacion) {
      setForm({
        id: habitacion.id,
        numero: habitacion.numero,
        piso: habitacion.piso ?? 1,
        capacidad: habitacion.capacidad,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, habitacion]);

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
        "No se pudo guardar la habitación.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdicion ? "Editar habitación" : "Nueva habitación"}
          </DialogTitle>
          <DialogDescription>
            Definí número, piso y capacidad de camas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="hab_numero">
              Número <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hab_numero"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              required
              placeholder="Ej: 101"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hab_piso">Piso</Label>
              <Input
                id="hab_piso"
                type="number"
                min={1}
                max={20}
                value={form.piso ?? 1}
                onChange={(e) =>
                  setForm({ ...form, piso: e.target.value ? Number(e.target.value) : 1 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hab_capacidad">
                Capacidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hab_capacidad"
                type="number"
                min={1}
                max={10}
                value={form.capacidad}
                onChange={(e) =>
                  setForm({ ...form, capacidad: Number(e.target.value) || 1 })
                }
                required
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
