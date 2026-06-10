import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createIncidencia,
  deleteIncidencia,
  fetchIncidencias,
  updateIncidencia,
} from "../api";
import type { Incidencia, IncidenciaFormValues, IncidenciaSeveridad } from "../types";

export interface IncidenciasFilters {
  search: string;
  severidad: IncidenciaSeveridad | "todos";
}

const DEFAULT_FILTERS: IncidenciasFilters = { search: "", severidad: "todos" };

interface UseIncidenciasResult {
  registros: Incidencia[];
  filtered: Incidencia[];
  loading: boolean;
  filters: IncidenciasFilters;
  setFilters: (partial: Partial<IncidenciasFilters>) => void;
  resetFilters: () => void;
  save: (values: IncidenciaFormValues) => Promise<Incidencia>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useIncidencias(): UseIncidenciasResult {
  const [registros, setRegistros] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<IncidenciasFilters>(DEFAULT_FILTERS);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setRegistros(await fetchIncidencias());
    } catch (error) {
      console.error("Error cargando incidencias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return registros.filter((r) => {
      const matchSearch =
        term === "" ||
        r.tipo.toLowerCase().includes(term) ||
        r.descripcion.toLowerCase().includes(term) ||
        (r.paciente?.nombre ?? "").toLowerCase().includes(term) ||
        (r.paciente?.apellido ?? "").toLowerCase().includes(term);
      const matchSev = filters.severidad === "todos" || r.severidad === filters.severidad;
      return matchSearch && matchSev;
    });
  }, [registros, filters]);

  const setFilters = useCallback((partial: Partial<IncidenciasFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const save = useCallback(
    async (values: IncidenciaFormValues): Promise<Incidencia> => {
      const saved = values.id
        ? await updateIncidencia(values.id, values)
        : await createIncidencia(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteIncidencia(id);
      await cargar();
    },
    [cargar]
  );

  return {
    registros,
    filtered,
    loading,
    filters,
    setFilters,
    resetFilters,
    save,
    remove,
    refresh: cargar,
  };
}
