import { useCallback, useEffect, useMemo, useState } from "react";
import { createLote, fetchLotes, fetchStockItems, updateLote } from "../api";
import type { Lote, LoteEstado, LoteFormValues, StockItem } from "../types";

export interface LotesFilters {
  search: string;
  estado: LoteEstado | "todos";
  stockItemId: string;
}

const DEFAULT_FILTERS: LotesFilters = {
  search: "",
  estado: "todos",
  stockItemId: "todos",
};

interface UseLotesResult {
  lotes: Lote[];
  filtered: Lote[];
  stockItems: StockItem[];
  loading: boolean;
  filters: LotesFilters;
  setFilters: (partial: Partial<LotesFilters>) => void;
  resetFilters: () => void;
  save: (values: LoteFormValues) => Promise<Lote>;
  refresh: () => Promise<void>;
}

export function useLotes(): UseLotesResult {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<LotesFilters>(DEFAULT_FILTERS);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [lotesRes, itemsRes] = await Promise.all([fetchLotes(), fetchStockItems()]);
      setLotes(lotesRes);
      setStockItems(itemsRes);
    } catch (error) {
      console.error("Error cargando lotes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return lotes.filter((l) => {
      const matchSearch =
        term === "" ||
        l.numero_lote.toLowerCase().includes(term) ||
        (l.stock_item?.nombre ?? "").toLowerCase().includes(term);
      const matchEstado = filters.estado === "todos" || l.estado === filters.estado;
      const matchItem =
        filters.stockItemId === "todos" ||
        l.stock_item_id.toString() === filters.stockItemId;
      return matchSearch && matchEstado && matchItem;
    });
  }, [lotes, filters]);

  const setFilters = useCallback((partial: Partial<LotesFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const save = useCallback(
    async (values: LoteFormValues): Promise<Lote> => {
      const saved = values.id
        ? await updateLote(values.id, values)
        : await createLote(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  return {
    lotes,
    filtered,
    stockItems,
    loading,
    filters,
    setFilters,
    resetFilters,
    save,
    refresh: cargar,
  };
}
