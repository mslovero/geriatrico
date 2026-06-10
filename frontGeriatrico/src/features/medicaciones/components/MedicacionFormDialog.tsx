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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import { useStockOptions } from "../hooks/useStockOptions";
import {
  ORIGENES_PAGO,
  TIPOS_MEDICACION,
  type Medicacion,
  type MedicacionFormValues,
  type MedicacionTipo,
  type OrigenPago,
} from "../types";

interface MedicacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicacion?: Medicacion | null;
  onSubmit: (values: MedicacionFormValues) => Promise<void>;
}

const emptyForm: MedicacionFormValues = {
  nombre: "",
  dosis: "",
  frecuencia: "",
  tipo: "diaria",
  origen_pago: "geriatrico",
  paciente_id: 0,
  stock_item_id: null,
  cantidad_mensual: null,
  fecha_inicio: null,
  fecha_fin: null,
  observaciones: "",
};

export function MedicacionFormDialog({
  open,
  onOpenChange,
  medicacion,
  onSubmit,
}: MedicacionFormDialogProps) {
  const [form, setForm] = useState<MedicacionFormValues>(emptyForm);
  const [modoManual, setModoManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (medicacion) {
      setForm({
        id: medicacion.id,
        nombre: medicacion.nombre,
        dosis: medicacion.dosis ?? "",
        frecuencia: medicacion.frecuencia ?? "",
        tipo: medicacion.tipo,
        cantidad_mensual: medicacion.cantidad_mensual ?? null,
        fecha_inicio: medicacion.fecha_inicio ?? null,
        fecha_fin: medicacion.fecha_fin ?? null,
        origen_pago: medicacion.origen_pago,
        observaciones: medicacion.observaciones ?? "",
        paciente_id: medicacion.paciente_id,
        stock_item_id: medicacion.stock_item_id ?? null,
      });
      setModoManual(!medicacion.stock_item_id);
    } else {
      setForm(emptyForm);
      setModoManual(false);
    }
    setError(null);
  }, [open, medicacion]);

  const { options: stockOptions, loading: loadingStock } = useStockOptions({
    pacienteId: form.paciente_id || null,
    origen: form.origen_pago,
  });

  const isEdicion = Boolean(form.id);

  const updateField = <K extends keyof MedicacionFormValues>(
    field: K,
    value: MedicacionFormValues[K]
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePacienteChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      paciente_id: value ? Number(value) : 0,
      stock_item_id: null,
    }));
  };

  const handleOrigenChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      origen_pago: value as OrigenPago,
      stock_item_id: null,
    }));
  };

  const handleStockChange = (value: string) => {
    if (!value) {
      setForm((prev) => ({ ...prev, stock_item_id: null }));
      return;
    }
    const selected = stockOptions.find((s) => s.id.toString() === value);
    setForm((prev) => ({
      ...prev,
      stock_item_id: Number(value),
      nombre: selected?.nombre ?? prev.nombre,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        paciente_id: Number(form.paciente_id),
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        cantidad_mensual: form.cantidad_mensual ? Number(form.cantidad_mensual) : null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar la medicación.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const showStockSelector = form.origen_pago !== "obra_social" && form.paciente_id > 0;
  const hintActual = ORIGENES_PAGO.find((o) => o.value === form.origen_pago)?.hint ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdicion ? "Editar medicación" : "Nueva medicación"}
          </DialogTitle>
          <DialogDescription>
            Asigná el paciente, origen del pago y vinculá con el stock cuando corresponda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="med_paciente">
                Paciente <span className="text-destructive">*</span>
              </Label>
              <PatientCombobox
                id="med_paciente"
                value={form.paciente_id ? String(form.paciente_id) : ""}
                onChange={handlePacienteChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="med_origen">
                  Origen de pago <span className="text-destructive">*</span>
                </Label>
                <Select value={form.origen_pago} onValueChange={handleOrigenChange}>
                  <SelectTrigger id="med_origen">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGENES_PAGO.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{hintActual}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="med_tipo">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => updateField("tipo", v as MedicacionTipo)}
                >
                  <SelectTrigger id="med_tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MEDICACION.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            {showStockSelector && !modoManual ? (
              <div className="space-y-1.5">
                <Label htmlFor="med_stock">
                  Stock disponible <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.stock_item_id ? String(form.stock_item_id) : ""}
                  onValueChange={handleStockChange}
                  disabled={loadingStock || stockOptions.length === 0}
                >
                  <SelectTrigger id="med_stock">
                    <SelectValue
                      placeholder={
                        loadingStock
                          ? "Buscando stock…"
                          : stockOptions.length === 0
                          ? "Sin stock disponible"
                          : "Seleccionar del stock"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {stockOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.nombre} · stock {s.stock_actual ?? 0} {s.unidad_medida ?? ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    setModoManual(true);
                    updateField("stock_item_id", null);
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ¿No está en la lista? Ingresar manualmente
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="med_nombre">
                  Nombre del medicamento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="med_nombre"
                  value={form.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  required
                  placeholder="Ej: Ibuprofeno 600mg"
                />
                {showStockSelector && (
                  <button
                    type="button"
                    onClick={() => {
                      setModoManual(false);
                      updateField("nombre", "");
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    ← Volver a selección de stock
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="med_dosis">Dosis</Label>
                <Input
                  id="med_dosis"
                  value={form.dosis ?? ""}
                  onChange={(e) => updateField("dosis", e.target.value)}
                  placeholder="Ej: 600mg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med_frecuencia">Frecuencia</Label>
                <Input
                  id="med_frecuencia"
                  value={form.frecuencia ?? ""}
                  onChange={(e) => updateField("frecuencia", e.target.value)}
                  placeholder="Ej: c/8hs"
                />
              </div>
            </div>

            {form.tipo === "diaria" && (
              <div className="space-y-1.5">
                <Label htmlFor="med_cant">Cantidad mensual estimada</Label>
                <Input
                  id="med_cant"
                  type="number"
                  min={0}
                  value={form.cantidad_mensual ?? ""}
                  onChange={(e) =>
                    updateField(
                      "cantidad_mensual",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="Ej: 30"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="med_inicio">Fecha de inicio</Label>
                <Input
                  id="med_inicio"
                  type="date"
                  value={form.fecha_inicio ?? ""}
                  onChange={(e) => updateField("fecha_inicio", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med_fin">Fecha de fin</Label>
                <Input
                  id="med_fin"
                  type="date"
                  value={form.fecha_fin ?? ""}
                  onChange={(e) => updateField("fecha_fin", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="med_obs">Observaciones</Label>
              <Textarea
                id="med_obs"
                value={form.observaciones ?? ""}
                onChange={(e) => updateField("observaciones", e.target.value)}
                placeholder="Notas adicionales del tratamiento…"
                rows={3}
              />
            </div>
          </section>

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
              {submitting ? "Guardando…" : isEdicion ? "Guardar cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
