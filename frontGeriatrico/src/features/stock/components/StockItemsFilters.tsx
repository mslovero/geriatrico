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
import { PROPIEDADES, TIPOS_STOCK } from "../types";
import type { StockItemsFilters as Filters } from "../hooks/useStockItems";
import type { StockPropiedad, StockTipo } from "../types";

interface StockItemsFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onReset: () => void;
}

export function StockItemsFilters({
  filters,
  onChange,
  onReset,
}: StockItemsFiltersProps) {
  const hasFilters =
    filters.search !== "" || filters.tipo !== "todos" || filters.propiedad !== "todos";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchBar
        value={filters.search}
        onChange={(v) => onChange({ search: v })}
        placeholder="Buscar por nombre o código…"
        className="sm:max-w-sm"
      />
      <Select
        value={filters.tipo}
        onValueChange={(v) => onChange({ tipo: v as StockTipo | "todos" })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los tipos</SelectItem>
          {TIPOS_STOCK.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.propiedad}
        onValueChange={(v) => onChange({ propiedad: v as StockPropiedad | "todos" })}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Propiedad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas las propiedades</SelectItem>
          {PROPIEDADES.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
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
