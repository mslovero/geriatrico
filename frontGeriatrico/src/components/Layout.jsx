import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { logout, user } = useAuth();

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/pacientes", label: "Pacientes", icon: "bi-people-fill" },
    {
      path: "/habitaciones",
      label: "Habitaciones",
      icon: "bi-house-door-fill",
    },
    { path: "/camas", label: "Camas", icon: "bi-hospital" },
    {
      path: "/signos-vitales",
      label: "Signos Vitales",
      icon: "bi-heart-pulse-fill",
    },
    { path: "/medicaciones", label: "Medicaciones", icon: "bi-capsule" },
    {
      path: "/administracion-medicamentos",
      label: "Administración (MAR)",
      icon: "bi-clipboard-check",
    },
    {
      path: "/incidencias",
      label: "Incidencias",
      icon: "bi-exclamation-triangle-fill",
    },
    { path: "/nutricion", label: "Nutrición", icon: "bi-egg-fried" },
    { path: "/turnos", label: "Agenda Médica", icon: "bi-calendar-event" },
    { path: "/historial", label: "Historial Médico", icon: "bi-file-medical" },
    { path: "/archivos", label: "Archivos", icon: "bi-folder-fill" },
  ];

  return (
    <div className="d-flex min-vh-100 position-relative">
      {/* Sidebar (Drawer) */}
      <div
        className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow-lg`}
        style={{
          width: "280px",
          background: "linear-gradient(180deg, #1e4058 0%, #2c5f7e 100%)",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: isNavOpen ? 0 : "-280px",
          transition: "left 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1050,
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Link
            to="/"
            className="d-flex align-items-center text-white text-decoration-none"
          >
            <i className="bi bi-hospital me-2" style={{ fontSize: "2rem" }}></i>
            <span className="fs-4 fw-bold">Geriátrico</span>
          </Link>
          <button
            className="btn btn-link text-white d-md-none"
            onClick={() => setIsNavOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <hr />

        {/* User Info */}
        {user && (
          <div className="mb-3 px-2 d-flex align-items-center">
            <div
              className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-2"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-person-fill fs-4"></i>
            </div>
            <div className="overflow-hidden">
              <div className="fw-bold text-truncate" title={user.name}>
                {user.name}
              </div>
              <div
                className="small text-white-50 text-uppercase"
                style={{ fontSize: "0.75rem" }}
              >
                {user.role}
              </div>
            </div>
          </div>
        )}

        <ul className="nav nav-pills flex-column mb-auto">
          {navItems.map((item) => (
            <li className="nav-item mb-1" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center ${
                  isActive(item.path) ? "active" : ""
                }`}
                style={{
                  backgroundColor: isActive(item.path)
                    ? "#7cb342"
                    : "transparent",
                  opacity: isActive(item.path) ? 1 : 0.85,
                }}
                onClick={() => setIsNavOpen(false)}
              >
                <i
                  className={`${item.icon} me-2`}
                  style={{ width: "20px" }}
                ></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <hr />
        <div className="dropdown">
          <button
            onClick={logout}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            <strong>Cerrar Sesión</strong>
          </button>
        </div>
      </div>

      {/* Overlay backdrop when sidebar is open */}
      {isNavOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5, zIndex: 1040 }}
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column w-100"
        style={{ marginLeft: 0, transition: "margin-left 0.3s ease" }}
      >
        {/* Header with Toggle Button */}
        <header className="bg-white shadow-sm py-2 px-4 d-flex align-items-center">
          <button
            className="btn btn-light border me-3"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <h5 className="m-0 text-secondary">Sistema de Gestión</h5>
        </header>

        <main
          className="flex-grow-1 bg-light p-4 fade-in"
          style={{ maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}
        >
          <Outlet />
        </main>

        <footer className="py-3 px-4 bg-white border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              &copy; {new Date().getFullYear()} Geriátrico Manager
            </span>
            <div className="text-muted small">
              <i className="bi bi-heart-fill text-danger mx-1"></i> Cuidando con
              amor
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
