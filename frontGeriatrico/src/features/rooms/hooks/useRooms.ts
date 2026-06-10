import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCama,
  createHabitacion,
  deleteCama,
  deleteHabitacion,
  fetchCamas,
  fetchHabitaciones,
  updateCama,
  updateHabitacion,
} from "../api";
import type {
  Cama,
  CamaFormValues,
  Habitacion,
  HabitacionFormValues,
  HabitacionResumen,
} from "../types";

interface UseRoomsResult {
  habitaciones: Habitacion[];
  camas: Cama[];
  loading: boolean;
  refresh: () => Promise<void>;
  getResumen: (habitacion: Habitacion) => HabitacionResumen;
  pisos: number[];
  stats: {
    totalHabitaciones: number;
    capacidadTotal: number;
    camasOcupadas: number;
    habitacionesLlenas: number;
    porcentajeOcupacion: number;
  };
  saveHabitacion: (values: HabitacionFormValues) => Promise<Habitacion>;
  removeHabitacion: (id: number) => Promise<void>;
  saveCama: (values: CamaFormValues) => Promise<Cama>;
  removeCama: (id: number) => Promise<void>;
}

export function useRooms(): UseRoomsResult {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [habRes, camasRes] = await Promise.all([fetchHabitaciones(), fetchCamas()]);
      setHabitaciones(habRes);
      setCamas(camasRes);
    } catch (error) {
      console.error("Error cargando rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const getResumen = useCallback(
    (habitacion: Habitacion): HabitacionResumen => {
      const propias = camas.filter((c) => c.habitacion_id === habitacion.id);
      const ocupadas = propias.filter((c) => c.estado === "ocupada").length;
      const libres = propias.filter((c) => c.estado === "libre").length;
      const mantenimiento = propias.filter((c) => c.estado === "mantenimiento").length;
      const porcentaje = propias.length > 0 ? Math.round((ocupadas / propias.length) * 100) : 0;
      return {
        totalCamas: propias.length,
        ocupadas,
        libres,
        mantenimiento,
        porcentaje,
        estado: porcentaje === 100 ? "llena" : porcentaje === 0 ? "vacia" : "parcial",
      };
    },
    [camas]
  );

  const pisos = useMemo(() => {
    return Array.from(new Set(habitaciones.map((h) => h.piso ?? 1))).sort((a, b) => a - b);
  }, [habitaciones]);

  const stats = useMemo(() => {
    const camasOcupadas = camas.filter((c) => c.estado === "ocupada").length;
    const habitacionesLlenas = habitaciones.filter((h) => {
      const propias = camas.filter((c) => c.habitacion_id === h.id);
      return propias.length > 0 && propias.every((c) => c.estado === "ocupada");
    }).length;
    return {
      totalHabitaciones: habitaciones.length,
      capacidadTotal: habitaciones.reduce((sum, h) => sum + (h.capacidad ?? 0), 0),
      camasOcupadas,
      habitacionesLlenas,
      porcentajeOcupacion:
        camas.length > 0 ? Math.round((camasOcupadas / camas.length) * 100) : 0,
    };
  }, [habitaciones, camas]);

  const saveHabitacion = useCallback(
    async (values: HabitacionFormValues): Promise<Habitacion> => {
      const saved = values.id
        ? await updateHabitacion(values.id, values)
        : await createHabitacion(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const removeHabitacion = useCallback(
    async (id: number) => {
      await deleteHabitacion(id);
      await cargar();
    },
    [cargar]
  );

  const saveCama = useCallback(
    async (values: CamaFormValues): Promise<Cama> => {
      const saved = values.id
        ? await updateCama(values.id, values)
        : await createCama(values);
      await cargar();
      return saved;
    },
    [cargar]
  );

  const removeCama = useCallback(
    async (id: number) => {
      await deleteCama(id);
      await cargar();
    },
    [cargar]
  );

  return {
    habitaciones,
    camas,
    loading,
    refresh: cargar,
    getResumen,
    pisos,
    stats,
    saveHabitacion,
    removeHabitacion,
    saveCama,
    removeCama,
  };
}
