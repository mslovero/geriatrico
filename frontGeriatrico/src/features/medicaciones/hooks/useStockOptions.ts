import { useEffect, useState } from "react";
import { fetchStockItemsParaMedicacion } from "../api";
import type { OrigenPago, StockItemRef } from "../types";

interface UseStockOptionsArgs {
  pacienteId: number | null;
  origen: OrigenPago | null;
}

interface UseStockOptionsResult {
  options: StockItemRef[];
  loading: boolean;
}

export function useStockOptions({
  pacienteId,
  origen,
}: UseStockOptionsArgs): UseStockOptionsResult {
  const [options, setOptions] = useState<StockItemRef[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pacienteId || !origen || origen === "obra_social") {
      setOptions([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const items = await fetchStockItemsParaMedicacion({ pacienteId, origen });
        if (!cancelled) setOptions(items);
      } catch (error) {
        console.error("Error cargando stock:", error);
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pacienteId, origen]);

  return { options, loading };
}
