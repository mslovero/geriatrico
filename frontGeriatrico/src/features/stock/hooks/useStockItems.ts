import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createStockItem,
  deleteStockItem,
  fetchStockItems,
  updateStockItem,
} from "../api";
import type {
  StockItem,
  StockItemFormValues,
  StockPropiedad,
  StockTipo,
} from "../types";

export interface StockItemsFilters {
  search: string;
  tipo: StockTipo | "todos";
  propiedad: StockPropiedad | "todos";
}

const DEFAULT_FILTERS: StockItemsFilters = {
  search: "",
  tipo: "todos",
  propiedad: "todos",
};

interface UseStockItemsResult {
  items: StockItem[];
  filtered: StockItem[];
  loading: boolean;
  filters: StockItemsFilters;
  setFilters: (partial: Partial<StockItemsFilters>) => void;
  resetFilters: () => void;
  save: (values: StockItemFormValues) => Promise<StockItem>;
  remove: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useStockItems(): UseStockItemsResult {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<StockItemsFilters>(DEFAULT_FILTERS);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStockItems();
      setItems(data);
    } catch (error) {
      console.error("Error cargando stock items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return items.filter((i) => {
      const matchSearch =
        term === "" ||
        i.nombre.toLowerCase().includes(term) ||
        (i.codigo ?? "").toLowerCase().includes(term);
      const matchTipo = filters.tipo === "todos" || i.tipo === filters.tipo;
      const matchProp = filters.propiedad === "todos" || i.propiedad === filters.propiedad;
      return matchSearch && matchTipo && matchProp;
    });
  }, [items, filters]);

  const setFilters = useCallback((partial: Partial<StockItemsFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const save = useCallback(
    async (values: StockItemFormValues): Promise<StockItem> => {
      const saved = values.id
        ? await updateStockItem(values.id, values)
        : await createStockItem(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteStockItem(id);
      await cargar();
    },
    [cargar]
  );

  return {
    items,
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
