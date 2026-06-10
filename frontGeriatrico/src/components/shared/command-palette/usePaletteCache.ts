import { useCallback, useRef, useState } from "react";
import { get } from "@/api/api";
import type {
  LoteLite,
  MedicacionLite,
  PacienteLite,
  PaletteCache,
  PaletteCacheState,
  StockItemLite,
} from "./types";

interface CollectionResponse<T> {
  data?: T[];
}

function unwrap<T>(res: T[] | CollectionResponse<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

const EMPTY_CACHE: PaletteCache = {
  pacientes: [],
  stock: [],
  medicaciones: [],
  lotes: [],
};

const EMPTY_LOADING = {
  pacientes: false,
  stock: false,
  medicaciones: false,
  lotes: false,
};

const FETCHERS: Record<keyof PaletteCache, () => Promise<unknown>> = {
  pacientes: () => get<PacienteLite[] | CollectionResponse<PacienteLite>>("/pacientes"),
  stock: () =>
    get<StockItemLite[] | CollectionResponse<StockItemLite>>("/stock-items?activo=1"),
  medicaciones: () =>
    get<MedicacionLite[] | CollectionResponse<MedicacionLite>>("/medicamentos"),
  lotes: () => get<LoteLite[] | CollectionResponse<LoteLite>>("/lotes-stock"),
};

export function usePaletteCache(): PaletteCacheState {
  const [data, setData] = useState<PaletteCache>(EMPTY_CACHE);
  const [loading, setLoading] = useState(EMPTY_LOADING);
  const loaded = useRef<Set<keyof PaletteCache>>(new Set());
  const inFlight = useRef<Partial<Record<keyof PaletteCache, Promise<void>>>>({});

  const ensure = useCallback(async (key: keyof PaletteCache): Promise<void> => {
    if (loaded.current.has(key)) return;
    const current = inFlight.current[key];
    if (current) return current;

    const promise = (async () => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const res = await FETCHERS[key]();
        const list = unwrap(res as PacienteLite[] | CollectionResponse<PacienteLite>);
        setData((prev) => ({ ...prev, [key]: list }));
        loaded.current.add(key);
      } catch (error) {
        console.error(`Error cargando ${key} en palette:`, error);
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
        delete inFlight.current[key];
      }
    })();

    inFlight.current[key] = promise;
    return promise;
  }, []);

  return { data, loading, ensure };
}
