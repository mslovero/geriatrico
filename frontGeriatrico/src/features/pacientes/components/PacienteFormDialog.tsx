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
import { Separator } from "@/components/ui/separator";
import { PACIENTE_ESTADOS } from "../types";
import type {
  Cama,
  Habitacion,
  Paciente,
  PacienteEstado,
  PacienteFormValues,
} from "../types";

interface PacienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente?: Paciente | null;
  habitaciones: Habitacion[];
  camas: Cama[];
  onSubmit: (values: PacienteFormValues) => Promise<void>;
}

const today = () => new Date().toISOString().split("T")[0];

const emptyForm: PacienteFormValues = {
  nombre: "",
  apellido: "",
  dni: "",
  fecha_nacimiento: "",
  habitacion_id: null,
  cama_id: null,
  medico_cabecera: "",
  patologias: "",
  estado: "activo",
  contacto_emergencia: { nombre: "", telefono: "" },
};

export function PacienteFormDialog({
  open,
  onOpenChange,
  paciente,
  habitaciones,
  camas,
  onSubmit,
}: PacienteFormDialogProps) {
  const [form, setForm] = useState<PacienteFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (paciente) {
      setForm({
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        fecha_nacimiento: paciente.fecha_nacimiento ?? "",
        habitacion_id: paciente.habitacion_id ?? null,
        cama_id: paciente.cama_id ?? null,
        medico_cabecera: paciente.medico_cabecera ?? "",
        patologias: paciente.patologias ?? "",
        estado: paciente.estado,
        contacto_emergencia: paciente.contacto_emergencia ?? { nombre: "", telefono: "" },
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, paciente]);

  const camasDisponibles = useMemo<Cama[]>(() => {
    if (!form.habitacion_id) return [];
    return camas.filter(
      (cama) =>
        cama.habitacion_id === form.habitacion_id &&
        (cama.estado === "libre" || cama.id === form.cama_id)
    );
  }, [camas, form.habitacion_id, form.cama_id]);

  const isEdicion = Boolean(form.id);

  const updateField = <K extends keyof PacienteFormValues>(
    field: K,
    value: PacienteFormValues[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleHabitacionChange = (value: string) => {
    const habId = value ? Number(value) : null;
    setForm((prev) => ({
      ...prev,
      habitacion_id: habId,
      cama_id: null,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        habitacion_id: form.habitacion_id ?? null,
        cama_id: form.cama_id ?? null,
        fecha_nacimiento: form.fecha_nacimiento || null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo guardar el paciente. Revisá los datos e intentá de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdicion ? "Editar paciente" : "Registrar nuevo paciente"}
          </DialogTitle>
          <DialogDescription>
            {isEdicion
              ? "Actualizá los datos del residente."
              : "Cargá los datos clínicos y administrativos del nuevo residente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" required htmlFor="nombre">
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                required
                placeholder="Ej: María"
              />
            </Field>
            <Field label="Apellido" required htmlFor="apellido">
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => updateField("apellido", e.target.value)}
                required
                placeholder="Ej: González"
              />
            </Field>
            <Field label="DNI" required htmlFor="dni">
              <Input
                id="dni"
                inputMode="numeric"
                pattern="[0-9]{7,8}"
                value={form.dni}
                onChange={(e) => updateField("dni", e.target.value.replace(/\D/g, ""))}
                required
                placeholder="Ej: 12345678"
              />
            </Field>
            <Field label="Fecha de nacimiento" htmlFor="fecha_nacimiento">
              <Input
                id="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento ?? ""}
                onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
                max={today()}
              />
            </Field>
            <Field label="Médico de cabecera" htmlFor="medico_cabecera">
              <Input
                id="medico_cabecera"
                value={form.medico_cabecera ?? ""}
                onChange={(e) => updateField("medico_cabecera", e.target.value)}
                placeholder="Ej: Dr. López"
              />
            </Field>
            <Field label="Estado" required htmlFor="estado">
              <Select
                value={form.estado}
                onValueChange={(value) => updateField("estado", value as PacienteEstado)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {PACIENTE_ESTADOS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </section>

          <Separator />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Habitación" htmlFor="habitacion_id">
              <Select
                value={form.habitacion_id ? String(form.habitacion_id) : ""}
                onValueChange={handleHabitacionChange}
              >
                <SelectTrigger id="habitacion_id">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {habitaciones.map((h) => (
                    <SelectItem key={h.id} value={h.id.toString()}>
                      Habitación {h.numero} · cap. {h.capacidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cama" htmlFor="cama_id">
              <Select
                value={form.cama_id ? String(form.cama_id) : ""}
                onValueChange={(value) => updateField("cama_id", value ? Number(value) : null)}
                disabled={!form.habitacion_id}
              >
                <SelectTrigger id="cama_id">
                  <SelectValue
                    placeholder={
                      form.habitacion_id ? "Seleccionar cama" : "Primero elegí habitación"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {camasDisponibles.map((cama) => (
                    <SelectItem key={cama.id} value={cama.id.toString()}>
                      Cama {cama.numero_cama} · {cama.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </section>

          <Separator />

          <section className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Contacto de emergencia</p>
              <p className="text-xs text-muted-foreground">
                Opcional, pero recomendado para alertas críticas.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="contacto_nombre">
                <Input
                  id="contacto_nombre"
                  value={form.contacto_emergencia?.nombre ?? ""}
                  onChange={(e) =>
                    updateField("contacto_emergencia", {
                      ...form.contacto_emergencia,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre y apellido"
                />
              </Field>
              <Field label="Teléfono" htmlFor="contacto_telefono">
                <Input
                  id="contacto_telefono"
                  inputMode="tel"
                  value={form.contacto_emergencia?.telefono ?? ""}
                  onChange={(e) =>
                    updateField("contacto_emergencia", {
                      ...form.contacto_emergencia,
                      telefono: e.target.value,
                    })
                  }
                  placeholder="Ej: 11 2345-6789"
                />
              </Field>
            </div>
          </section>

          <Field label="Patologías" htmlFor="patologias">
            <Textarea
              id="patologias"
              value={form.patologias ?? ""}
              onChange={(e) => updateField("patologias", e.target.value)}
              placeholder="Condiciones médicas crónicas o relevantes…"
              rows={3}
            />
          </Field>

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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando…" : isEdicion ? "Guardar cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  htmlFor: string;
  children: React.ReactNode;
}

function Field({ label, required, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
