import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BoxesIcon,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundMesh />

      <Header />

      <main className="relative">
        <Hero />
        <Features />
        <Modules />
        <Trust />
        <CtaFinal />
      </main>

      <Footer />
    </div>
  );
}

function BackgroundMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="mesh-blob-1 absolute -left-48 -top-48 h-[42rem] w-[42rem] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, hsl(221 83% 53% / 0.6), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="mesh-blob-2 absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, hsl(160 84% 39% / 0.6), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-10 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Plataforma clínica
            </p>
            <p className="text-sm font-semibold text-foreground">
              Adultos Mayores
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Funcionalidades
          </a>
          <a href="#modulos" className="transition-colors hover:text-foreground">
            Módulos
          </a>
          <a href="#confianza" className="transition-colors hover:text-foreground">
            Seguridad
          </a>
        </nav>

        <Link to="/login">
          <Button size="sm" className="gap-1.5">
            Probar demo
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <div className="fade-up inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" />
          Disponible para residencias geriátricas
        </div>

        <h1 className="fade-up mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Gestión integral de tu
          <br />
          <span className="bg-gradient-to-r from-primary via-blue-500 to-emerald-500 bg-clip-text text-transparent">
            residencia geriátrica.
          </span>
        </h1>

        <p className="fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Trazabilidad clínica completa, control de medicación, signos vitales,
          stock y reportes — en una sola plataforma diseñada para enfermería y
          staff médico.
        </p>

        <div className="fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/login">
            <Button size="lg" className="gap-2 px-6">
              Acceder a la demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="px-6">
              Ver funcionalidades
            </Button>
          </a>
        </div>

        <p className="fade-up mt-5 text-[12px] text-muted-foreground">
          Sin instalación · Demo lista para usar · Datos restaurados cada 6 horas
        </p>
      </div>

      <div className="fade-up mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 sm:gap-12">
        <Stat value="100%" label="Trazabilidad" />
        <Stat value="24/7" label="Disponibilidad" />
        <Stat value="TLS 1.3" label="Conexión segura" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Auditoría clínica completa",
      description:
        "Cada administración de medicación queda registrada con usuario, hora y trazabilidad de lote.",
    },
    {
      icon: Activity,
      title: "Alertas en tiempo real",
      description:
        "Signos vitales fuera de rango disparan notificaciones inmediatas al equipo de cuidado.",
    },
    {
      icon: BoxesIcon,
      title: "Stock con FIFO",
      description:
        "Control de lotes por vencimiento, alertas de stock bajo y reportes de consumo y costos.",
    },
    {
      icon: FileText,
      title: "Ficha clínica en PDF",
      description:
        "Exportá historiales completos, últimos 30 días o última revisión con un solo click.",
    },
  ];

  return (
    <section id="features" className="relative border-t border-border/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Funcionalidades"
          title="Todo lo que tu residencia necesita"
          subtitle="Diseñado con enfermería y staff médico para resolver el trabajo diario sin fricciones."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <FeatureCard key={it.title} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Modules() {
  const modules = [
    {
      icon: Users,
      title: "Pacientes",
      bullets: ["Ficha clínica completa", "Patologías y alergias", "Asignación a habitación"],
    },
    {
      icon: ClipboardCheck,
      title: "MAR — Administración",
      bullets: ["Lista de tareas por turno", "Confirmación con un click", "Auditoría inmutable"],
    },
    {
      icon: Stethoscope,
      title: "Signos vitales",
      bullets: ["Presión, glucemia, temperatura", "Detección de outliers", "Gráficos de evolución"],
    },
    {
      icon: BoxesIcon,
      title: "Stock e inventario",
      bullets: ["Lotes con vencimiento", "Movimientos automáticos", "Reporte de costos"],
    },
    {
      icon: FileText,
      title: "Historial médico",
      bullets: ["Evolución cronológica", "Archivos adjuntos", "Exportación PDF"],
    },
    {
      icon: TrendingUp,
      title: "Reportes",
      bullets: ["Dashboard ejecutivo", "Indicadores clave", "Filtros por período"],
    },
  ];

  return (
    <section id="modulos" className="relative border-t border-border/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Módulos"
          title="Una plataforma, todo bajo control"
          subtitle="Cada módulo está pensado para el flujo real de trabajo de una residencia profesional."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <ModuleCard key={m.title} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  bullets,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <ul className="mt-4 space-y-2">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Trust() {
  return (
    <section
      id="confianza"
      className="relative border-t border-border/40 px-6 py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-success-foreground">
            <ShieldCheck className="h-3 w-3" />
            Seguridad
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Tu información clínica,
            <br />
            <span className="text-primary">protegida y trazable.</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Cifrado en tránsito, autenticación por roles, registros inmutables y
            backups automáticos. Toda decisión queda auditada.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TrustItem icon={ShieldCheck} title="TLS 1.3" desc="Cifrado de extremo a extremo" />
          <TrustItem icon={CheckCircle2} title="Roles" desc="Permisos granulares por usuario" />
          <TrustItem icon={Activity} title="Auditoría" desc="Cada acción queda registrada" />
          <TrustItem icon={FileText} title="Backups" desc="Restauración automática" />
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function CtaFinal() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Probalo ahora mismo
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Ingresá con un usuario demo y explorá la plataforma. Sin instalación,
          sin tarjetas, sin compromiso.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/login">
            <Button size="lg" className="gap-2 px-8">
              Entrar a la demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-background/40 py-8 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Residencia Adultos Mayores
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} · Plataforma clínica integral
        </p>
      </div>
    </footer>
  );
}
