import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProveedor,
  deleteProveedor,
  fetchProveedores,
  updateProveedor,
} from "../api";
import type { Proveedor, ProveedorFormValues } from "../types";

interface UseProveedoresResult {
  proveedores: Proveedor[];
  filtered: Proveedor[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  save: (values: ProveedorFormValues) => Promise<Proveedor>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProveedores(): UseProveedoresResult {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setProveedores(await fetchProveedores());
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return proveedores;
    return proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        (p.razon_social ?? "").toLowerCase().includes(term) ||
        (p.cuit ?? "").toLowerCase().includes(term) ||
        (p.email ?? "").toLowerCase().includes(term)
    );
  }, [proveedores, search]);

  const save = useCallback(
    async (values: ProveedorFormValues): Promise<Proveedor> => {
      const saved = values.id
        ? await updateProveedor(values.id, values)
        : await createProveedor(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteProveedor(id);
      await cargar();
    },
    [cargar]
  );

  return { proveedores, filtered, loading, search, setSearch, save, remove, refresh: cargar };
}
