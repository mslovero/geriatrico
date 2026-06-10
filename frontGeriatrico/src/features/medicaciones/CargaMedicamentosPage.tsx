import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyStateBlock } from "@/components/shared/EmptyStateBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientCombobox } from "@/components/shared/PatientCombobox";
import { showConfirm, showSuccess, handleApiError } from "@/utils/alerts";
import { createMedicacionesBatch } from "./api";
import { useStockOptions } from "./hooks/useStockOptions";
import { OrigenPagoBadge } from "./components/OrigenPagoBadge";
import { TipoMedicacionBadge } from "./components/TipoMedicacionBadge";
import {
  ORIGENES_PAGO,
  TIPOS_MEDICACION,
  type BatchMedicacionItem,
  type MedicacionTipo,
  type OrigenPago,
} from "./types";

interface DraftItem extends BatchMedicacionItem {
  _id: number;
}

const emptyDraft: BatchMedicacionItem = {
  nombre: "",
  dosis: "",
  frecuencia: "",
  tipo: "diaria",
  origen_pago: "geriatrico",
  cantidad_mensual: null,
  fecha_inicio: null,
  fecha_fin: null,
  observaciones: "",
  stock_item_id: null,
};

export default function CargaMedicamentosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get("paciente_id") ?? "";

  const [pacienteId, setPacienteId] = useState<string>(initialPatientId);
  const [draft, setDraft] = useState<BatchMedicacionItem>(emptyDraft);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [saving, setSaving] = useState(false);

  const { options: stockOptions, loading: loadingStock } = useStockOptions({
    pacienteId: pacienteId ? Number(pacienteId) : null,
    origen: draft.origen_pago,
  });

  useEffect(() => {
    setDraft((prev) => ({ ...prev, stock_item_id: null }));
  }, [pacienteId, draft.origen_pago]);

  const updateDraft = <K extends keyof BatchMedicacionItem>(
    field: K,
    value: BatchMedicacionItem[K]
  ) => setDraft((prev) => ({ ...prev, [field]: value }));

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.nombre.trim()) return;
    setItems((prev) => [...prev, { ...draft, _id: Date.now() }]);
    setDraft({ ...emptyDraft, origen_pago: draft.origen_pago });
  };

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  const handleSaveAll = async () => {
    if (!pacienteId) return;
    if (items.length === 0) return;

    const confirm = await showConfirm(
      `¿Querés guardar ${items.length} medicamentos para este paciente?`
    );
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const payload: BatchMedicacionItem[] = items.map(({ _id, ...rest }) => rest);
      await createMedicacionesBatch(Number(pacienteId), payload);
      await showSuccess("Medicamentos guardados correctamente");
      navigate("/medicamentos");
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const origenHint =
    ORIGENES_PAGO.find((o) => o.value === draft.origen_pago)?.hint ?? "";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={<Badge variant="muted">Carga masiva</Badge>}
        title="Carga masiva de medicamentos"
        description="Agregá múltiples medicamentos a un paciente antes de guardar."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Volver
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Datos del medicamento</CardTitle>
            <CardDescription>
              Seleccioná paciente, origen y vinculá con el stock cuando corresponda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="carga_paciente">
                Paciente <span className="text-destructive">*</span>
              </Label>
              <PatientCombobox
                id="carga_paciente"
                value={pacienteId}
                onChange={setPacienteId}
              />
            </div>

            <Separator />

            <form onSubmit={handleAdd} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="carga_nombre">
                  Nombre del medicamento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="carga_nombre"
                  value={draft.nombre}
                  onChange={(e) => updateDraft("nombre", e.target.value)}
                  required
                  placeholder="Ej: Ibuprofeno 600mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga_dosis">Dosis</Label>
                  <Input
                    id="carga_dosis"
                    value={draft.dosis ?? ""}
                    onChange={(e) => updateDraft("dosis", e.target.value)}
                    placeholder="Ej: 600mg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga_frec">Frecuencia</Label>
                  <Input
                    id="carga_frec"
                    value={draft.frecuencia ?? ""}
                    onChange={(e) => updateDraft("frecuencia", e.target.value)}
                    placeholder="Ej: c/8hs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga_tipo">Tipo</Label>
                  <Select
                    value={draft.tipo}
                    onValueChange={(v) => updateDraft("tipo", v as MedicacionTipo)}
                  >
                    <SelectTrigger id="carga_tipo">
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
                <div className="space-y-1.5">
                  <Label htmlFor="carga_origen">
                    Origen <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={draft.origen_pago}
                    onValueChange={(v) => updateDraft("origen_pago", v as OrigenPago)}
                  >
                    <SelectTrigger id="carga_origen">
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
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{origenHint}</p>

              {draft.origen_pago !== "obra_social" && pacienteId && (
                <div className="space-y-1.5">
                  <Label htmlFor="carga_stock">Vincular con stock (opcional)</Label>
                  <Select
                    value={draft.stock_item_id ? String(draft.stock_item_id) : "none"}
                    onValueChange={(v) =>
                      updateDraft("stock_item_id", v === "none" ? null : Number(v))
                    }
                    disabled={loadingStock || stockOptions.length === 0}
                  >
                    <SelectTrigger id="carga_stock">
                      <SelectValue
                        placeholder={
                          loadingStock
                            ? "Buscando stock…"
                            : stockOptions.length === 0
                            ? "Sin stock disponible"
                            : "Sin vincular"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin vincular</SelectItem>
                      {stockOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.nombre} · stock {s.stock_actual ?? 0} {s.unidad_medida ?? ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {draft.tipo === "diaria" && (
                <div className="space-y-1.5">
                  <Label htmlFor="carga_cant">Cantidad mensual</Label>
                  <Input
                    id="carga_cant"
                    type="number"
                    min={0}
                    value={draft.cantidad_mensual ?? ""}
                    onChange={(e) =>
                      updateDraft(
                        "cantidad_mensual",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    placeholder="Ej: 30"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="carga_inicio">Inicio</Label>
                  <Input
                    id="carga_inicio"
                    type="date"
                    value={draft.fecha_inicio ?? ""}
                    onChange={(e) => updateDraft("fecha_inicio", e.target.value || null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carga_fin">Fin</Label>
                  <Input
                    id="carga_fin"
                    type="date"
                    value={draft.fecha_fin ?? ""}
                    onChange={(e) => updateDraft("fecha_fin", e.target.value || null)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="carga_obs">Observaciones</Label>
                <Textarea
                  id="carga_obs"
                  rows={2}
                  value={draft.observaciones ?? ""}
                  onChange={(e) => updateDraft("observaciones", e.target.value)}
                  placeholder="Notas adicionales…"
                />
              </div>

              <Button type="submit" variant="outline" className="w-full" disabled={!pacienteId}>
                <PlusCircle className="h-4 w-4" />
                Agregar a la lista
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Lista a guardar</CardTitle>
              <CardDescription>{items.length} medicamento(s) pendientes</CardDescription>
            </div>
            {items.length > 0 && (
              <Button onClick={() => void handleSaveAll()} disabled={saving || !pacienteId}>
                <Save className="h-4 w-4" />
                {saving ? "Guardando…" : "Guardar todo"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {items.length === 0 ? (
              <EmptyStateBlock
                icon={<Save className="h-5 w-5" />}
                title="Sin medicamentos cargados"
                description="Agregá medicamentos desde el formulario de la izquierda."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nombre</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead className="pr-6 text-right">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="pl-6 font-medium text-foreground">
                        {item.nombre}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {[item.dosis, item.frecuencia].filter(Boolean).join(" · ") || "—"}
                      </TableCell>
                      <TableCell>
                        <TipoMedicacionBadge tipo={item.tipo} />
                      </TableCell>
                      <TableCell>
                        <OrigenPagoBadge origen={item.origen_pago} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.fecha_inicio ?? "—"} → {item.fecha_fin ?? "—"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item._id)}
                          aria-label={`Quitar ${item.nombre}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
