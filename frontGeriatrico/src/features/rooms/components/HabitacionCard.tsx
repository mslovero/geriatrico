import { ChevronRight, DoorOpen, Layers, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OccupancyBar } from "./OccupancyBar";
import type { Habitacion, HabitacionResumen } from "../types";

interface HabitacionCardProps {
  habitacion: Habitacion;
  resumen: HabitacionResumen;
  onEdit?: (habitacion: Habitacion) => void;
  onDelete?: (habitacion: Habitacion) => void;
}

const STATUS_VARIANT: Record<HabitacionResumen["estado"], "success" | "warning" | "destructive"> = {
  vacia: "success",
  parcial: "warning",
  llena: "destructive",
};

const STATUS_LABEL: Record<HabitacionResumen["estado"], string> = {
  vacia: "Disponible",
  parcial: "Parcial",
  llena: "Completa",
};

export function HabitacionCard({
  habitacion,
  resumen,
  onEdit,
  onDelete,
}: HabitacionCardProps) {
  return (
    <Card className="group transition-all hover:border-foreground/20 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DoorOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Habitación
              </p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {habitacion.numero}
              </p>
              {habitacion.piso != null && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  Piso {habitacion.piso}
                </p>
              )}
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[resumen.estado]}>
            {STATUS_LABEL[resumen.estado]}
            {resumen.estado === "parcial" && ` · ${resumen.porcentaje}%`}
          </Badge>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Capacidad</span>
            <span className="tabular-nums text-muted-foreground">
              {resumen.totalCamas}/{habitacion.capacidad} camas
            </span>
          </div>
          <OccupancyBar resumen={resumen} capacidad={habitacion.capacidad} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/camas">
              Ver camas
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar habitación ${habitacion.numero}`}
                onClick={() => onEdit(habitacion)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar habitación ${habitacion.numero}`}
                onClick={() => onDelete(habitacion)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
