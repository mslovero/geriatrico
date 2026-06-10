import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Fingerprint,
  HeartPulse,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LAST_EMAIL_KEY = "geriatrico_last_email";
const LAST_LOGIN_KEY = "geriatrico_last_login";

interface DemoAccount {
  label: string;
  email: string;
  role: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Administrador",
    email: "admin@geriatrico.test",
    role: "admin",
    description: "Acceso completo al sistema",
  },
  {
    label: "Médico",
    email: "medico@geriatrico.test",
    role: "medico",
    description: "Gestión clínica y medicaciones",
  },
  {
    label: "Enfermería",
    email: "enfermera@geriatrico.test",
    role: "enfermero",
    description: "Registro de signos y administración",
  },
  {
    label: "Administrativo",
    email: "admin-staff@geriatrico.test",
    role: "administrativo",
    description: "Operaciones y agenda médica",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const lastEmail = window.localStorage.getItem(LAST_EMAIL_KEY);
    if (lastEmail) setEmail(lastEmail);
    setLastLogin(window.localStorage.getItem(LAST_LOGIN_KEY));
  }, []);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const canSubmit = isEmailValid && isPasswordValid && !isLoading;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        if (remember) {
          window.localStorage.setItem(LAST_EMAIL_KEY, email);
        } else {
          window.localStorage.removeItem(LAST_EMAIL_KEY);
        }
        window.localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
        navigate("/");
      } else {
        setError("Credenciales incorrectas. Verificá email y contraseña.");
      }
    } catch (err) {
      setError("Ocurrió un error al intentar ingresar. Reintentá en unos segundos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account: DemoAccount) => {
    setEmail(account.email);
    setPassword("password");
    setError("");
    setIsLoading(true);
    try {
      const ok = await login(account.email, "password");
      if (ok) {
        window.localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
        navigate("/");
      } else {
        setError("No se pudo ingresar con el acceso demo. Reseteá la base con seeders.");
      }
    } catch (err) {
      setError("Ocurrió un error al ingresar como demo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background lg:grid lg:grid-cols-2">
      {/* ============== BRAND SIDE ============== */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{
          background:
            "linear-gradient(135deg, hsl(221 83% 22%) 0%, hsl(221 83% 38%) 50%, hsl(217 91% 55%) 100%)",
        }}
      >
        {/* Gradient mesh animado */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="mesh-blob-1 absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="mesh-blob-2 absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full opacity-45"
            style={{
              background:
                "radial-gradient(circle, rgba(56,189,248,0.5), rgba(56,189,248,0) 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="mesh-blob-3 absolute left-1/3 top-1/3 h-80 w-80 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.45), rgba(16,185,129,0) 70%)",
              filter: "blur(70px)",
            }}
          />
          {/* Grid sutil */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Header brand */}
        <div className="relative flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <span
              className="pulse-ring absolute inset-0 rounded-xl bg-white/30"
              aria-hidden="true"
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
              <HeartPulse className="heart-pulse h-6 w-6" strokeWidth={2.4} />
            </span>
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              Residencia
            </p>
            <p className="text-lg font-semibold">Adultos Mayores</p>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Plataforma clínica integral
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight">
            Cuidado profesional,
            <br />
            <span className="bg-gradient-to-r from-white via-cyan-100 to-emerald-100 bg-clip-text text-transparent">
              registrado al detalle.
            </span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/80">
            Trazabilidad completa de medicación, signos vitales y stock — en una sola
            plataforma diseñada para enfermería y staff médico.
          </p>

          <ul className="grid gap-3 pt-2">
            <Feature icon={<ShieldCheck className="h-4 w-4" />}>
              Auditoría completa de cada administración
            </Feature>
            <Feature icon={<Activity className="h-4 w-4" />}>
              Alertas en tiempo real sobre signos críticos
            </Feature>
            <Feature icon={<Stethoscope className="h-4 w-4" />}>
              Trazabilidad FIFO de lotes y vencimientos
            </Feature>
          </ul>
        </div>

        {/* Footer brand */}
        <div className="relative flex items-center justify-between text-[11px] text-white/60">
          <span>© {new Date().getFullYear()} Residencia para Adultos Mayores</span>
          <span className="inline-flex items-center gap-1.5">
            <Fingerprint className="h-3 w-3" />
            Cifrado TLS 1.3
          </span>
        </div>
      </aside>

      {/* ============== FORM SIDE ============== */}
      <main className="relative flex items-center justify-center px-6 py-12 sm:px-12">
        {/* Brand mobile */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-border/40 bg-background/60 px-6 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary heart-pulse" />
            <span className="text-sm font-semibold tracking-tight">
              Residencia Adultos Mayores
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Fingerprint className="h-3 w-3" />
            TLS 1.3
          </span>
        </div>

        <div className="fade-up w-full max-w-md space-y-7 pt-16 lg:pt-0">
          <header className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <LogIn className="h-3 w-3" />
              Acceso al sistema
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Iniciá sesión
            </h2>
            <p className="text-sm text-muted-foreground">
              {lastLogin
                ? `Último acceso: ${formatLastLogin(lastLogin)}`
                : "Ingresá tus credenciales para acceder al sistema."}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              id="email"
              label="Correo electrónico"
              required
              valid={email.length === 0 || isEmailValid}
              hint={
                email.length > 0 && !isEmailValid
                  ? "El email no tiene un formato válido"
                  : undefined
              }
            >
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nombre@residencia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  aria-invalid={email.length > 0 && !isEmailValid}
                />
              </div>
            </Field>

            <Field
              id="password"
              label={
                <div className="flex items-center justify-between">
                  <span>Contraseña</span>
                  <a
                    href="#recuperar"
                    onClick={(e) => {
                      e.preventDefault();
                      setError(
                        "Próximamente: envío de recuperación al email registrado.",
                      );
                    }}
                    className="text-xs font-medium text-primary hover:underline focus-visible:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              }
              required
              valid={password.length === 0 || isPasswordValid}
              hint={
                password.length > 0 && !isPasswordValid
                  ? "Mínimo 6 caracteres"
                  : undefined
              }
            >
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  aria-invalid={password.length > 0 && !isPasswordValid}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <Checkbox
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                label="Recordar este dispositivo"
              />
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-success" />
                Conexión segura
              </span>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Ingresando…
                </>
              ) : (
                <>
                  Ingresar al sistema
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] font-medium uppercase tracking-wider">
              <span className="bg-background px-3 text-muted-foreground">
                Modo demostración
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                disabled={isLoading}
              >
                <span className="inline-flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4" />
                  Probar como…
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
              <DropdownMenuLabel>Elegí un rol</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DEMO_ACCOUNTS.map((acc) => (
                <DropdownMenuItem
                  key={acc.email}
                  onSelect={() => void handleDemoLogin(acc)}
                  className="flex-col items-start gap-0 py-2"
                >
                  <span className="text-sm font-medium text-foreground">
                    {acc.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {acc.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-center text-[11px] text-muted-foreground">
            Al ingresar aceptás las políticas internas de uso del sistema.
          </p>
        </div>
      </main>
    </div>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Feature({ icon, children }: FeatureProps) {
  return (
    <li className="flex items-center gap-3 text-sm text-white/90">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
        {icon}
      </span>
      {children}
    </li>
  );
}

interface FieldProps {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  valid?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, required, valid = true, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="block">
        {label}
        {required && typeof label === "string" && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
      </Label>
      {children}
      {!valid && hint && (
        <p className="text-[11px] text-destructive" role="alert">
          {hint}
        </p>
      )}
    </div>
  );
}

function formatLastLogin(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}
