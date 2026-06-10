import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { post } from "@/api/api";
import { handleApiError } from "@/utils/alerts";
import type { Medicacion } from "../types";

interface AdministrarMedicacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicacion: Medicacion | null;
  onSuccess?: (data: { stock_restante?: number | null }) => void;
}

export function AdministrarMedicacionDialog({
  open,
  onOpenChange,
  medicacion,
  onSuccess,
}: AdministrarMedicacionDialogProps) {
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setObservaciones("");
    setSuccess(null);
  }, [open, medicacion]);

  if (!medicacion) return null;

  const sinStockVinculado =
    !medicacion.stock_item_id && medicacion.origen_pago !== "obra_social";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await post<{ stock_restante?: number | null }>(
        "/registro-medicaciones",
        {
          medicacion_id: medicacion.id,
          fecha_hora: new Date().toISOString().slice(0, 19).replace("T", " "),
          estado: "administrado",
          observaciones,
        }
      );
      setSuccess(
        res.stock_restante !== null && res.stock_restante !== undefined
          ? `Administración registrada. Stock restante: ${res.stock_restante}.`
          : "Administración registrada correctamente."
      );
      onSuccess?.(res);
      window.setTimeout(() => onOpenChange(false), 1600);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const unidad = medicacion.stock_item?.unidad_medida ?? "dosis";
  const pacienteLabel = medicacion.paciente
    ? `${medicacion.paciente.nombre} ${medicacion.paciente.apellido}`
    : "Sin asignar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administrar medicación</DialogTitle>
          <DialogDescription>
            Confirmá la administración de <strong>{medicacion.nombre}</strong> a{" "}
            {pacienteLabel}.
          </DialogDescription>
        </DialogHeader>

        {sinStockVinculado && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta medicación no está vinculada a ningún ítem de stock. Editala y vinculala
              antes de administrarla.
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Se registrará la administración de <strong>1 {unidad}</strong>
              {medicacion.stock_item_id && medicacion.origen_pago !== "obra_social"
                ? " y se descontará del stock automáticamente."
                : "."}
            </AlertDescription>
          </Alert>

          <div className="space-y-1.5">
            <Label htmlFor="adm_obs">Observaciones (opcional)</Label>
            <Textarea
              id="adm_obs"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Notas relevantes para el equipo…"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || Boolean(success) || sinStockVinculado}
            >
              {loading ? "Registrando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
