import { useCallback, useEffect, useMemo, useState } from "react";
import { createDieta, deleteDieta, fetchDietas, updateDieta } from "../api";
import type { Dieta, DietaFormValues } from "../types";

interface UseDietasResult {
  registros: Dieta[];
  filtered: Dieta[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  save: (values: DietaFormValues) => Promise<Dieta>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDietas(): UseDietasResult {
  const [registros, setRegistros] = useState<Dieta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setRegistros(await fetchDietas());
    } catch (error) {
      console.error("Error cargando dietas:", error);
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
      (d) =>
        (d.paciente?.nombre ?? "").toLowerCase().includes(term) ||
        (d.paciente?.apellido ?? "").toLowerCase().includes(term) ||
        d.tipo.toLowerCase().includes(term) ||
        (d.alergias ?? "").toLowerCase().includes(term)
    );
  }, [registros, search]);

  const save = useCallback(
    async (values: DietaFormValues): Promise<Dieta> => {
      const saved = values.id
        ? await updateDieta(values.id, values)
        : await createDieta(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteDieta(id);
      await cargar();
    },
    [cargar]
  );

  return { registros, filtered, loading, search, setSearch, save, remove, refresh: cargar };
}
