import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createHistorial,
  deleteHistorial,
  fetchHistorialMedico,
  updateHistorial,
} from "../api";
import type { HistorialMedico, HistorialMedicoFormValues } from "../types";

interface UseHistorialMedicoResult {
  registros: HistorialMedico[];
  filtered: HistorialMedico[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  save: (values: HistorialMedicoFormValues) => Promise<HistorialMedico>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useHistorialMedico(): UseHistorialMedicoResult {
  const [registros, setRegistros] = useState<HistorialMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setRegistros(await fetchHistorialMedico());
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return registros;
    return registros.filter(
      (r) =>
        (r.paciente?.nombre ?? "").toLowerCase().includes(term) ||
        (r.paciente?.apellido ?? "").toLowerCase().includes(term) ||
        (r.medico_responsable ?? "").toLowerCase().includes(term) ||
        r.observacion.toLowerCase().includes(term)
    );
  }, [registros, search]);

  const save = useCallback(
    async (values: HistorialMedicoFormValues): Promise<HistorialMedico> => {
      const saved = values.id
        ? await updateHistorial(values.id, values)
        : await createHistorial(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteHistorial(id);
      await cargar();
    },
    [cargar]
  );

  return { registros, filtered, loading, search, setSearch, save, remove, refresh: cargar };
}
