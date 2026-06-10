import {
  Activity,
  Archive,
  BedDouble,
  BoxesIcon,
  Building2,
  Calendar,
  ClipboardCheck,
  FileSearch,
  FileText,
  HeartPulse,
  HomeIcon,
  Hospital,
  Layers,
  Pill,
  PlusCircle,
  Stethoscope,
  TriangleAlert,
  UserCog,
  Users,
  Utensils,
} from "lucide-react";

export interface PaletteNavEntry {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  adminOnly?: boolean;
}

export interface PaletteAction {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
}

export const NAV_ENTRIES: PaletteNavEntry[] = [
  { label: "Dashboard", to: "/", icon: HomeIcon, keywords: "panel inicio home" },
  { label: "Pacientes", to: "/pacientes", icon: Users, keywords: "residentes ingresos" },
  { label: "Habitaciones", to: "/habitaciones", icon: Hospital },
  { label: "Camas", to: "/camas", icon: BedDouble },
  {
    label: "Signos vitales",
    to: "/signos-vitales",
    icon: Activity,
    keywords: "presion temperatura pulso saturacion glucosa oxigeno",
  },
  { label: "Medicamentos", to: "/medicamentos", icon: Pill, keywords: "medicacion" },
  {
    label: "Administración (MAR)",
    to: "/administracion-medicamentos",
    icon: ClipboardCheck,
    keywords: "registro administracion administrar",
  },
  {
    label: "Estado de medicaciones",
    to: "/medicamentos/estado",
    icon: Stethoscope,
    keywords: "alertas medicamentos sin stock vincular",
  },
  { label: "Incidencias", to: "/incidencias", icon: TriangleAlert, keywords: "reporte" },
  {
    label: "Nutrición",
    to: "/nutricion",
    icon: Utensils,
    keywords: "dietas alergias cocina",
  },
  { label: "Turnos médicos", to: "/turnos", icon: Calendar, keywords: "agenda" },
  { label: "Historial médico", to: "/historial-medico", icon: FileText },
  { label: "Stock", to: "/stock", icon: BoxesIcon, keywords: "inventario insumos" },
  { label: "Items de stock", to: "/stock/items", icon: BoxesIcon },
  { label: "Lotes de stock", to: "/stock/lotes", icon: Layers, keywords: "vencimientos" },
  { label: "Proveedores", to: "/stock/proveedores", icon: Building2 },
  {
    label: "Reportes de costos",
    to: "/stock/reportes",
    icon: FileSearch,
    keywords: "consumo top medicamentos",
  },
  { label: "Archivos adjuntos", to: "/archivos", icon: Archive, keywords: "documentos" },
  { label: "Usuarios", to: "/usuarios", icon: UserCog, adminOnly: true },
];

export const ACTIONS: PaletteAction[] = [
  {
    label: "Nuevo ingreso de paciente",
    to: "/pacientes",
    icon: PlusCircle,
    keywords: "alta crear",
  },
  {
    label: "Registrar signos vitales",
    to: "/signos-vitales",
    icon: HeartPulse,
    keywords: "tomar medir presion",
  },
  {
    label: "Reportar incidencia",
    to: "/incidencias",
    icon: TriangleAlert,
    keywords: "caida emergencia agresion",
  },
  {
    label: "Carga masiva de medicamentos",
    to: "/medicamentos/carga",
    icon: Pill,
    keywords: "batch alta masiva",
  },
  {
    label: "Nuevo lote de stock",
    to: "/stock/lotes",
    icon: Layers,
    keywords: "vencimiento ingreso compra",
  },
  {
    label: "Nuevo proveedor",
    to: "/stock/proveedores",
    icon: Building2,
    keywords: "alta",
  },
];
