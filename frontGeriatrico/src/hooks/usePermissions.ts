import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

/**
 * Matriz de permisos del frontend.
 *
 * IMPORTANTE: este archivo es espejo de las Policies del backend Laravel.
 * Si modificás un permiso acá, asegurate de actualizar la policy correspondiente
 * y viceversa. El backend SIEMPRE es la autoridad final — esto es solo UX.
 *
 * Convenciones:
 * - canManage* = puede crear y editar
 * - canDelete* = puede eliminar
 * - canRegister* = puede registrar eventos del día (no toca registros viejos)
 */
export interface Permissions {
  // === Pacientes ===
  canViewPacientes: boolean;
  canManagePacientes: boolean;
  canDeletePacientes: boolean;

  // === Habitaciones / Camas ===
  canManageRooms: boolean;
  canDeleteRooms: boolean;

  // === Medicaciones (prescripciones) ===
  canViewMedicaciones: boolean;
  canManageMedicaciones: boolean;
  canDeleteMedicaciones: boolean;
  canAdministerMedicaciones: boolean;

  // === Signos vitales ===
  canViewSignosVitales: boolean;
  canRegisterSignosVitales: boolean;
  canEditSignosVitales: boolean;
  canDeleteSignosVitales: boolean;

  // === Incidencias ===
  canViewIncidencias: boolean;
  canReportIncidencias: boolean;
  canEditIncidencias: boolean;
  canDeleteIncidencias: boolean;

  // === Turnos médicos ===
  canManageTurnos: boolean;
  canDeleteTurnos: boolean;

  // === Historial médico ===
  canViewHistorial: boolean;
  canManageHistorial: boolean;
  canDeleteHistorial: boolean;

  // === Dietas ===
  canManageDietas: boolean;
  canDeleteDietas: boolean;

  // === Stock e inventario ===
  canViewStock: boolean;
  canManageStock: boolean;
  canDeleteStock: boolean;
  canManageLotes: boolean;
  canManageProveedores: boolean;
  canDeleteProveedores: boolean;

  // === Archivos ===
  canViewArchivos: boolean;
  canUploadArchivos: boolean;
  canDeleteArchivos: boolean;

  // === Reportes y dashboard ===
  canViewReports: boolean;

  // === Usuarios del sistema ===
  canManageUsers: boolean;
}

const ALL_ROLES: UserRole[] = [
  "admin",
  "medico",
  "enfermero",
  "administrativo",
  "staff",
];

function rolesAllowed(roles: UserRole[]) {
  return (role: UserRole | null) =>
    role != null && (roles as string[]).includes(role);
}

export function computePermissions(role: UserRole | null): Permissions {
  const is = rolesAllowed;
  const isAuthenticated = role !== null;

  return {
    // Pacientes: admisión es tarea administrativa, no clínica.
    // Médicos y enfermería atienden, no admiten.
    canViewPacientes: is(ALL_ROLES)(role) && isAuthenticated,
    canManagePacientes: is(["admin", "administrativo"])(role),
    canDeletePacientes: is(["admin"])(role),

    // Rooms
    canManageRooms: is(["admin", "administrativo"])(role),
    canDeleteRooms: is(["admin"])(role),

    // Medicaciones
    canViewMedicaciones: is(ALL_ROLES)(role) && isAuthenticated,
    canManageMedicaciones: is(["admin", "medico"])(role),
    canDeleteMedicaciones: is(["admin"])(role),
    canAdministerMedicaciones: is(["admin", "medico", "enfermero"])(role),

    // Signos vitales
    canViewSignosVitales: is(ALL_ROLES)(role) && isAuthenticated,
    canRegisterSignosVitales: is(["admin", "medico", "enfermero"])(role),
    canEditSignosVitales: is(["admin"])(role),
    canDeleteSignosVitales: is(["admin"])(role),

    // Incidencias
    canViewIncidencias: is(ALL_ROLES)(role) && isAuthenticated,
    canReportIncidencias: is(["admin", "medico", "enfermero", "administrativo"])(role),
    canEditIncidencias: is(["admin"])(role),
    canDeleteIncidencias: is(["admin"])(role),

    // Turnos
    canManageTurnos: is(["admin", "medico", "enfermero", "administrativo"])(role),
    canDeleteTurnos: is(["admin"])(role),

    // Historial
    canViewHistorial: is(ALL_ROLES)(role) && isAuthenticated,
    canManageHistorial: is(["admin", "medico", "enfermero"])(role),
    canDeleteHistorial: is(["admin"])(role),

    // Dietas
    canManageDietas: is(["admin", "medico", "enfermero", "administrativo"])(role),
    canDeleteDietas: is(["admin"])(role),

    // Stock
    canViewStock: is(ALL_ROLES)(role) && isAuthenticated,
    canManageStock: is(["admin", "medico", "administrativo"])(role),
    canDeleteStock: is(["admin"])(role),
    canManageLotes: is(["admin", "medico", "administrativo"])(role),
    canManageProveedores: is(["admin", "medico", "administrativo"])(role),
    canDeleteProveedores: is(["admin"])(role),

    // Archivos
    canViewArchivos: is(ALL_ROLES)(role) && isAuthenticated,
    canUploadArchivos: is(["admin", "medico", "administrativo"])(role),
    canDeleteArchivos: is(["admin"])(role),

    // Reportes
    canViewReports: is(ALL_ROLES)(role) && isAuthenticated,

    // Usuarios
    canManageUsers: is(["admin"])(role),
  };
}

export function usePermissions(): Permissions {
  const { user } = useAuth();
  return useMemo(() => computePermissions(user?.role ?? null), [user?.role]);
}
