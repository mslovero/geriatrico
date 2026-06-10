import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Archive,
  Bell,
  BellRing,
  BoxesIcon,
  Calendar,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HeartPulse,
  HomeIcon,
  Hospital,
  LogOut,
  Menu,
  Pill,
  Radio,
  Search,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  UserCog,
  Users,
  Utensils,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import useNotifications from "@/hooks/useNotifications";
import usePushNotifications from "@/hooks/usePushNotifications";
import ThemeToggle from "@/components/ThemeToggle";
import DemoBanner from "@/components/DemoBanner";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/shared/CommandPaletteProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notifications";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const baseSections: NavSection[] = [
  {
    label: "General",
    items: [{ to: "/", label: "Dashboard", icon: HomeIcon }],
  },
  {
    label: "Residentes",
    items: [
      { to: "/pacientes", label: "Pacientes", icon: Users },
      { to: "/habitaciones", label: "Habitaciones", icon: Hospital },
      { to: "/camas", label: "Camas", icon: HeartPulse },
    ],
  },
  {
    label: "Cuidado clínico",
    items: [
      { to: "/signos-vitales", label: "Signos vitales", icon: Activity },
      { to: "/medicamentos", label: "Medicamentos", icon: Pill },
      { to: "/administracion-medicamentos", label: "Administración (MAR)", icon: ClipboardCheck },
      { to: "/incidencias", label: "Incidencias", icon: TriangleAlert },
      { to: "/nutricion", label: "Nutrición", icon: Utensils },
      { to: "/turnos", label: "Agenda médica", icon: Calendar },
      { to: "/historial-medico", label: "Historial médico", icon: FileText },
    ],
  },
  {
    label: "Inventario",
    items: [
      { to: "/stock", label: "Stock", icon: BoxesIcon },
      { to: "/archivos", label: "Archivos", icon: Archive },
    ],
  },
];

const adminSection: NavSection = {
  label: "Administración",
  items: [{ to: "/usuarios", label: "Usuarios", icon: UserCog }],
};

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canManageUsers } = usePermissions();
  const sections = canManageUsers ? [...baseSections, adminSection] : baseSections;
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <CommandPaletteProvider>
      <LayoutShell
        sections={sections}
        userName={user?.name ?? ""}
        userRole={user?.role ?? ""}
        onLogout={logout}
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
      />
    </CommandPaletteProvider>
  );
}

interface LayoutShellProps {
  sections: NavSection[];
  userName: string;
  userRole: string;
  onLogout: () => void | Promise<void>;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

function LayoutShell({
  sections,
  userName,
  userRole,
  onLogout,
  drawerOpen,
  onDrawerOpenChange,
}: LayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <DemoBanner />
      <div className="flex flex-1">
      <Sidebar
        sections={sections}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
        className="hidden lg:flex"
      />

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => onDrawerOpenChange(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        sections={sections}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClose={() => onDrawerOpenChange(false)}
        mobile
      />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        <Topbar onOpenDrawer={() => onDrawerOpenChange(true)} />
        <main className="flex-1 bg-muted/30">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  sections: NavSection[];
  userName: string;
  userRole: string;
  onLogout: () => void | Promise<void>;
  className?: string;
  onClose?: () => void;
  mobile?: boolean;
}

function Sidebar({
  sections,
  userName,
  userRole,
  onLogout,
  className,
  onClose,
  mobile = false,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-72 flex-col border-r border-border bg-card",
        !mobile && "fixed inset-y-0 left-0 z-30",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" strokeWidth={2.3} />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Residencia
            </p>
            <p className="text-sm font-semibold text-foreground">Adultos Mayores</p>
          </div>
        </Link>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
      >
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {userName && (
          <div className="flex items-center gap-3 rounded-md p-2">
            <Avatar initials={userName.slice(0, 2)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{userName}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">{userRole}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => void onLogout()}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}

interface TopbarProps {
  onOpenDrawer: () => void;
}

function Topbar({ onOpenDrawer }: TopbarProps) {
  const { isSubscribed, subscribeUser, unsubscribeUser } = usePushNotifications();
  const { open: openPalette } = useCommandPalette();
  const fechaHoy = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenDrawer}
        className="lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <button
        type="button"
        onClick={openPalette}
        className={cn(
          "group inline-flex h-9 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground",
          "transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "sm:max-w-xs"
        )}
        aria-label="Abrir búsqueda global"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden flex-1 text-left sm:inline">
          Buscar pacientes o secciones…
        </span>
        <span className="inline sm:hidden">Buscar</span>
        <kbd className="ml-auto hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span aria-hidden="true">⌘</span>
          <span>K</span>
        </kbd>
      </button>

      <div className="ml-auto hidden flex-col leading-tight sm:flex sm:ml-0">
        <span className="text-xs text-muted-foreground">Bienvenido</span>
        <span className="text-sm font-medium capitalize text-foreground">{fechaHoy}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (isSubscribed ? void unsubscribeUser() : void subscribeUser())}
          title={isSubscribed ? "Notificaciones push activas" : "Activar notificaciones push"}
          aria-label="Notificaciones push"
        >
          <Radio
            className={cn("h-4 w-4", isSubscribed ? "text-success" : "text-muted-foreground")}
          />
        </Button>
        <ThemeToggle />
        <NotificationsBell />
      </div>
    </header>
  );
}

function NotificationsBell() {
  const navigate = useNavigate();
  const {
    notificaciones,
    totalNoLeidas,
    loading,
    marcarLeida,
    marcarTodasLeidas,
    formatearTiempoRelativo,
  } = useNotifications(30_000);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleClickNotif = async (notif: AppNotification) => {
    if (!notif.leida) await marcarLeida(notif.id);
    if (notif.enlace) {
      navigate(notif.enlace);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificaciones"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {totalNoLeidas > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-destructive/60" />
            <span className="relative h-2 w-2 rounded-full bg-destructive" />
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Centro de notificaciones"
          className="absolute right-0 top-12 z-50 w-[22rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificaciones</p>
              <p className="text-xs text-muted-foreground">
                {totalNoLeidas > 0
                  ? `${totalNoLeidas} sin leer`
                  : "Estás al día"}
              </p>
            </div>
            {totalNoLeidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void marcarTodasLeidas()}
                className="gap-1.5 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                Cargando notificaciones…
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <BellRing className="h-5 w-5 text-muted-foreground" />
                </span>
                <p className="text-sm font-medium text-foreground">Sin notificaciones</p>
                <p className="text-xs text-muted-foreground">
                  Cuando algo requiera tu atención, aparecerá aquí.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notificaciones.slice(0, 12).map((notif) => (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => void handleClickNotif(notif)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                        !notif.leida && "bg-primary/[0.04]"
                      )}
                    >
                      <NotifIcon tipo={notif.tipo} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {notif.titulo}
                          </p>
                          {!notif.leida && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-label="No leída"
                            />
                          )}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notif.mensaje}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          {formatearTiempoRelativo(notif.created_at)}
                          {notif.paciente && (
                            <>
                              {" · "}
                              {notif.paciente.nombre} {notif.paciente.apellido}
                            </>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />
          <div className="bg-muted/30 px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                navigate("/");
                setOpen(false);
              }}
            >
              Ver todo en el panel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotifIconProps {
  tipo: string;
}

function NotifIcon({ tipo }: NotifIconProps) {
  const mapping: Record<string, { icon: React.ComponentType<{ className?: string }>; variant: "default" | "destructive" | "warning" | "success" | "muted" }> = {
    incidencia: { icon: TriangleAlert, variant: "warning" },
    medicacion: { icon: Pill, variant: "default" },
    stock_bajo: { icon: BoxesIcon, variant: "warning" },
    stock_vencimiento: { icon: BoxesIcon, variant: "destructive" },
    paciente_nuevo: { icon: Users, variant: "success" },
    paciente_alta: { icon: ShieldCheck, variant: "success" },
    turno: { icon: Calendar, variant: "default" },
    signo_vital_alerta: { icon: Stethoscope, variant: "destructive" },
    sistema: { icon: Bell, variant: "muted" },
  };
  const entry = mapping[tipo] ?? { icon: Bell, variant: "muted" as const };
  const Icon = entry.icon;

  return (
    <Badge variant={entry.variant} className="h-7 w-7 items-center justify-center p-0">
      <Icon className="h-3.5 w-3.5" />
    </Badge>
  );
}
