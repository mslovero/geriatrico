import { VITAL_RANGES, type VitalRange } from "../types";

export type VitalStatus = "normal" | "alto" | "bajo" | "indeterminado";

export function classifyVital(
  value: number | null | undefined,
  range: VitalRange
): VitalStatus {
  if (value === null || value === undefined || Number.isNaN(value)) return "indeterminado";
  if (value < range.min) return "bajo";
  if (value > range.max) return "alto";
  return "normal";
}

export function classifyPresion(value: string | null | undefined): VitalStatus {
  if (!value) return "indeterminado";
  const [systolicStr] = value.split("/");
  const systolic = Number(systolicStr);
  if (!Number.isFinite(systolic)) return "indeterminado";
  return classifyVital(systolic, VITAL_RANGES.presion_sistolica);
}

export function statusVariant(
  status: VitalStatus
): "success" | "destructive" | "default" | "muted" {
  if (status === "normal") return "success";
  if (status === "alto") return "destructive";
  if (status === "bajo") return "default";
  return "muted";
}
