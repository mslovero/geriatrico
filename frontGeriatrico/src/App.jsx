import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/pacient";
import Habitaciones from "./pages/Habitaciones";
import Camas from "./pages/Camas";
import Medicaciones from "./pages/Medicaciones";
import CargaMedicamentos from "./pages/CargaMedicamentos";
import HistorialMedico from "./pages/HistorialMedico";
import Archivos from "./pages/Archivos";
import SignosVitales from "./pages/SignosVitales";
import AdministracionMedicamentos from "./pages/AdministracionMedicamentos";
import Incidencias from "./pages/Incidencias";
import Nutricion from "./pages/Nutricion";
import Turnos from "./pages/Turnos";
import FichaPaciente from "./pages/FichaPaciente";
import StockDashboard from "./pages/StockDashboard";
import StockItems from "./pages/StockItems";
import Lotes from "./pages/Lotes";
import Proveedores from "./pages/Proveedores";
import ReporteCostos from "./pages/ReporteCostos";
import EstadoMedicaciones from "./pages/EstadoMedicaciones";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;

  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="pacientes/:id/ficha" element={<FichaPaciente />} />
            <Route path="habitaciones" element={<Habitaciones />} />
            <Route path="camas" element={<Camas />} />
            {/* Redirección de ruta antigua a nueva */}
            <Route path="medicaciones" element={<Navigate to="/medicamentos" replace />} />
            <Route path="medicamentos" element={<Medicaciones />} />
            <Route path="medicamentos/carga" element={<CargaMedicamentos />} />
            <Route
              path="administracion-medicamentos"
              element={<AdministracionMedicamentos />}
            />
            <Route path="incidencias" element={<Incidencias />} />
            <Route path="nutricion" element={<Nutricion />} />
            <Route path="turnos" element={<Turnos />} />
            <Route path="signos-vitales" element={<SignosVitales />} />
            <Route path="historial-medico" element={<HistorialMedico />} />
            <Route path="archivos" element={<Archivos />} />
            <Route path="stock" element={<StockDashboard />} />
            <Route path="stock/items" element={<StockItems />} />
            <Route path="stock/lotes" element={<Lotes />} />
            <Route path="stock/proveedores" element={<Proveedores />} />
            <Route path="stock/reportes" element={<ReporteCostos />} />
            <Route path="medicamentos/estado" element={<EstadoMedicaciones />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
