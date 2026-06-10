import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createMedicacion,
  deleteMedicacion,
  fetchMedicaciones,
  updateMedicacion,
} from "../api";
import type {
  Medicacion,
  MedicacionFormValues,
  MedicacionTipo,
  OrigenPago,
} from "../types";

export interface MedicacionesFilters {
  search: string;
  origen: OrigenPago | "todos";
  tipo: MedicacionTipo | "todos";
}

const DEFAULT_FILTERS: MedicacionesFilters = {
  search: "",
  origen: "todos",
  tipo: "todos",
};

interface UseMedicacionesResult {
  medicaciones: Medicacion[];
  filtered: Medicacion[];
  loading: boolean;
  filters: MedicacionesFilters;
  setFilters: (partial: Partial<MedicacionesFilters>) => void;
  resetFilters: () => void;
  save: (values: MedicacionFormValues) => Promise<Medicacion>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMedicaciones(): UseMedicacionesResult {
  const [medicaciones, setMedicaciones] = useState<Medicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<MedicacionesFilters>(DEFAULT_FILTERS);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMedicaciones();
      setMedicaciones(data);
    } catch (error) {
      console.error("Error cargando medicaciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return medicaciones.filter((m) => {
      const matchSearch =
        term === "" ||
        m.nombre?.toLowerCase().includes(term) ||
        m.paciente?.nombre?.toLowerCase().includes(term) ||
        m.paciente?.apellido?.toLowerCase().includes(term);
      const matchOrigen = filters.origen === "todos" || m.origen_pago === filters.origen;
      const matchTipo = filters.tipo === "todos" || m.tipo === filters.tipo;
      return matchSearch && matchOrigen && matchTipo;
    });
  }, [medicaciones, filters]);

  const setFilters = useCallback((partial: Partial<MedicacionesFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const save = useCallback(
    async (values: MedicacionFormValues): Promise<Medicacion> => {
      const saved = values.id
        ? await updateMedicacion(values.id, values)
        : await createMedicacion(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteMedicacion(id);
      await cargar();
    },
    [cargar]
  );

  return {
    medicaciones,
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
