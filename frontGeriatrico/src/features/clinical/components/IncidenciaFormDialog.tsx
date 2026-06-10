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
  SEVERIDADES,
  TIPOS_INCIDENCIA,
  type Incidencia,
  type IncidenciaFormValues,
  type IncidenciaSeveridad,
} from "../types";

interface IncidenciaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Incidencia | null;
  personal: Array<{ id: number; name: string; role?: string }>;
  onSubmit: (values: IncidenciaFormValues) => Promise<void>;
}

function toLocalDatetime(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 16);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 16);
}

const empty: IncidenciaFormValues = {
  paciente_id: 0,
  fecha_hora: "",
  tipo: "",
  severidad: "leve",
  descripcion: "",
  acciones_tomadas: "",
  user_id: null,
};

export function IncidenciaFormDialog({
  open,
  onOpenChange,
  registro,
  personal,
  onSubmit,
}: IncidenciaFormDialogProps) {
  const [form, setForm] = useState<IncidenciaFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (registro) {
      setForm({
        id: registro.id,
        paciente_id: registro.paciente_id,
        fecha_hora: toLocalDatetime(registro.fecha_hora),
        tipo: registro.tipo,
        severidad: registro.severidad,
        descripcion: registro.descripcion,
        acciones_tomadas: registro.acciones_tomadas ?? "",
        user_id: registro.user_id ?? null,
      });
    } else {
      setForm({ ...empty, fecha_hora: toLocalDatetime() });
    }
    setError(null);
  }, [open, registro]);

  const update = <K extends keyof IncidenciaFormValues>(
    field: K,
    value: IncidenciaFormValues[K]
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
        user_id: form.user_id ? Number(form.user_id) : null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar la incidencia.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdicion ? "Editar incidencia" : "Reportar nueva incidencia"}
          </DialogTitle>
          <DialogDescription>
            Documentá lo ocurrido para la trazabilidad clínica y administrativa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inc_paciente">
                Paciente <span className="text-destructive">*</span>
              </Label>
              <PatientCombobox
                id="inc_paciente"
                value={form.paciente_id ? String(form.paciente_id) : ""}
                onChange={(v) => update("paciente_id", v ? Number(v) : 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inc_fecha">
                Fecha y hora <span className="text-destructive">*</span>
              </Label>
              <Input
                id="inc_fecha"
                type="datetime-local"
                value={form.fecha_hora}
                onChange={(e) => update("fecha_hora", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inc_tipo">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select value={form.tipo} onValueChange={(v) => update("tipo", v)}>
                <SelectTrigger id="inc_tipo">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_INCIDENCIA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inc_sev">
                Severidad <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.severidad}
                onValueChange={(v) => update("severidad", v as IncidenciaSeveridad)}
              >
                <SelectTrigger id="inc_sev">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERIDADES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label} · {s.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc_user">Reportado por</Label>
            <Select
              value={form.user_id ? String(form.user_id) : "auto"}
              onValueChange={(v) => update("user_id", v === "auto" ? null : Number(v))}
            >
              <SelectTrigger id="inc_user">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Usuario actual (automático)</SelectItem>
                {personal.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name} {u.role ? `· ${u.role}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc_desc">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="inc_desc"
              rows={3}
              value={form.descripcion}
              onChange={(e) => update("descripcion", e.target.value)}
              placeholder="Describí en detalle qué ocurrió…"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc_acciones">Acciones tomadas</Label>
            <Textarea
              id="inc_acciones"
              rows={2}
              value={form.acciones_tomadas ?? ""}
              onChange={(e) => update("acciones_tomadas", e.target.value)}
              placeholder="¿Qué se hizo al respecto?"
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
            <Button
              type="submit"
              disabled={
                submitting ||
                !form.paciente_id ||
                !form.tipo ||
                !form.descripcion
              }
            >
              {submitting ? "Guardando…" : isEdicion ? "Guardar" : "Reportar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
