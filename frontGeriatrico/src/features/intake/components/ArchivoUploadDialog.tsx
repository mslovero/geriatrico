import { useEffect, useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
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
import { ARCHIVO_TIPOS, type ArchivoFormValues } from "../types";

interface ArchivoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ArchivoFormValues) => Promise<void>;
}

const empty: ArchivoFormValues = {
  paciente_id: null,
  tipo: "estudio",
  descripcion: "",
  archivo: null,
};

export function ArchivoUploadDialog({
  open,
  onOpenChange,
  onSubmit,
}: ArchivoUploadDialogProps) {
  const [form, setForm] = useState<ArchivoFormValues>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({ ...empty });
    setError(null);
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.archivo) {
      setError("Seleccioná un archivo para subir.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo subir el archivo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Subir archivo</DialogTitle>
          <DialogDescription>
            Adjuntá estudios, recetas o documentos del paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="arch_paciente">Paciente</Label>
            <PatientCombobox
              id="arch_paciente"
              value={form.paciente_id ? String(form.paciente_id) : ""}
              onChange={(v) =>
                setForm({ ...form, paciente_id: v ? Number(v) : null })
              }
              placeholder="Opcional · archivo general si no se asigna"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="arch_tipo">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm({ ...form, tipo: v })}
              >
                <SelectTrigger id="arch_tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARCHIVO_TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="arch_file">
                Archivo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="arch_file"
                type="file"
                onChange={(e) =>
                  setForm({ ...form, archivo: e.target.files?.[0] ?? null })
                }
                required
                className="file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium"
              />
              {form.archivo && (
                <p className="text-xs text-muted-foreground">
                  {form.archivo.name} · {(form.archivo.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="arch_desc">Descripción</Label>
            <Textarea
              id="arch_desc"
              rows={2}
              value={form.descripcion ?? ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Detalles del archivo…"
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
            <Button type="submit" disabled={submitting || !form.archivo}>
              <Upload className="h-4 w-4" />
              {submitting ? "Subiendo…" : "Subir archivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
