import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { Lote, LoteFormValues, StockItem } from "../types";

interface LoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lote?: Lote | null;
  stockItems: StockItem[];
  onSubmit: (values: LoteFormValues) => Promise<void>;
}

const emptyForm: LoteFormValues = {
  stock_item_id: 0,
  numero_lote: "",
  fecha_vencimiento: "",
  cantidad_inicial: 0,
  precio_compra: null,
  observaciones: "",
};

export function LoteFormDialog({
  open,
  onOpenChange,
  lote,
  stockItems,
  onSubmit,
}: LoteFormDialogProps) {
  const [form, setForm] = useState<LoteFormValues>(emptyForm);
  const [tipoIngreso, setTipoIngreso] = useState<"base" | "presentacion">("base");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (lote) {
      setForm({
        id: lote.id,
        stock_item_id: lote.stock_item_id,
        numero_lote: lote.numero_lote,
        fecha_vencimiento: lote.fecha_vencimiento ?? "",
        cantidad_inicial: lote.cantidad_inicial,
        precio_compra: lote.precio_compra ?? null,
        observaciones: lote.observaciones ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setTipoIngreso("base");
    setError(null);
  }, [open, lote]);

  const selectedItem = useMemo(
    () => stockItems.find((i) => i.id === form.stock_item_id) ?? null,
    [stockItems, form.stock_item_id]
  );

  const tieneConversion =
    selectedItem?.unidad_presentacion &&
    selectedItem?.factor_conversion &&
    selectedItem.factor_conversion > 1;

  const cantidadFinal = useMemo(() => {
    if (tipoIngreso === "presentacion" && tieneConversion) {
      return Number(form.cantidad_inicial) * (selectedItem?.factor_conversion ?? 1);
    }
    return Number(form.cantidad_inicial);
  }, [form.cantidad_inicial, tipoIngreso, tieneConversion, selectedItem]);

  const isEdicion = Boolean(form.id);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ ...form, cantidad_inicial: cantidadFinal });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar el lote.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar lote" : "Nuevo lote"}</DialogTitle>
          <DialogDescription>
            Registrá la entrada de un lote con su número, vencimiento y cantidad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="lote_item">
              Medicamento / Insumo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.stock_item_id ? String(form.stock_item_id) : ""}
              onValueChange={(v) => setForm({ ...form, stock_item_id: Number(v) })}
            >
              <SelectTrigger id="lote_item">
                <SelectValue placeholder="Seleccionar item" />
              </SelectTrigger>
              <SelectContent>
                {stockItems.map((i) => (
                  <SelectItem key={i.id} value={i.id.toString()}>
                    {i.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Unidad base: <strong>{selectedItem.unidad_medida}</strong>
                  {tieneConversion && (
                    <>
                      {" · 1 "}
                      {selectedItem.unidad_presentacion} ={" "}
                      {selectedItem.factor_conversion} {selectedItem.unidad_medida}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lote_nro">
                Número de lote <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lote_nro"
                value={form.numero_lote}
                onChange={(e) => setForm({ ...form, numero_lote: e.target.value })}
                placeholder="Ej: LOTE-2026-001"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lote_venc">
                Vencimiento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lote_venc"
                type="date"
                value={form.fecha_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                required
              />
            </div>
          </div>

          {tieneConversion && (
            <div className="space-y-1.5">
              <Label>¿En qué unidad ingresás la cantidad?</Label>
              <div className="inline-flex w-full overflow-hidden rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setTipoIngreso("base")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    tipoIngreso === "base"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Base ({selectedItem?.unidad_medida})
                </button>
                <button
                  type="button"
                  onClick={() => setTipoIngreso("presentacion")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    tipoIngreso === "presentacion"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Presentación ({selectedItem?.unidad_presentacion})
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lote_cant">
                Cantidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lote_cant"
                type="number"
                min={1}
                value={form.cantidad_inicial || ""}
                onChange={(e) =>
                  setForm({ ...form, cantidad_inicial: Number(e.target.value) || 0 })
                }
                required
              />
              {tipoIngreso === "presentacion" && tieneConversion && (
                <p className="text-xs text-muted-foreground">
                  = {cantidadFinal} {selectedItem?.unidad_medida}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lote_precio">Precio de compra</Label>
              <Input
                id="lote_precio"
                type="number"
                step="0.01"
                min={0}
                value={form.precio_compra ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    precio_compra: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lote_obs">Observaciones</Label>
            <Textarea
              id="lote_obs"
              rows={2}
              value={form.observaciones ?? ""}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
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
            <Button type="submit" disabled={submitting || !form.stock_item_id}>
              {submitting ? "Guardando…" : isEdicion ? "Guardar" : "Crear lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
