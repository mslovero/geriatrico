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

      {/* Panel de Salud General - Optimizado Mobile */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-md-4">
          <div className={`card border-0 shadow-sm bg-${salud.color} bg-opacity-10 h-100`}>
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center mb-3">
                <div className={`text-${salud.color} me-3`} style={{ fontSize: '1.5rem' }}>
                  {salud.icono}
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1">Nivel de Salud</p>
                  <h3 className={`mb-0 fw-bold text-${salud.color}`} style={{ fontSize: '1.5rem' }}>
                    {salud.nivel}
                  </h3>
                </div>
              </div>
              <div className="progress mb-2" style={{ height: "6px" }}>
                <div
                  className={`progress-bar bg-${salud.color}`}
                  style={{ width: `${(resumen.correctas / resumen.total) * 100}%` }}
                ></div>
              </div>
              <small className="text-muted d-block">
                {resumen.correctas} de {resumen.total} correctas
                <span className="ms-2 fw-bold">({Math.round((resumen.correctas / resumen.total) * 100)}%)</span>
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm bg-danger bg-opacity-10 h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center mb-3">
                <div className="text-danger me-3" style={{ fontSize: '1.5rem' }}>
                  <XCircle size={28} />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1">Alertas Críticas</p>
                  <h3 className="mb-0 fw-bold text-danger" style={{ fontSize: '1.8rem' }}>
                    {alertas.criticas}
                  </h3>
                </div>
              </div>
              <div className="row g-2 small">
                <div className="col-6">
                  <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Sin Stock</div>
                    <div className="fw-bold text-danger fs-5">{resumen.sin_stock}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Inconsistentes</div>
                    <div className="fw-bold text-danger fs-5">{resumen.inconsistentes}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm bg-warning bg-opacity-10 h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center mb-3">
                <div className="text-warning me-3" style={{ fontSize: '1.5rem' }}>
                  <ExclamationTriangle size={28} />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1">Advertencias</p>
                  <h3 className="mb-0 fw-bold text-warning" style={{ fontSize: '1.8rem' }}>
                    {alertas.advertencias}
                  </h3>
                </div>
              </div>
              <div className="row g-2 small">
                <div className="col-6">
                  <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Sin Vincular</div>
                    <div className="fw-bold text-warning fs-5">{resumen.sin_vincular}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-50 rounded p-2 text-center">
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>Stock Bajo</div>
                    <div className="fw-bold text-warning fs-5">{resumen.stock_bajo}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros - Optimizados para Mobile */}
      <div className="card border-0 shadow-sm mb-4 overflow-hidden">
        <div className="card-body p-3">
          {/* Desktop: Botones horizontales */}
          <div className="d-none d-lg-flex overflow-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="btn-group flex-nowrap" role="group">
              <button
                className={`btn text-nowrap ${filtro === "todos" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFiltro("todos")}
              >
                Todas las Alertas ({alertas.criticas + alertas.advertencias})
              </button>
              <button
                className={`btn text-nowrap ${filtro === "sin_stock" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setFiltro("sin_stock")}
              >
                Sin Stock ({resumen.sin_stock})
              </button>
              <button
                className={`btn text-nowrap ${filtro === "stock_bajo" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => setFiltro("stock_bajo")}
              >
                Stock Bajo ({resumen.stock_bajo})
              </button>
              <button
                className={`btn text-nowrap ${filtro === "sin_vincular" ? "btn-info" : "btn-outline-info"}`}
                onClick={() => setFiltro("sin_vincular")}
              >
                Sin Vincular ({resumen.sin_vincular})
              </button>
              <button
                className={`btn text-nowrap ${filtro === "inconsistentes" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setFiltro("inconsistentes")}
              >
                Inconsistentes ({resumen.inconsistentes})
              </button>
            </div>
          </div>

          {/* Mobile: Dropdown compacto */}
          <div className="d-lg-none">
            <label className="form-label small text-uppercase fw-bold text-muted mb-2">
              <i className="bi bi-funnel me-2"></i>
              Filtrar por:
            </label>
            <select
              className="form-select shadow-sm"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="todos">
                Todas las Alertas ({alertas.criticas + alertas.advertencias})
              </option>
              <option value="sin_stock">
                Sin Stock ({resumen.sin_stock})
              </option>
              <option value="stock_bajo">
                Stock Bajo ({resumen.stock_bajo})
              </option>
              <option value="sin_vincular">
                Sin Vincular ({resumen.sin_vincular})
              </option>
              <option value="inconsistentes">
                Inconsistentes ({resumen.inconsistentes})
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Alertas */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-0 py-3 px-4">
          <h5 className="mb-0 fw-bold text-primary">
            Medicaciones que Requieren Atención
          </h5>
        </div>
        <div className="card-body p-0">
          {/* Vista Desktop */}
          <div className="table-responsive d-none d-lg-block">
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

          {/* Vista Mobile */}
          <div className="d-lg-none">
            {medicacionesFiltradas().length > 0 ? (
              <div className="list-group list-group-flush">
                {medicacionesFiltradas().map((med) => (
                  <div key={med.id} className="list-group-item p-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">{med.nombre}</h6>
                        <div className="small text-muted">{med.paciente}</div>
                      </div>
                      <div>
                        {med.estado === "sin_stock" && <span className="badge bg-danger">Sin Stock</span>}
                        {med.estado === "stock_bajo" && <span className="badge bg-warning text-dark">Stock Bajo</span>}
                        {med.estado === "sin_vincular" && <span className="badge bg-info">Sin Vincular</span>}
                        {med.estado === "inconsistente" && <span className="badge bg-danger">Inconsistente</span>}
                      </div>
                    </div>
                    
                    <div className="row g-2 mb-3">
                      <div className="col-12">
                        <div className="small text-muted text-uppercase fw-bold" style={{fontSize: '0.6rem'}}>Problema</div>
                        <div className="small text-danger">{med.mensaje || med.error_consistencia || "Error desconocido"}</div>
                      </div>
                      <div className="col-12">
                        <div className="small text-muted text-uppercase fw-bold" style={{fontSize: '0.6rem'}}>Sugerencia</div>
                        <div className="small text-primary fw-medium">{med.sugerencia}</div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <div className="small">
                          {med.origen_pago === "geriatrico" && <span className="text-success fw-bold">Geriátrico</span>}
                          {med.origen_pago === "paciente" && <span className="text-warning fw-bold">Paciente</span>}
                        </div>
                        {med.estado === "sin_vincular" && (
                          <Link to="/stock/items" className="btn btn-sm btn-primary">
                            Configurar Stock
                          </Link>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <CheckCircle size={40} className="text-success opacity-25 mb-2" />
                <p className="text-muted">Sin alertas</p>
              </div>
            )}
          </div>
        </div>

      {/* Acciones Rápidas - Optimizado Mobile */}
      <div className="row g-3 g-md-4 mt-3 mt-md-4">
        <div className="col-12 col-sm-6 col-md-4">
          <Link to="/medicamentos/carga" className="card border-0 shadow-sm text-decoration-none hover-lift h-100">
            <div className="card-body p-3 p-md-4 text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <BoxSeam size={28} className="text-primary" />
              </div>
              <h6 className="fw-bold mb-2 text-dark">Cargar Medicamentos</h6>
              <small className="text-muted d-block">Asignar medicamentos a pacientes</small>
            </div>
          </Link>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <Link to="/stock/items" className="card border-0 shadow-sm text-decoration-none hover-lift h-100">
            <div className="card-body p-3 p-md-4 text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <BoxSeam size={28} className="text-success" />
              </div>
              <h6 className="fw-bold mb-2 text-dark">Gestionar Stock</h6>
              <small className="text-muted d-block">Crear y administrar items de stock</small>
            </div>
          </Link>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <Link to="/stock/reportes" className="card border-0 shadow-sm text-decoration-none hover-lift h-100">
            <div className="card-body p-3 p-md-4 text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <BoxSeam size={28} className="text-info" />
              </div>
              <h6 className="fw-bold mb-2 text-dark">Ver Reportes</h6>
              <small className="text-muted d-block">Análisis de costos y consumo</small>
            </div>
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}
