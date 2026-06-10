import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSignoVital,
  deleteSignoVital,
  fetchSignosVitales,
  updateSignoVital,
} from "../api";
import type { SignoVital, SignoVitalFormValues } from "../types";

interface UseSignosVitalesResult {
  registros: SignoVital[];
  filtered: SignoVital[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  save: (values: SignoVitalFormValues) => Promise<SignoVital>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSignosVitales(): UseSignosVitalesResult {
  const [registros, setRegistros] = useState<SignoVital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setRegistros(await fetchSignosVitales());
    } catch (error) {
      console.error("Error cargando signos vitales:", error);
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
    return registros.filter((r) => {
      const p = r.paciente;
      return (
        (p?.nombre ?? "").toLowerCase().includes(term) ||
        (p?.apellido ?? "").toLowerCase().includes(term) ||
        (r.registrado_por ?? "").toLowerCase().includes(term)
      );
    });
  }, [registros, search]);

  const save = useCallback(
    async (values: SignoVitalFormValues): Promise<SignoVital> => {
      const saved = values.id
        ? await updateSignoVital(values.id, values)
        : await createSignoVital(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteSignoVital(id);
      await cargar();
    },
    [cargar]
  );

  return { registros, filtered, loading, search, setSearch, save, remove, refresh: cargar };
}
