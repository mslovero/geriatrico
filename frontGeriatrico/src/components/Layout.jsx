import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ||
           (path !== '/' && location.pathname.startsWith(path));
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/pacientes', label: 'Pacientes', icon: 'bi-people-fill' },
    { path: '/habitaciones', label: 'Habitaciones', icon: 'bi-house-door-fill' },
    { path: '/camas', label: 'Camas', icon: 'bi-hospital' },
    { path: '/medicaciones', label: 'Medicaciones', icon: 'bi-capsule' },
    { path: '/historial', label: 'Historial Médico', icon: 'bi-file-medical' },
    { path: '/archivos', label: 'Archivos', icon: 'bi-folder-fill' },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-md"
           style={{
             background: 'linear-gradient(135deg, #2c5f7e 0%, #1e4058 100%)',
             borderBottom: '3px solid #7cb342'
           }}>
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <i className="bi bi-hospital me-2" style={{ fontSize: '1.5rem' }}></i>
            <span style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>
              Geriátrico Manager
            </span>
          </Link>
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-controls="navbarNav"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2">
              {navItems.map((item) => (
                <li className="nav-item" key={item.path}>
                  <Link
                    className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center ${
                      isActive(item.path) ? 'active' : ''
                    }`}
                    to={item.path}
                    onClick={() => setIsNavOpen(false)}
                    style={{
                      backgroundColor: isActive(item.path) ? 'rgba(124, 179, 66, 0.15)' : 'transparent',
                      borderLeft: isActive(item.path) ? '3px solid #7cb342' : '3px solid transparent',
                      fontWeight: isActive(item.path) ? '600' : '500',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                <button
                  onClick={logout}
                  className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
                  style={{ border: '1px solid rgba(255,255,255,0.5)' }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Salir
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1 bg-light fade-in">
        <Outlet />
      </main>

      <footer style={{
        background: 'linear-gradient(135deg, #1e4058 0%, #2c5f7e 100%)',
        color: 'white',
        padding: '1.5rem 0',
        marginTop: 'auto',
        borderTop: '3px solid #7cb342'
      }}>
        <div className="container text-center">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            <i className="bi bi-hospital" style={{ fontSize: '1.25rem' }}></i>
            <span className="fw-semibold">Geriátrico Manager</span>
          </div>
          <small style={{ opacity: 0.85 }}>
            &copy; {new Date().getFullYear()} Todos los derechos reservados
          </small>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
