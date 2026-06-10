import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Hash,
  Layers,
  Loader2,
  Pill,
  Search,
  Slash,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { usePaletteCache } from "./usePaletteCache";
import { ACTIONS, NAV_ENTRIES } from "./catalog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "mixed" | "actions" | "navigation" | "tags";

interface ModeConfig {
  prefix: string;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODES: Record<Mode, ModeConfig> = {
  mixed: {
    prefix: "",
    label: "General",
    placeholder: "Buscar pacientes, secciones o acciones…",
    icon: Search,
  },
  actions: {
    prefix: ">",
    label: "Acciones",
    placeholder: "Buscar acción rápida…",
    icon: Layers,
  },
  navigation: {
    prefix: "/",
    label: "Navegación",
    placeholder: "Saltar a una sección…",
    icon: Slash,
  },
  tags: {
    prefix: "#",
    label: "Etiquetas",
    placeholder: "Filtrar por etiqueta…",
    icon: Hash,
  },
};

function detectMode(value: string): { mode: Mode; query: string } {
  if (value.startsWith(">")) return { mode: "actions", query: value.slice(1).trimStart() };
  if (value.startsWith("/")) return { mode: "navigation", query: value.slice(1).trimStart() };
  if (value.startsWith("#")) return { mode: "tags", query: value.slice(1).trimStart() };
  return { mode: "mixed", query: value };
}

const FOOTER_HINTS = [
  { keys: ["↑", "↓"], label: "Navegar", icon: [ArrowUp, ArrowDown] },
  { keys: ["↵"], label: "Seleccionar", icon: [CornerDownLeft] },
  { keys: ["esc"], label: "Cerrar" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, ensure } = usePaletteCache();
  const [value, setValue] = useState("");

  const { mode, query } = useMemo(() => detectMode(value), [value]);
  const modeConfig = MODES[mode];

  useEffect(() => {
    if (!open) {
      setValue("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (mode === "mixed" || mode === "tags") {
      void ensure("pacientes");
    }
    if (mode === "mixed" && query.length >= 3) {
      // En general, cargamos stock/medicaciones si el usuario tipea con cierta intención
      void ensure("stock");
      void ensure("medicaciones");
    }
    if (mode === "tags") {
      void ensure("stock");
      void ensure("lotes");
    }
  }, [open, mode, query, ensure]);

  const handleSelect = useCallback(
    (to: string) => {
      onOpenChange(false);
      navigate(to);
    },
    [navigate, onOpenChange]
  );

  const visibleNav = useMemo(
    () => NAV_ENTRIES.filter((n) => !n.adminOnly || user?.role === "admin"),
    [user?.role]
  );

  const showActions = mode === "mixed" || mode === "actions";
  const showNavigation = mode === "mixed" || mode === "navigation";
  const showPacientes = mode === "mixed" || mode === "tags";
  const showStockHits = mode === "mixed" && query.length >= 2;
  const showMedicacionesHits = mode === "mixed" && query.length >= 2;
  const showLotesByTag = mode === "tags" && query.length > 0;

  const pacientes = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data.pacientes.slice(0, 6);
    return data.pacientes
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.apellido.toLowerCase().includes(term) ||
          p.dni?.toString().includes(term)
      )
      .slice(0, 8);
  }, [data.pacientes, query]);

  const stockHits = useMemo(() => {
    if (!showStockHits) return [];
    const term = query.trim().toLowerCase();
    return data.stock
      .filter(
        (s) =>
          s.nombre.toLowerCase().includes(term) ||
          (s.codigo ?? "").toLowerCase().includes(term)
      )
      .slice(0, 5);
  }, [data.stock, query, showStockHits]);

  const medicacionesHits = useMemo(() => {
    if (!showMedicacionesHits) return [];
    const term = query.trim().toLowerCase();
    return data.medicaciones
      .filter(
        (m) =>
          m.nombre.toLowerCase().includes(term) ||
          (m.paciente?.nombre ?? "").toLowerCase().includes(term) ||
          (m.paciente?.apellido ?? "").toLowerCase().includes(term)
      )
      .slice(0, 5);
  }, [data.medicaciones, query, showMedicacionesHits]);

  const lotesByTag = useMemo(() => {
    if (!showLotesByTag) return [];
    const term = query.trim().toLowerCase();
    return data.lotes
      .filter(
        (l) =>
          l.estado.includes(term) ||
          l.numero_lote.toLowerCase().includes(term) ||
          (l.stock_item?.nombre ?? "").toLowerCase().includes(term)
      )
      .slice(0, 5);
  }, [data.lotes, query, showLotesByTag]);

  const isLoading =
    loading.pacientes || loading.stock || loading.medicaciones || loading.lotes;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <modeConfig.icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {modeConfig.label}
        </span>
        <kbd className="ml-auto inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/40 px-1.5 font-mono text-[10px] text-muted-foreground">
          <span>{">"}</span>
          <span>/</span>
          <span>#</span>
        </kbd>
      </div>

      <CommandInput
        placeholder={modeConfig.placeholder}
        value={value}
        onValueChange={setValue}
      />

      <CommandList>
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Cargando catálogos…
          </div>
        )}

        <CommandEmpty>
          <Search className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Sin resultados</p>
          <p className="text-xs text-muted-foreground">
            Probá con otro término. Usá <PrefixHint>{">"}</PrefixHint> para acciones,{" "}
            <PrefixHint>/</PrefixHint> para navegación.
          </p>
        </CommandEmpty>

        {showPacientes && pacientes.length > 0 && (
          <CommandGroup heading="Pacientes">
            {pacientes.map((p) => {
              const initials = `${p.nombre[0] ?? ""}${p.apellido[0] ?? ""}`;
              return (
                <CommandItem
                  key={`p-${p.id}`}
                  value={`paciente ${p.nombre} ${p.apellido} ${p.dni}`}
                  onSelect={() => handleSelect(`/pacientes/${p.id}/ficha`)}
                >
                  <Avatar initials={initials} className="h-6 w-6 text-[10px]" />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">
                      {p.nombre} {p.apellido}
                    </span>
                    <span className="text-xs text-muted-foreground">DNI {p.dni}</span>
                  </div>
                  <CommandShortcut>Ficha</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {stockHits.length > 0 && (
          <CommandGroup heading="Stock">
            {stockHits.map((s) => (
              <CommandItem
                key={`s-${s.id}`}
                value={`stock ${s.nombre} ${s.codigo ?? ""}`}
                onSelect={() => handleSelect("/stock/items")}
              >
                <Layers className="text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{s.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.stock_actual ?? 0} {s.unidad_medida ?? "u"} disponible
                    {s.bajo_stock ? " · stock bajo" : ""}
                  </span>
                </div>
                <CommandShortcut>Ver</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {medicacionesHits.length > 0 && (
          <CommandGroup heading="Medicaciones">
            {medicacionesHits.map((m) => (
              <CommandItem
                key={`m-${m.id}`}
                value={`medicacion ${m.nombre} ${m.paciente?.nombre ?? ""} ${m.paciente?.apellido ?? ""}`}
                onSelect={() => handleSelect("/medicamentos")}
              >
                <Pill className="text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{m.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {[m.dosis, m.paciente ? `${m.paciente.nombre} ${m.paciente.apellido}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <CommandShortcut>Ver</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {lotesByTag.length > 0 && (
          <CommandGroup heading="Lotes filtrados">
            {lotesByTag.map((l) => (
              <CommandItem
                key={`l-${l.id}`}
                value={`lote ${l.numero_lote} ${l.stock_item?.nombre ?? ""} ${l.estado}`}
                onSelect={() => handleSelect("/stock/lotes")}
              >
                <Hash className="text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">
                    Lote {l.numero_lote}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {l.stock_item?.nombre ?? "—"} · {l.estado}
                  </span>
                </div>
                <CommandShortcut>{l.estado}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {showActions && (
          <>
            {(showPacientes && pacientes.length > 0) ||
            stockHits.length > 0 ||
            medicacionesHits.length > 0 ? (
              <CommandSeparator />
            ) : null}
            <CommandGroup heading="Acciones rápidas">
              {ACTIONS.map((action) => (
                <CommandItem
                  key={`a-${action.to}-${action.label}`}
                  value={`accion ${action.label} ${action.keywords ?? ""}`}
                  onSelect={() => handleSelect(action.to)}
                >
                  <action.icon className="text-muted-foreground" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {showNavigation && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navegación">
              {visibleNav.map((nav) => (
                <CommandItem
                  key={`n-${nav.to}`}
                  value={`nav ${nav.label} ${nav.keywords ?? ""}`}
                  onSelect={() => handleSelect(nav.to)}
                >
                  <nav.icon className="text-muted-foreground" />
                  <span>{nav.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
        {FOOTER_HINTS.map((hint) => (
          <span key={hint.label} className="inline-flex items-center gap-1">
            {hint.icon
              ? hint.icon.map((Icon, idx) => (
                  <Kbd key={idx}>
                    <Icon className="h-2.5 w-2.5" />
                  </Kbd>
                ))
              : hint.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}
            <span>{hint.label}</span>
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {data.pacientes.length || "—"} pacientes
        </span>
      </div>
    </CommandDialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-background px-1 font-mono text-[10px] text-foreground">
      {children}
    </kbd>
  );
}

function PrefixHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-foreground">
      {children}
    </kbd>
  );
}
