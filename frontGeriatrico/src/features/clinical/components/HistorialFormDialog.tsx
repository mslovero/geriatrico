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
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import type { HistorialMedico, HistorialMedicoFormValues } from "../types";

interface HistorialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: HistorialMedico | null;
  onSubmit: (values: HistorialMedicoFormValues) => Promise<void>;
}

const empty: HistorialMedicoFormValues = {
  paciente_id: 0,
  fecha: new Date().toISOString().slice(0, 10),
  observacion: "",
  medico_responsable: "",
};

export function HistorialFormDialog({
  open,
  onOpenChange,
  registro,
  onSubmit,
}: HistorialFormDialogProps) {
  const [form, setForm] = useState<HistorialMedicoFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (registro) {
      setForm({
        id: registro.id,
        paciente_id: registro.paciente_id,
        fecha: registro.fecha,
        observacion: registro.observacion,
        medico_responsable: registro.medico_responsable ?? "",
      });
    } else {
      setForm({ ...empty });
    }
    setError(null);
  }, [open, registro]);

  const isEdicion = Boolean(form.id);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ ...form, paciente_id: Number(form.paciente_id) });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar el registro.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar entrada" : "Nueva entrada"}</DialogTitle>
          <DialogDescription>
            Registrá observaciones clínicas relevantes del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="hist_paciente">
              Paciente <span className="text-destructive">*</span>
            </Label>
            <PatientCombobox
              id="hist_paciente"
              value={form.paciente_id ? String(form.paciente_id) : ""}
              onChange={(v) => setForm({ ...form, paciente_id: v ? Number(v) : 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hist_fecha">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hist_fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hist_medico">Médico responsable</Label>
              <Input
                id="hist_medico"
                value={form.medico_responsable ?? ""}
                onChange={(e) => setForm({ ...form, medico_responsable: e.target.value })}
                placeholder="Dr/a. Apellido"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hist_obs">
              Observación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="hist_obs"
              rows={4}
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              required
              placeholder="Detalles relevantes del registro clínico…"
            />
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
            <Button type="submit" disabled={submitting || !form.paciente_id}>
              {submitting ? "Guardando…" : isEdicion ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
