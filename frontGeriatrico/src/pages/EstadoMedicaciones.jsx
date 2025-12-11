import React, { useState, useEffect } from "react";
import { get } from "../api/api";
import { Link } from "react-router-dom";
import { 
  ExclamationTriangle, 
  CheckCircle, 
  XCircle, 
  Link45deg,
  BoxSeam,
  Bullseye
} from "react-bootstrap-icons";

export default function EstadoMedicaciones() {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    fetchEstado();
  }, []);

  const fetchEstado = async () => {
    try {
      setLoading(true);
      const res = await get("/medicamentos/estado");
      setEstado(res);
    } catch (error) {
      console.error("Error loading estado:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!estado) {
    return <div className="alert alert-danger">Error al cargar datos</div>;
  }

  const { resumen, alertas, detalles } = estado;

  const getIndicadorColor = () => {
    if (alertas.criticas > 0) return "danger";
    if (alertas.advertencias > 0) return "warning";
    return "success";
  };

  const getNivelSalud = () => {
    const porcentaje = (resumen.correctas / resumen.total) * 100;
    if (porcentaje >= 90) return { nivel: "Excelente", color: "success", icono: <CheckCircle size={24} /> };
    if (porcentaje >= 70) return { nivel: "Bueno", color: "info", icono: <CheckCircle size={24} /> };
    if (porcentaje >= 50) return { nivel: "Regular", color: "warning", icono: <ExclamationTriangle size={24} /> };
    return { nivel: "Crítico", color: "danger", icono: <XCircle size={24} /> };
  };

  const salud = getNivelSalud();

  const medicacionesFiltradas = () => {
    switch (filtro) {
      case "sin_stock":
        return detalles.sin_stock;
      case "stock_bajo":
        return detalles.stock_bajo;
      case "sin_vincular":
        return detalles.sin_vincular;
      case "inconsistentes":
        return detalles.inconsistentes;
      default:
        return [...detalles.sin_stock, ...detalles.stock_bajo, ...detalles.sin_vincular, ...detalles.inconsistentes];
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient mb-2">
            <i className="bi bi-hospital me-2"></i>Estado de Medicaciones
          </h1>
          <p className="text-muted mb-0">
            Dashboard profesional de control y alertas
          </p>
        </div>
        <button onClick={fetchEstado} className="btn btn-outline-primary">
          <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
        </button>
      </div>

      {/* Panel de Salud General */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className={`card border-0 shadow-sm bg-${salud.color} bg-opacity-10`}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className={`text-${salud.color} me-3`}>
                  {salud.icono}
                </div>
                <div>
                  <p className="text-muted small mb-0">Nivel de Salud</p>
                  <h3 className={`mb-0 fw-bold text-${salud.color}`}>
                    {salud.nivel}
                  </h3>
                </div>
              </div>
              <div className="progress mt-3" style={{ height: "8px" }}>
                <div
                  className={`progress-bar bg-${salud.color}`}
                  style={{ width: `${(resumen.correctas / resumen.total) * 100}%` }}
                ></div>
              </div>
              <small className="text-muted">
                {resumen.correctas} de {resumen.total} correctas
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-danger bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="text-danger me-3">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-muted small mb-0">Alertas Críticas</p>
                  <h3 className="mb-0 fw-bold text-danger">
                    {alertas.criticas}
                  </h3>
                </div>
              </div>
              <div className="mt-2 small">
                <div className="text-muted">
                  Sin Stock: <span className="fw-bold">{resumen.sin_stock}</span>
                </div>
                <div className="text-muted">
                  Inconsistentes: <span className="fw-bold">{resumen.inconsistentes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="text-warning me-3">
                  <ExclamationTriangle size={24} />
                </div>
                <div>
                  <p className="text-muted small mb-0">Advertencias</p>
                  <h3 className="mb-0 fw-bold text-warning">
                    {alertas.advertencias}
                  </h3>
                </div>
              </div>
              <div className="mt-2 small">
                <div className="text-muted">
                  Sin Vincular: <span className="fw-bold">{resumen.sin_vincular}</span>
                </div>
                <div className="text-muted">
                  Stock Bajo: <span className="fw-bold">{resumen.stock_bajo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group w-100" role="group">
            <button
              className={`btn ${filtro === "todos" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFiltro("todos")}
            >
              Todas las Alertas ({alertas.criticas + alertas.advertencias})
            </button>
            <button
              className={`btn ${filtro === "sin_stock" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setFiltro("sin_stock")}
            >
              Sin Stock ({resumen.sin_stock})
            </button>
            <button
              className={`btn ${filtro === "stock_bajo" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setFiltro("stock_bajo")}
            >
              Stock Bajo ({resumen.stock_bajo})
            </button>
            <button
              className={`btn ${filtro === "sin_vincular" ? "btn-info" : "btn-outline-info"}`}
              onClick={() => setFiltro("sin_vincular")}
            >
              Sin Vincular ({resumen.sin_vincular})
            </button>
            <button
              className={`btn ${filtro === "inconsistentes" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setFiltro("inconsistentes")}
            >
              Inconsistentes ({resumen.inconsistentes})
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3 px-4">
          <h5 className="mb-0 fw-bold text-primary">
            Medicaciones que Requieren Atención
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 border-0">Estado</th>
                  <th className="border-0">Medicamento</th>
                  <th className="border-0">Paciente</th>
                  <th className="border-0">Origen Pago</th>
                  <th className="border-0">Problema</th>
                  <th className="border-0 pe-4">Sugerencia</th>
                </tr>
              </thead>
              <tbody>
                {medicacionesFiltradas().length > 0 ? (
                  medicacionesFiltradas().map((med) => (
                    <tr key={med.id}>
                      <td className="ps-4">
                        {med.estado === "sin_stock" && (
                          <span className="badge bg-danger">
                            <XCircle size={14} className="me-1" />
                            Sin Stock
                          </span>
                        )}
                        {med.estado === "stock_bajo" && (
                          <span className="badge bg-warning text-dark">
                            <ExclamationTriangle size={14} className="me-1" />
                            Stock Bajo
                          </span>
                        )}
                        {med.estado === "sin_vincular" && (
                          <span className="badge bg-info">
                            <Link45deg size={14} className="me-1" />
                            Sin Vincular
                          </span>
                        )}
                        {med.estado === "inconsistente" && (
                          <span className="badge bg-danger">
                            <XCircle size={14} className="me-1" />
                            Inconsistente
                          </span>
                        )}
                        {med.estado === "error" && (
                          <span className="badge bg-dark">
                            <XCircle size={14} className="me-1" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="fw-bold">{med.nombre}</td>
                      <td className="text-muted small">{med.paciente}</td>
                      <td>
                        {med.origen_pago === "geriatrico" && (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success">
                            <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i> Geriátrico
                          </span>
                        )}
                        {med.origen_pago === "paciente" && (
                          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                            <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i> Paciente
                          </span>
                        )}
                        {med.origen_pago === "obra_social" && (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary">
                            <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i> Obra Social
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="small">
                          {med.mensaje && <div className="text-danger fw-bold">{med.mensaje}</div>}
                          {med.error_consistencia && (
                            <div className="text-danger">{med.error_consistencia}</div>
                          )}
                          {med.stock_actual !== undefined && (
                            <div className="text-muted">Stock actual: {med.stock_actual}</div>
                          )}
                        </div>
                      </td>
                      <td className="pe-4">
                        <div className="small">
                          {med.sugerencia && (
                            <div className="text-primary">
                              <Bullseye size={14} className="me-1" />
                              {med.sugerencia}
                            </div>
                          )}
                          {med.estado === "sin_vincular" && (
                            <Link to="/stock/items" className="btn btn-sm btn-outline-primary mt-1">
                              <BoxSeam size={14} className="me-1" />
                              Crear Stock
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <CheckCircle size={48} className="text-success mb-3" />
                      <div className="fw-bold text-success">
                        ¡Todo Perfecto!
                      </div>
                      <div className="text-muted small">
                        No hay medicaciones que requieran atención
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <Link to="/medicamentos/carga" className="card border-0 shadow-sm text-decoration-none hover-lift">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <BoxSeam size={32} />
              </div>
              <h6 className="fw-bold">Cargar Medicamentos</h6>
              <small className="text-muted">Asignar medicamentos a pacientes</small>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/stock/items" className="card border-0 shadow-sm text-decoration-none hover-lift">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <BoxSeam size={32} />
              </div>
              <h6 className="fw-bold">Gestionar Stock</h6>
              <small className="text-muted">Crear y administrar items de stock</small>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/stock/reportes" className="card border-0 shadow-sm text-decoration-none hover-lift">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <BoxSeam size={32} />
              </div>
              <h6 className="fw-bold">Ver Reportes</h6>
              <small className="text-muted">Análisis de costos y consumo</small>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
