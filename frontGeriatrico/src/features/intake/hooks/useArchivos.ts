import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteArchivo, fetchArchivos, uploadArchivo } from "../api";
import type { ArchivoAdjunto, ArchivoFormValues } from "../types";

interface UseArchivosResult {
  registros: ArchivoAdjunto[];
  filtered: ArchivoAdjunto[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  upload: (values: ArchivoFormValues) => Promise<ArchivoAdjunto>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useArchivos(): UseArchivosResult {
  const [registros, setRegistros] = useState<ArchivoAdjunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setRegistros(await fetchArchivos());
    } catch (error) {
      console.error("Error cargando archivos:", error);
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
      (a) =>
        (a.paciente?.nombre ?? "").toLowerCase().includes(term) ||
        (a.paciente?.apellido ?? "").toLowerCase().includes(term) ||
        a.tipo.toLowerCase().includes(term) ||
        (a.descripcion ?? "").toLowerCase().includes(term)
    );
  }, [registros, search]);

  const upload = useCallback(
    async (values: ArchivoFormValues): Promise<ArchivoAdjunto> => {
      const saved = await uploadArchivo(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteArchivo(id);
      await cargar();
    },
    [cargar]
  );

  return { registros, filtered, loading, search, setSearch, upload, remove, refresh: cargar };
}
