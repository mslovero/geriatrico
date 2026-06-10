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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import {
  DIETA_CONSISTENCIAS,
  DIETA_TIPOS,
  type Dieta,
  type DietaConsistencia,
  type DietaFormValues,
  type DietaTipo,
} from "../types";

interface DietaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: Dieta | null;
  onSubmit: (values: DietaFormValues) => Promise<void>;
}

const empty: DietaFormValues = {
  paciente_id: 0,
  tipo: "General",
  consistencia: "Sólida",
  alergias: "",
  observaciones: "",
};

export function DietaFormDialog({
  open,
  onOpenChange,
  registro,
  onSubmit,
}: DietaFormDialogProps) {
  const [form, setForm] = useState<DietaFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (registro) {
      setForm({
        id: registro.id,
        paciente_id: registro.paciente_id,
        tipo: registro.tipo,
        consistencia: registro.consistencia,
        alergias: registro.alergias ?? "",
        observaciones: registro.observaciones ?? "",
      });
    } else {
      setForm({ ...empty });
    }
    setError(null);
  }, [open, registro]);

  const update = <K extends keyof DietaFormValues>(
    field: K,
    value: DietaFormValues[K]
  ) => setForm((prev) => ({ ...prev, [field]: value }));

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
        "No se pudo guardar la dieta.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar dieta" : "Nueva dieta"}</DialogTitle>
          <DialogDescription>
            Definí tipo, consistencia y alergias del residente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="diet_paciente">
              Paciente <span className="text-destructive">*</span>
            </Label>
            <PatientCombobox
              id="diet_paciente"
              value={form.paciente_id ? String(form.paciente_id) : ""}
              onChange={(v) => update("paciente_id", v ? Number(v) : 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="diet_tipo">
                Tipo de dieta <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => update("tipo", v as DietaTipo)}
              >
                <SelectTrigger id="diet_tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIETA_TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diet_cons">
                Consistencia <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.consistencia}
                onValueChange={(v) => update("consistencia", v as DietaConsistencia)}
              >
                <SelectTrigger id="diet_cons">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIETA_CONSISTENCIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diet_alergias">Alergias alimentarias</Label>
            <Textarea
              id="diet_alergias"
              rows={2}
              value={form.alergias ?? ""}
              onChange={(e) => update("alergias", e.target.value)}
              placeholder="Listar alergias alimentarias…"
            />
            <Alert variant="warning">
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>
                Información crítica para cocina. Verificá con familia si tenés dudas.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diet_obs">Observaciones</Label>
            <Textarea
              id="diet_obs"
              rows={3}
              value={form.observaciones ?? ""}
              onChange={(e) => update("observaciones", e.target.value)}
              placeholder="Gustos, rechazos, preferencias…"
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
