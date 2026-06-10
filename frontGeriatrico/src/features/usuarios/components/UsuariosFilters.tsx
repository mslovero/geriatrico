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
import { USER_ROLES } from "../types";
import type { UsuariosFilters as Filters } from "../hooks/useUsuarios";

interface UsuariosFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onReset: () => void;
}

export function UsuariosFilters({ filters, onChange, onReset }: UsuariosFiltersProps) {
  const hasFilters = filters.search !== "" || filters.role !== "todos";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchBar
        value={filters.search}
        onChange={(value) => onChange({ search: value })}
        placeholder="Buscar por nombre o email…"
        className="sm:max-w-sm"
      />
      <Select value={filters.role} onValueChange={(value) => onChange({ role: value })}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los roles</SelectItem>
          {USER_ROLES.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
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
