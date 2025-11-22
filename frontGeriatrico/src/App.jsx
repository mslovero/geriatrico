import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pacient from "./pages/pacient";
import Habitaciones from "./pages/Habitaciones";
import Camas from "./pages/Camas";
import Medicaciones from "./pages/Medicaciones";
import HistorialMedico from "./pages/HistorialMedico";
import Archivos from "./pages/Archivos";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pacientes" element={<Pacient />} />
            <Route path="habitaciones" element={<Habitaciones />} />
            <Route path="camas" element={<Camas />} />
            <Route path="medicaciones" element={<Medicaciones />} />
            <Route path="historial" element={<HistorialMedico />} />
            <Route path="archivos" element={<Archivos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
