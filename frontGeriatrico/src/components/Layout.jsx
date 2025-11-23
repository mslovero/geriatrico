import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
    {
      path: "/historial-medico",
      label: "Historial Médico",
      icon: "bi-file-medical",
    },
    { path: "/archivos", label: "Archivos", icon: "bi-folder-fill" },
  ];

  if (user?.role === "admin") {
    navItems.push({
      path: "/usuarios",
      label: "Usuarios",
      icon: "bi-people-fill",
    });
  }

  return (
    <div className="d-flex min-vh-100 position-relative bg-body">
      {/* Sidebar (Drawer) */}
      <div
        className={`d-flex flex-column flex-shrink-0 p-3 text-white sidebar-glass shadow-xl`}
        style={{
          width: "280px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: isNavOpen ? 0 : "-280px",
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          zIndex: 1050,
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 px-2 mt-2">
          <Link
            to="/"
            className="d-flex align-items-center text-white text-decoration-none"
          >
            <div
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-hospital-fill fs-5"></i>
            </div>
            <span className="fs-5 fw-bold tracking-tight">Geriátrico</span>
          </Link>
          <button
            className="btn btn-link text-white-50 d-md-none p-0"
            onClick={() => setIsNavOpen(false)}
          >
            <i className="bi bi-x-lg fs-4"></i>
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-4 p-3 rounded-3 bg-white bg-opacity-10 border border-white border-opacity-10 d-flex align-items-center">
            <div
              className="rounded-circle bg-gradient-primary text-white d-flex align-items-center justify-content-center me-3 shadow-sm"
              style={{ width: "38px", height: "38px", minWidth: "38px" }}
            >
              <span className="fw-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="overflow-hidden">
              <div
                className="fw-bold text-truncate text-white"
                style={{ fontSize: "0.9rem" }}
                title={user.name}
              >
                {user.name}
              </div>
              <div
                className="small text-white-50 text-uppercase"
                style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
              >
                {user.role}
              </div>
            </div>
          </div>
        )}

        <div
          className="mb-3 px-2 text-uppercase text-white-50 fw-bold"
          style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
        >
          Menu Principal
        </div>

        <ul className="nav nav-pills flex-column mb-auto gap-1">
          {navItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => setIsNavOpen(false)}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 border-top border-white border-opacity-10">
          <button
            onClick={logout}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center py-2"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Overlay backdrop when sidebar is open */}
      {isNavOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 backdrop-blur-sm"
          style={{ zIndex: 1040 }}
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column w-100 min-vh-100"
        style={{ marginLeft: 0, transition: "margin-left 0.3s ease" }}
      >
        {/* Header */}
        <header className="bg-surface shadow-sm py-3 px-4 d-flex align-items-center justify-content-between sticky-top z-1020">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-light border-0 shadow-sm me-3 text-primary"
              style={{ width: "40px", height: "40px", borderRadius: "10px" }}
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <h5 className="m-0 fw-bold text-gradient">
              Sistema de Gestión Integral
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-md-flex align-items-center text-muted small">
              <i className="bi bi-calendar3 me-2"></i>
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="vr d-none d-md-block mx-2"></div>
            <div className="position-relative">
              <button
                className="btn btn-light border-0 shadow-sm rounded-circle position-relative"
                style={{ width: "40px", height: "40px" }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <i className="bi bi-bell"></i>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">New alerts</span>
                </span>
              </button>

              {showNotifications && (
                <div
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-xl border border-light overflow-hidden fade-in"
                  style={{ width: "320px", zIndex: 1050, top: "100%" }}
                >
                  <div className="p-3 border-bottom bg-surface d-flex justify-content-between align-items-center">
                    <h6 className="m-0 fw-bold text-dark">Notificaciones</h6>
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                      3 Nuevas
                    </span>
                  </div>
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    <a
                      href="#"
                      className="list-group-item list-group-item-action p-3 border-bottom-0 border-top-0 border-start-0 border-end-0"
                    >
                      <div className="d-flex align-items-start">
                        <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3">
                          <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <div>
                          <p className="mb-1 small fw-bold text-dark">
                            Incidencia Reportada
                          </p>
                          <p className="mb-1 small text-muted">
                            Paciente Juan Pérez presentó fiebre alta.
                          </p>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Hace 10 min
                          </small>
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="list-group-item list-group-item-action p-3 border-bottom-0 border-start-0 border-end-0"
                    >
                      <div className="d-flex align-items-start">
                        <div className="bg-info bg-opacity-10 text-info rounded-circle p-2 me-3">
                          <i className="bi bi-capsule"></i>
                        </div>
                        <div>
                          <p className="mb-1 small fw-bold text-dark">
                            Recordatorio de Medicación
                          </p>
                          <p className="mb-1 small text-muted">
                            Pendiente administración turno tarde.
                          </p>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Hace 30 min
                          </small>
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="list-group-item list-group-item-action p-3 border-bottom-0 border-start-0 border-end-0"
                    >
                      <div className="d-flex align-items-start">
                        <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-3">
                          <i className="bi bi-person-check-fill"></i>
                        </div>
                        <div>
                          <p className="mb-1 small fw-bold text-dark">
                            Nuevo Ingreso
                          </p>
                          <p className="mb-1 small text-muted">
                            Se ha registrado un nuevo paciente.
                          </p>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Hace 2 horas
                          </small>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div className="p-2 text-center bg-light border-top">
                    <a
                      href="#"
                      className="small text-decoration-none text-primary fw-bold"
                    >
                      Ver todas
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className="flex-grow-1 p-4 fade-in position-relative"
          style={{ overflowY: "auto" }}
        >
          <Outlet />
        </main>

        <footer className="py-4 px-4 bg-surface border-top mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              &copy; {new Date().getFullYear()}{" "}
              <span className="fw-bold text-primary">Geriátrico Manager</span>
            </span>
            <div className="text-muted small d-flex align-items-center">
              <span className="me-1">Hecho con</span>
              <i className="bi bi-heart-fill text-danger mx-1 animate-pulse"></i>
              <span>para el cuidado de nuestros mayores</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
