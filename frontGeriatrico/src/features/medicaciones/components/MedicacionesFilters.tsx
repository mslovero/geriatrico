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
import { ORIGENES_PAGO, TIPOS_MEDICACION } from "../types";
import type { MedicacionesFilters as Filters } from "../hooks/useMedicaciones";
import type { MedicacionTipo, OrigenPago } from "../types";

interface MedicacionesFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onReset: () => void;
}

export function MedicacionesFilters({
  filters,
  onChange,
  onReset,
}: MedicacionesFiltersProps) {
  const hasFilters =
    filters.search !== "" || filters.origen !== "todos" || filters.tipo !== "todos";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchBar
        value={filters.search}
        onChange={(v) => onChange({ search: v })}
        placeholder="Buscar por medicamento o paciente…"
        className="sm:max-w-sm"
      />
      <Select
        value={filters.origen}
        onValueChange={(v) => onChange({ origen: v as OrigenPago | "todos" })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Origen de pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los orígenes</SelectItem>
          {ORIGENES_PAGO.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.tipo}
        onValueChange={(v) => onChange({ tipo: v as MedicacionTipo | "todos" })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los tipos</SelectItem>
          {TIPOS_MEDICACION.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
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
  );
}
