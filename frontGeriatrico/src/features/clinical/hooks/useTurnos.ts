import { useCallback, useEffect, useMemo, useState } from "react";
import { createTurno, deleteTurno, fetchTurnos, updateTurno } from "../api";
import type { TurnoEstado, TurnoFormValues, TurnoMedico } from "../types";

export interface TurnosFilters {
  search: string;
  estado: TurnoEstado | "todos";
}

const DEFAULT_FILTERS: TurnosFilters = { search: "", estado: "todos" };

interface UseTurnosResult {
  registros: TurnoMedico[];
  filtered: TurnoMedico[];
  loading: boolean;
  filters: TurnosFilters;
  setFilters: (partial: Partial<TurnosFilters>) => void;
  resetFilters: () => void;
  save: (values: TurnoFormValues) => Promise<TurnoMedico>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTurnos(): UseTurnosResult {
  const [registros, setRegistros] = useState<TurnoMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<TurnosFilters>(DEFAULT_FILTERS);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setRegistros(await fetchTurnos());
    } catch (error) {
      console.error("Error cargando turnos:", error);
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
        r.especialidad.toLowerCase().includes(term) ||
        r.profesional.toLowerCase().includes(term) ||
        (r.paciente?.nombre ?? "").toLowerCase().includes(term) ||
        (r.paciente?.apellido ?? "").toLowerCase().includes(term);
      const matchEstado = filters.estado === "todos" || r.estado === filters.estado;
      return matchSearch && matchEstado;
    });
  }, [registros, filters]);

  const setFilters = useCallback((partial: Partial<TurnosFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const save = useCallback(
    async (values: TurnoFormValues): Promise<TurnoMedico> => {
      const saved = values.id
        ? await updateTurno(values.id, values)
        : await createTurno(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteTurno(id);
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
