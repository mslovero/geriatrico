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
import type { SignoVital, SignoVitalFormValues } from "../types";

interface SignoVitalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: SignoVital | null;
  personal: Array<{ id: number; name: string; role?: string }>;
  onSubmit: (values: SignoVitalFormValues) => Promise<void>;
}

const empty: SignoVitalFormValues = {
  paciente_id: 0,
  fecha: "",
  presion_arterial: "",
  temperatura: null,
  frecuencia_cardiaca: null,
  saturacion_oxigeno: null,
  glucosa: null,
  observaciones: "",
  registrado_por: "",
};

function toLocalDatetime(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 16);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 16);
}

export function SignoVitalFormDialog({
  open,
  onOpenChange,
  registro,
  personal,
  onSubmit,
}: SignoVitalFormDialogProps) {
  const [form, setForm] = useState<SignoVitalFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (registro) {
      setForm({
        id: registro.id,
        paciente_id: registro.paciente_id,
        fecha: toLocalDatetime(registro.fecha),
        presion_arterial: registro.presion_arterial ?? "",
        temperatura: registro.temperatura ?? null,
        frecuencia_cardiaca: registro.frecuencia_cardiaca ?? null,
        saturacion_oxigeno: registro.saturacion_oxigeno ?? null,
        glucosa: registro.glucosa ?? null,
        observaciones: registro.observaciones ?? "",
        registrado_por: registro.registrado_por ?? "",
      });
    } else {
      setForm({ ...empty, fecha: toLocalDatetime() });
    }
    setError(null);
  }, [open, registro]);

  const update = <K extends keyof SignoVitalFormValues>(
    field: K,
    value: SignoVitalFormValues[K]
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const isEdicion = Boolean(form.id);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        paciente_id: Number(form.paciente_id),
        temperatura: form.temperatura ? Number(form.temperatura) : null,
        frecuencia_cardiaca: form.frecuencia_cardiaca
          ? Number(form.frecuencia_cardiaca)
          : null,
        saturacion_oxigeno: form.saturacion_oxigeno
          ? Number(form.saturacion_oxigeno)
          : null,
        glucosa: form.glucosa ? Number(form.glucosa) : null,
      });
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar registro" : "Nuevo registro vital"}</DialogTitle>
          <DialogDescription>
            Cargá las mediciones tal como fueron tomadas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sv_paciente">
                Paciente <span className="text-destructive">*</span>
              </Label>
              <PatientCombobox
                id="sv_paciente"
                value={form.paciente_id ? String(form.paciente_id) : ""}
                onChange={(v) => update("paciente_id", v ? Number(v) : 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv_fecha">
                Fecha y hora <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sv_fecha"
                type="datetime-local"
                value={form.fecha}
                onChange={(e) => update("fecha", e.target.value)}
                max={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sv_responsable">
              Registrado por <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.registrado_por}
              onValueChange={(v) => update("registrado_por", v)}
            >
              <SelectTrigger id="sv_responsable">
                <SelectValue placeholder="Seleccionar responsable" />
              </SelectTrigger>
              <SelectContent>
                {personal.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name} {p.role ? `· ${p.role}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sv_presion">Presión arterial</Label>
              <Input
                id="sv_presion"
                value={form.presion_arterial ?? ""}
                onChange={(e) => update("presion_arterial", e.target.value)}
                placeholder="Ej: 120/80"
                pattern="[0-9]{2,3}/[0-9]{2,3}"
                title="Formato 120/80"
              />
              <p className="text-xs text-muted-foreground">Normal: 90-140 / 60-90</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv_temp">Temperatura (°C)</Label>
              <Input
                id="sv_temp"
                type="number"
                step="0.1"
                min={30}
                max={45}
                value={form.temperatura ?? ""}
                onChange={(e) =>
                  update("temperatura", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="36.5"
              />
              <p className="text-xs text-muted-foreground">Normal: 36 - 37.5</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv_pulso">Pulso (bpm)</Label>
              <Input
                id="sv_pulso"
                type="number"
                min={30}
                max={220}
                value={form.frecuencia_cardiaca ?? ""}
                onChange={(e) =>
                  update("frecuencia_cardiaca", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="80"
              />
              <p className="text-xs text-muted-foreground">Normal: 60 - 100</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sv_sato2">Saturación O₂ (%)</Label>
              <Input
                id="sv_sato2"
                type="number"
                min={70}
                max={100}
                value={form.saturacion_oxigeno ?? ""}
                onChange={(e) =>
                  update("saturacion_oxigeno", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="98"
              />
              <p className="text-xs text-muted-foreground">Normal: 94 - 100</p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sv_glucosa">Glucosa (mg/dL)</Label>
              <Input
                id="sv_glucosa"
                type="number"
                min={30}
                max={500}
                value={form.glucosa ?? ""}
                onChange={(e) =>
                  update("glucosa", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">Normal: 70 - 140</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sv_obs">Observaciones</Label>
            <Textarea
              id="sv_obs"
              rows={2}
              value={form.observaciones ?? ""}
              onChange={(e) => update("observaciones", e.target.value)}
              placeholder="Notas sobre el estado del paciente…"
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
