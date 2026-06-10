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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import {
  TURNO_ESTADOS,
  type TurnoEstado,
  type TurnoFormValues,
  type TurnoMedico,
} from "../types";

interface TurnoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: TurnoMedico | null;
  onSubmit: (values: TurnoFormValues) => Promise<void>;
}

function toLocalDatetime(value?: string | null): string {
  if (!value) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 16);
}

const empty: TurnoFormValues = {
  paciente_id: 0,
  fecha_hora: "",
  especialidad: "",
  profesional: "",
  lugar: "",
  estado: "pendiente",
  observaciones: "",
};

export function TurnoFormDialog({
  open,
  onOpenChange,
  registro,
  onSubmit,
}: TurnoFormDialogProps) {
  const [form, setForm] = useState<TurnoFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (registro) {
      setForm({
        id: registro.id,
        paciente_id: registro.paciente_id,
        fecha_hora: toLocalDatetime(registro.fecha_hora),
        especialidad: registro.especialidad,
        profesional: registro.profesional,
        lugar: registro.lugar ?? "",
        estado: registro.estado,
        observaciones: registro.observaciones ?? "",
      });
    } else {
      setForm({ ...empty, fecha_hora: toLocalDatetime() });
    }
    setError(null);
  }, [open, registro]);

  const update = <K extends keyof TurnoFormValues>(field: K, value: TurnoFormValues[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
        "No se pudo guardar el turno.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar turno" : "Nuevo turno"}</DialogTitle>
          <DialogDescription>
            Coordiná el turno médico del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="trn_paciente">
              Paciente <span className="text-destructive">*</span>
            </Label>
            <PatientCombobox
              id="trn_paciente"
              value={form.paciente_id ? String(form.paciente_id) : ""}
              onChange={(v) => update("paciente_id", v ? Number(v) : 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="trn_fecha">
                Fecha y hora <span className="text-destructive">*</span>
              </Label>
              <Input
                id="trn_fecha"
                type="datetime-local"
                value={form.fecha_hora}
                onChange={(e) => update("fecha_hora", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trn_estado">
                Estado <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.estado}
                onValueChange={(v) => update("estado", v as TurnoEstado)}
              >
                <SelectTrigger id="trn_estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TURNO_ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="trn_esp">
                Especialidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="trn_esp"
                value={form.especialidad}
                onChange={(e) => update("especialidad", e.target.value)}
                placeholder="Ej: Cardiólogo"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trn_prof">
                Profesional <span className="text-destructive">*</span>
              </Label>
              <Input
                id="trn_prof"
                value={form.profesional}
                onChange={(e) => update("profesional", e.target.value)}
                placeholder="Nombre del profesional"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trn_lugar">Lugar</Label>
            <Input
              id="trn_lugar"
              value={form.lugar ?? ""}
              onChange={(e) => update("lugar", e.target.value)}
              placeholder="Dirección, consultorio…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trn_obs">Observaciones</Label>
            <Textarea
              id="trn_obs"
              rows={2}
              value={form.observaciones ?? ""}
              onChange={(e) => update("observaciones", e.target.value)}
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
              {submitting ? "Guardando…" : isEdicion ? "Guardar" : "Crear turno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
