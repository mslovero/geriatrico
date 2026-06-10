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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import {
  PRESENTACIONES,
  PROPIEDADES,
  TIPOS_STOCK,
  UNIDADES_MEDIDA,
  type Proveedor,
  type StockItem,
  type StockItemFormValues,
  type StockPropiedad,
  type StockTipo,
} from "../types";

interface StockItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: StockItem | null;
  proveedores: Proveedor[];
  onSubmit: (values: StockItemFormValues) => Promise<void>;
}

const emptyForm: StockItemFormValues = {
  nombre: "",
  tipo: "medicamento",
  unidad_medida: "pastilla",
  unidad_presentacion: "",
  factor_conversion: null,
  descripcion_presentacion: "",
  stock_actual: 0,
  stock_minimo: 0,
  stock_maximo: null,
  precio_unitario: null,
  proveedor_id: null,
  observaciones: "",
  codigo: "",
  descripcion: "",
  propiedad: "geriatrico",
  paciente_propietario_id: null,
  fecha_vencimiento_inicial: null,
};

export function StockItemFormDialog({
  open,
  onOpenChange,
  item,
  proveedores,
  onSubmit,
}: StockItemFormDialogProps) {
  const [form, setForm] = useState<StockItemFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        id: item.id,
        nombre: item.nombre,
        tipo: item.tipo,
        codigo: item.codigo ?? "",
        descripcion: item.descripcion ?? "",
        unidad_medida: item.unidad_medida,
        unidad_presentacion: item.unidad_presentacion ?? "",
        factor_conversion: item.factor_conversion ?? null,
        descripcion_presentacion: item.descripcion_presentacion ?? "",
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        stock_maximo: item.stock_maximo ?? null,
        precio_unitario: item.precio_unitario ?? null,
        proveedor_id: item.proveedor_id ?? null,
        observaciones: item.observaciones ?? "",
        propiedad: item.propiedad,
        paciente_propietario_id: item.paciente_propietario_id ?? null,
        fecha_vencimiento_inicial: null,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, item]);

  const isEdicion = Boolean(form.id);

  const update = <K extends keyof StockItemFormValues>(
    field: K,
    value: StockItemFormValues[K]
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const stockMinimoNum = Number(form.stock_minimo) || 0;
  const stockMaximoNum = form.stock_maximo ?? 0;
  const stockMaximoInvalid =
    form.stock_maximo != null && stockMaximoNum > 0 && stockMaximoNum < stockMinimoNum;

  const factorInvalid =
    form.unidad_presentacion && (form.factor_conversion ?? 0) < 2;

  const showStockInicial = !isEdicion;
  const showFechaInicial = !isEdicion && (form.stock_actual ?? 0) > 0;

  const proveedoresFiltrados = useMemo(() => {
    return form.propiedad === "paciente" ? [] : proveedores;
  }, [proveedores, form.propiedad]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stockMaximoInvalid || factorInvalid) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload: StockItemFormValues = {
        ...form,
        stock_actual: Number(form.stock_actual ?? 0),
        stock_minimo: Number(form.stock_minimo ?? 0),
        stock_maximo: form.stock_maximo ? Number(form.stock_maximo) : null,
        factor_conversion: form.factor_conversion
          ? Number(form.factor_conversion)
          : null,
        precio_unitario: form.precio_unitario ? Number(form.precio_unitario) : null,
        proveedor_id: form.proveedor_id ? Number(form.proveedor_id) : null,
        paciente_propietario_id:
          form.propiedad === "paciente" && form.paciente_propietario_id
            ? Number(form.paciente_propietario_id)
            : null,
      };
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar el item de stock.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdicion ? "Editar item de stock" : "Nuevo item"}</DialogTitle>
          <DialogDescription>
            Configurá la unidad base, presentaciones de compra y reglas de propiedad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="stk_nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stk_nombre"
                value={form.nombre}
                onChange={(e) => update("nombre", e.target.value)}
                required
                placeholder="Ej: Ibuprofeno 600mg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stk_tipo">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => update("tipo", v as StockTipo)}
              >
                <SelectTrigger id="stk_tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_STOCK.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stk_propiedad">
                Propietario <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.propiedad}
                onValueChange={(v) => update("propiedad", v as StockPropiedad)}
              >
                <SelectTrigger id="stk_propiedad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPIEDADES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.propiedad === "paciente" && (
              <div className="space-y-1.5">
                <Label htmlFor="stk_paciente">
                  Paciente propietario <span className="text-destructive">*</span>
                </Label>
                <PatientCombobox
                  id="stk_paciente"
                  value={
                    form.paciente_propietario_id ? String(form.paciente_propietario_id) : ""
                  }
                  onChange={(value) =>
                    update("paciente_propietario_id", value ? Number(value) : null)
                  }
                />
              </div>
            )}
          </section>

          <Separator />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stk_unidad">
                Unidad base <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.unidad_medida}
                onValueChange={(v) => update("unidad_medida", v)}
              >
                <SelectTrigger id="stk_unidad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_MEDIDA.map((g) => (
                    <SelectGroup key={g.group}>
                      <SelectLabel>{g.group}</SelectLabel>
                      {g.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stk_present">Presentación de compra</Label>
              <Select
                value={form.unidad_presentacion ?? ""}
                onValueChange={(v) => update("unidad_presentacion", v === "ninguna" ? "" : v)}
              >
                <SelectTrigger id="stk_present">
                  <SelectValue placeholder="Sin presentación especial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin presentación</SelectItem>
                  {PRESENTACIONES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {form.unidad_presentacion && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="stk_factor">
                  Factor de conversión <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stk_factor"
                  type="number"
                  min={2}
                  value={form.factor_conversion ?? ""}
                  onChange={(e) =>
                    update(
                      "factor_conversion",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="Ej: 30"
                />
                <p className="text-xs text-muted-foreground">
                  1 {form.unidad_presentacion} = <strong>X</strong> {form.unidad_medida}
                </p>
                {factorInvalid && (
                  <p className="text-xs text-destructive">
                    El factor debe ser ≥ 2.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stk_desc_present">Descripción</Label>
                <Input
                  id="stk_desc_present"
                  value={form.descripcion_presentacion ?? ""}
                  onChange={(e) => update("descripcion_presentacion", e.target.value)}
                  placeholder="Ej: Blister de 30 comprimidos"
                />
              </div>
            </section>
          )}

          <Separator />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {showStockInicial ? (
              <div className="space-y-1.5">
                <Label htmlFor="stk_inicial">Stock inicial</Label>
                <Input
                  id="stk_inicial"
                  type="number"
                  min={0}
                  value={form.stock_actual ?? 0}
                  onChange={(e) => update("stock_actual", Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Si ingresás stock, se crea un lote automático.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="stk_actual">Stock actual</Label>
                <Input
                  id="stk_actual"
                  type="text"
                  value={`${form.stock_actual ?? 0} ${form.unidad_medida ?? ""}`}
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Se calcula sumando lotes activos.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="stk_min">
                Stock mínimo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stk_min"
                type="number"
                min={0}
                value={form.stock_minimo ?? 0}
                onChange={(e) => update("stock_minimo", Number(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stk_max">Stock máximo</Label>
              <Input
                id="stk_max"
                type="number"
                min={stockMinimoNum}
                value={form.stock_maximo ?? ""}
                onChange={(e) =>
                  update("stock_maximo", e.target.value ? Number(e.target.value) : null)
                }
              />
              {stockMaximoInvalid && (
                <p className="text-xs text-destructive">
                  Debe ser mayor o igual al mínimo ({stockMinimoNum}).
                </p>
              )}
            </div>
          </section>

          {showFechaInicial && (
            <div className="space-y-1.5">
              <Label htmlFor="stk_fecha">Vencimiento del lote inicial</Label>
              <Input
                id="stk_fecha"
                type="date"
                value={form.fecha_vencimiento_inicial ?? ""}
                onChange={(e) =>
                  update("fecha_vencimiento_inicial", e.target.value || null)
                }
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Si no se completa, se asigna a 2 años.
              </p>
            </div>
          )}

          {form.propiedad === "geriatrico" && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="stk_prov">Proveedor habitual</Label>
                <Select
                  value={form.proveedor_id ? String(form.proveedor_id) : "none"}
                  onValueChange={(v) =>
                    update("proveedor_id", v === "none" ? null : Number(v))
                  }
                >
                  <SelectTrigger id="stk_prov">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin proveedor</SelectItem>
                    {proveedoresFiltrados.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stk_precio">Precio unitario referencia</Label>
                <Input
                  id="stk_precio"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.precio_unitario ?? ""}
                  onChange={(e) =>
                    update("precio_unitario", e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="0.00"
                />
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stk_codigo">Código interno</Label>
              <Input
                id="stk_codigo"
                value={form.codigo ?? ""}
                onChange={(e) => update("codigo", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stk_descripcion">Descripción</Label>
              <Input
                id="stk_descripcion"
                value={form.descripcion ?? ""}
                onChange={(e) => update("descripcion", e.target.value)}
                placeholder="Detalles del item"
              />
            </div>
          </section>

          <div className="space-y-1.5">
            <Label htmlFor="stk_obs">Observaciones</Label>
            <Textarea
              id="stk_obs"
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
            <Button
              type="submit"
              disabled={
                submitting ||
                stockMaximoInvalid ||
                Boolean(factorInvalid) ||
                (form.propiedad === "paciente" && !form.paciente_propietario_id)
              }
            >
              {submitting ? "Guardando…" : isEdicion ? "Guardar cambios" : "Crear item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
