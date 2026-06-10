import { useCallback, useEffect, useMemo, useState } from "react";
import { createUsuario, deleteUsuario, fetchUsuarios, updateUsuario } from "../api";
import type { Usuario, UsuarioFormValues } from "../types";

export interface UsuariosFilters {
  search: string;
  role: string;
}

const DEFAULT_FILTERS: UsuariosFilters = { search: "", role: "todos" };

interface UseUsuariosResult {
  usuarios: Usuario[];
  usuariosFiltrados: Usuario[];
  loading: boolean;
  filters: UsuariosFilters;
  setFilters: (partial: Partial<UsuariosFilters>) => void;
  resetFilters: () => void;
  saveDraft: (values: UsuarioFormValues) => Promise<Usuario>;
  removeUsuario: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useUsuarios(): UseUsuariosResult {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<UsuariosFilters>(DEFAULT_FILTERS);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const usuariosFiltrados = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return usuarios.filter((u) => {
      const matchSearch =
        term === "" ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);
      const matchRole = filters.role === "todos" || u.role === filters.role;
      return matchSearch && matchRole;
    });
  }, [usuarios, filters]);

  const setFilters = useCallback((partial: Partial<UsuariosFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const saveDraft = useCallback(
    async (values: UsuarioFormValues): Promise<Usuario> => {
      const saved = values.id
        ? await updateUsuario(values.id, values)
        : await createUsuario(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const removeUsuario = useCallback(
    async (id: number) => {
      await deleteUsuario(id);
      await cargar();
    },
    [cargar]
  );

  return {
    usuarios,
    usuariosFiltrados,
    loading,
    filters,
    setFilters,
    resetFilters,
    saveDraft,
    removeUsuario,
    refresh: cargar,
  };
}
