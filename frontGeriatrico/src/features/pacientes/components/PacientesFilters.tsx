import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from "@/components/shared/SearchBar";
import { PACIENTE_ESTADOS } from "../types";
import type { PacientesFilters as Filters } from "../hooks/usePacientes";
import type { Habitacion, PacienteEstado } from "../types";

interface PacientesFiltersProps {
  filters: Filters;
  habitaciones: Habitacion[];
  onChange: (partial: Partial<Filters>) => void;
  onReset: () => void;
}

export function PacientesFilters({
  filters,
  habitaciones,
  onChange,
  onReset,
}: PacientesFiltersProps) {
  const hasFilters =
    filters.search !== "" ||
    filters.estado !== "todos" ||
    filters.habitacionId !== "todos";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchBar
        value={filters.search}
        onChange={(value) => onChange({ search: value })}
        placeholder="Buscar por nombre, apellido o DNI…"
        className="sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.estado}
          onValueChange={(value) => onChange({ estado: value as PacienteEstado | "todos" })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {PACIENTE_ESTADOS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.habitacionId}
          onValueChange={(value) => onChange({ habitacionId: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Habitación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las habitaciones</SelectItem>
            {habitaciones.map((h) => (
              <SelectItem key={h.id} value={h.id.toString()}>
                Habitación {h.numero}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5">
            <FilterX className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
