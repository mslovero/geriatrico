import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "@/components/Layout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
const Landing = lazy(() => import("@/pages/Landing"));

// === Lazy-loaded routes ===
// Cada feature genera su propio chunk JS y se descarga al navegar.
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PacientesPage = lazy(() => import("@/features/pacientes/PacientesPage"));
const UsuariosPage = lazy(() => import("@/features/usuarios/UsuariosPage"));
const HabitacionesPage = lazy(() => import("@/features/rooms/HabitacionesPage"));
const CamasPage = lazy(() => import("@/features/rooms/CamasPage"));

const MedicacionesPage = lazy(() => import("@/features/medicaciones/MedicacionesPage"));
const CargaMedicamentosPage = lazy(
  () => import("@/features/medicaciones/CargaMedicamentosPage")
);
const AdministracionMedicamentosPage = lazy(
  () => import("@/features/medicaciones/AdministracionMedicamentosPage")
);
const EstadoMedicacionesPage = lazy(
  () => import("@/features/medicaciones/EstadoMedicacionesPage")
);

const SignosVitalesPage = lazy(() => import("@/features/clinical/SignosVitalesPage"));
const HistorialMedicoPage = lazy(() => import("@/features/clinical/HistorialMedicoPage"));
const IncidenciasPage = lazy(() => import("@/features/clinical/IncidenciasPage"));
const TurnosPage = lazy(() => import("@/features/clinical/TurnosPage"));
const FichaPacientePage = lazy(() => import("@/features/clinical/FichaPacientePage"));

const StockDashboardPage = lazy(() => import("@/features/stock/StockDashboardPage"));
const StockItemsPage = lazy(() => import("@/features/stock/StockItemsPage"));
const LotesPage = lazy(() => import("@/features/stock/LotesPage"));
const ProveedoresPage = lazy(() => import("@/features/stock/ProveedoresPage"));
const ReporteCostosPage = lazy(() => import("@/features/stock/ReporteCostosPage"));

const NutricionPage = lazy(() => import("@/features/intake/NutricionPage"));
const ArchivosPage = lazy(() => import("@/features/intake/ArchivosPage"));

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!token) return <Navigate to={DEMO_MODE ? "/welcome" : "/login"} replace />;
  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] items-center justify-center"
    >
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      <span className="sr-only">Cargando sección…</span>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {DEMO_MODE && (
              <Route
                path="/welcome"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Landing />
                  </Suspense>
                }
              />
            )}
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="pacientes"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PacientesPage />
                  </Suspense>
                }
              />
              <Route
                path="pacientes/:id/ficha"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <FichaPacientePage />
                  </Suspense>
                }
              />
              <Route
                path="habitaciones"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HabitacionesPage />
                  </Suspense>
                }
              />
              <Route
                path="camas"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CamasPage />
                  </Suspense>
                }
              />

              <Route path="medicaciones" element={<Navigate to="/medicamentos" replace />} />
              <Route
                path="medicamentos"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MedicacionesPage />
                  </Suspense>
                }
              />
              <Route
                path="medicamentos/carga"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CargaMedicamentosPage />
                  </Suspense>
                }
              />
              <Route
                path="medicamentos/estado"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EstadoMedicacionesPage />
                  </Suspense>
                }
              />
              <Route
                path="administracion-medicamentos"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdministracionMedicamentosPage />
                  </Suspense>
                }
              />

              <Route
                path="incidencias"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <IncidenciasPage />
                  </Suspense>
                }
              />
              <Route
                path="nutricion"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NutricionPage />
                  </Suspense>
                }
              />
              <Route
                path="turnos"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <TurnosPage />
                  </Suspense>
                }
              />
              <Route
                path="signos-vitales"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SignosVitalesPage />
                  </Suspense>
                }
              />
              <Route
                path="historial-medico"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HistorialMedicoPage />
                  </Suspense>
                }
              />
              <Route
                path="archivos"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ArchivosPage />
                  </Suspense>
                }
              />

              <Route
                path="stock"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StockDashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="stock/items"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StockItemsPage />
                  </Suspense>
                }
              />
              <Route
                path="stock/lotes"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LotesPage />
                  </Suspense>
                }
              />
              <Route
                path="stock/proveedores"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ProveedoresPage />
                  </Suspense>
                }
              />
              <Route
                path="stock/reportes"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ReporteCostosPage />
                  </Suspense>
                }
              />

              <Route
                path="usuarios"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <UsuariosPage />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="*"
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
