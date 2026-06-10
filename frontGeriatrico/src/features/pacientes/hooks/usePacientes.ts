import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPaciente,
  deletePaciente,
  fetchCamas,
  fetchHabitaciones,
  fetchPacientes,
  updatePaciente,
} from "../api";
import type {
  Cama,
  Habitacion,
  Paciente,
  PacienteEstado,
  PacienteFormValues,
} from "../types";

export interface PacientesFilters {
  search: string;
  estado: PacienteEstado | "todos";
  habitacionId: string;
}

const DEFAULT_FILTERS: PacientesFilters = {
  search: "",
  estado: "todos",
  habitacionId: "todos",
};

interface UsePacientesResult {
  pacientes: Paciente[];
  pacientesFiltrados: Paciente[];
  habitaciones: Habitacion[];
  camas: Cama[];
  loading: boolean;
  filters: PacientesFilters;
  setFilters: (filters: Partial<PacientesFilters>) => void;
  resetFilters: () => void;
  stats: {
    total: number;
    activos: number;
    temporales: number;
    altas: number;
    sinUbicar: number;
  };
  refresh: () => Promise<void>;
  saveDraft: (values: PacienteFormValues) => Promise<Paciente>;
  removePaciente: (id: number) => Promise<void>;
}

export function usePacientes(): UsePacientesResult {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<PacientesFilters>(DEFAULT_FILTERS);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [pacientesRes, habitacionesRes, camasRes] = await Promise.all([
        fetchPacientes(),
        fetchHabitaciones(),
        fetchCamas(),
      ]);
      setPacientes(pacientesRes);
      setHabitaciones(habitacionesRes);
      setCamas(camasRes);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter((paciente) => {
      const term = filters.search.trim().toLowerCase();
      const matchSearch =
        term === "" ||
        paciente.nombre?.toLowerCase().includes(term) ||
        paciente.apellido?.toLowerCase().includes(term) ||
        paciente.dni?.toString().includes(term);

      const matchEstado = filters.estado === "todos" || paciente.estado === filters.estado;

      const matchHabitacion =
        filters.habitacionId === "todos" ||
        (paciente.habitacion_id != null &&
          paciente.habitacion_id.toString() === filters.habitacionId);

      return matchSearch && matchEstado && matchHabitacion;
    });
  }, [pacientes, filters]);

  const stats = useMemo(
    () => ({
      total: pacientes.length,
      activos: pacientes.filter((p) => p.estado === "activo").length,
      temporales: pacientes.filter((p) => p.estado === "temporal").length,
      altas: pacientes.filter((p) => p.estado === "alta_medica").length,
      sinUbicar: pacientes.filter((p) => !p.habitacion_id || !p.cama_id).length,
    }),
    [pacientes]
  );

  const setFilters = useCallback((partial: Partial<PacientesFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const saveDraft = useCallback(
    async (values: PacienteFormValues): Promise<Paciente> => {
      const saved = values.id
        ? await updatePaciente(values.id, values)
        : await createPaciente(values);
      await cargarTodo();
      return saved;
    },
    [cargarTodo]
  );

  const removePaciente = useCallback(
    async (id: number) => {
      await deletePaciente(id);
      await cargarTodo();
    },
    [cargarTodo]
  );

  return {
    pacientes,
    pacientesFiltrados,
    habitaciones,
    camas,
    loading,
    filters,
    setFilters,
    resetFilters,
    stats,
    refresh: cargarTodo,
    saveDraft,
    removePaciente,
  };
}
