import React, { useEffect, useState } from "react";
import CrudView from "../components/CrudView";
import { useAuth } from "../context/AuthContext";
import { get } from "../api/api";
import {
  HouseDoor,
  Hospital,
  PeopleFill,
  Grid3x3Gap,
  ListUl,
  Search,
  CheckCircleFill,
  XCircleFill,
  Diagram3,
  DoorClosed,
  Layers,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom";

export default function Habitaciones() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "administrativo";

  const [habitaciones, setHabitaciones] = useState([]);
  const [camas, setCamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPiso, setFilterPiso] = useState('todos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resHabitaciones, resCamas] = await Promise.all([
          get('/habitaciones'),
          get('/camas')
        ]);
        setHabitaciones(resHabitaciones.data || resHabitaciones);
        setCamas(resCamas.data || resCamas);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Estadísticas globales
  const stats = {
    totalHabitaciones: habitaciones.length,
    capacidadTotal: habitaciones.reduce((sum, h) => sum + (h.capacidad || 0), 0),
    camasOcupadas: camas.filter(c => c.estado === 'ocupada').length,
    habitacionesLlenas: habitaciones.filter(h => {
      const camasHab = camas.filter(c => c.habitacion_id === h.id);
      return camasHab.every(c => c.estado === 'ocupada');
    }).length,
    porcentajeOcupacion: camas.length > 0
      ? Math.round((camas.filter(c => c.estado === 'ocupada').length / camas.length) * 100)
      : 0
  };

  // Obtener pisos únicos
  const pisosUnicos = [...new Set(habitaciones.map(h => h.piso || 1))].sort((a, b) => a - b);

  // Filtrado
  const habitacionesFiltradas = habitaciones.filter(hab => {
    const matchSearch = searchTerm === '' ||
      hab.numero?.toString().includes(searchTerm) ||
      hab.piso?.toString().includes(searchTerm);
    const matchPiso = filterPiso === 'todos' || (hab.piso || 1).toString() === filterPiso;
    return matchSearch && matchPiso;
  });

  // Calcular ocupación por habitación
  const getHabitacionData = (habitacion) => {
    const camasHab = camas.filter(c => c.habitacion_id === habitacion.id);
    const ocupadas = camasHab.filter(c => c.estado === 'ocupada').length;
    const libres = camasHab.filter(c => c.estado === 'libre').length;
    const mantenimiento = camasHab.filter(c => c.estado === 'mantenimiento').length;
    const porcentaje = camasHab.length > 0 ? Math.round((ocupadas / camasHab.length) * 100) : 0;

    return {
      totalCamas: camasHab.length,
      ocupadas,
      libres,
      mantenimiento,
      porcentaje,
      estado: porcentaje === 100 ? 'llena' : porcentaje === 0 ? 'vacia' : 'parcial'
    };
  };

  const columns = [
    {
      key: "numero",
      label: "Habitación",
      render: (value, item) => (
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
            <HouseDoor size={24} />
          </div>
          <div>
            <div className="fw-bold fs-5">Habitación {value}</div>
            <small className="text-muted d-flex align-items-center gap-1">
              <Layers size={12} />
              Piso {item.piso || 1}
            </small>
          </div>
        </div>
      )
    },
    {
      key: "capacidad",
      label: "Capacidad",
      render: (value, item) => {
        const data = getHabitacionData(item);
        return (
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Hospital size={18} className="text-info" />
              <span className="fw-bold">{value} camas</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-danger"
                style={{ width: `${(data.ocupadas / value) * 100}%` }}
                title={`Ocupadas: ${data.ocupadas}`}
              ></div>
              <div
                className="progress-bar bg-success"
                style={{ width: `${(data.libres / value) * 100}%` }}
                title={`Libres: ${data.libres}`}
              ></div>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${(data.mantenimiento / value) * 100}%` }}
                title={`Mantenimiento: ${data.mantenimiento}`}
              ></div>
            </div>
            <div className="d-flex gap-3 mt-1">
              <small className="text-success">✓ {data.libres}</small>
              <small className="text-danger">✗ {data.ocupadas}</small>
              {data.mantenimiento > 0 && <small className="text-warning">⚠ {data.mantenimiento}</small>}
            </div>
          </div>
        );
      }
    },
    {
      key: "estado",
      label: "Estado",
      render: (value, item) => {
        const data = getHabitacionData(item);

        if (data.estado === 'llena') {
          return (
            <div className="d-flex align-items-center">
              <span className="badge px-3 py-2 d-inline-flex align-items-center gap-2" style={{
                whiteSpace: 'nowrap',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                border: '1px solid #dc3545'
              }}>
                <XCircleFill size={16} />
                <span className="fw-bold">Completa</span>
              </span>
            </div>
          );
        } else if (data.estado === 'vacia') {
          return (
            <div className="d-flex align-items-center">
              <span className="badge px-3 py-2 d-inline-flex align-items-center gap-2" style={{
                whiteSpace: 'nowrap',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                color: '#198754',
                border: '1px solid #198754'
              }}>
                <CheckCircleFill size={16} />
                <span className="fw-bold">Disponible</span>
              </span>
            </div>
          );
        } else {
          return (
            <div className="d-flex align-items-center">
              <span className="badge px-3 py-2 d-inline-flex align-items-center gap-2" style={{
                whiteSpace: 'nowrap',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                color: '#ffc107',
                border: '1px solid #ffc107'
              }}>
                <Diagram3 size={16} />
                <span className="fw-bold">Parcial ({data.porcentaje}%)</span>
              </span>
            </div>
          );
        }
      }
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 shadow-sm">
                <HouseDoor size={36} />
              </div>
              <div>
                <h1 className="fw-bold text-gradient mb-1">Gestión de Habitaciones</h1>
                <p className="text-muted mb-0">Administración y control de espacios</p>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="btn-group shadow-sm" role="group">
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3Gap size={18} className="me-2" />
              Vista Cards
            </button>
            <button
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('table')}
            >
              <ListUl size={18} className="me-2" />
              Vista Tabla
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-primary rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-primary bg-opacity-15 rounded-circle p-3 position-relative">
                    <DoorClosed size={32} className="text-primary" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Total Habitaciones</div>
                <div className="display-6 fw-black text-primary">{stats.totalHabitaciones}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.1) 0%, rgba(13, 202, 240, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-info rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-info bg-opacity-15 rounded-circle p-3 position-relative">
                    <Hospital size={32} className="text-info" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Capacidad Total</div>
                <div className="display-6 fw-black text-info">{stats.capacidadTotal}</div>
                <small className="text-muted fw-semibold">camas instaladas</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-success rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-success bg-opacity-15 rounded-circle p-3 position-relative">
                    <CheckCircleFill size={32} className="text-success" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Ocupación Global</div>
                <div className="display-6 fw-black text-success">{stats.porcentajeOcupacion}%</div>
                <small className="text-muted fw-semibold">{stats.camasOcupadas} / {stats.capacidadTotal}</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-danger rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-danger bg-opacity-15 rounded-circle p-3 position-relative">
                    <XCircleFill size={32} className="text-danger" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Hab. Completas</div>
                <div className="display-6 fw-black text-danger">{stats.habitacionesLlenas}</div>
                <small className="text-muted fw-semibold">sin disponibilidad</small>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                  <Search size={14} className="me-1" />
                  Buscar Habitación
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Buscar por número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                  <Layers size={14} className="me-1" />
                  Filtrar por Piso
                </label>
                <select
                  className="form-select form-select-lg"
                  value={filterPiso}
                  onChange={(e) => setFilterPiso(e.target.value)}
                >
                  <option value="todos">Todos los pisos</option>
                  {pisosUnicos.map(piso => (
                    <option key={piso} value={piso.toString()}>
                      Piso {piso}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <div className="badge bg-primary bg-opacity-10 text-primary px-4 py-3 w-100 text-center fs-6">
                  <HouseDoor size={18} className="me-2" />
                  {habitacionesFiltradas.length} de {habitaciones.length} habitaciones
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="row g-4">
          {loading ? (
            /* Loading skeleton */
            [...Array(6)].map((_, idx) => (
              <div key={idx} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex gap-3 mb-4">
                      <div className="skeleton-box" style={{ width: '70px', height: '70px', borderRadius: '12px' }}></div>
                      <div className="flex-grow-1">
                        <div className="skeleton-line mb-2" style={{ width: '60%', height: '20px' }}></div>
                        <div className="skeleton-line" style={{ width: '40%', height: '32px' }}></div>
                      </div>
                    </div>
                    <div className="skeleton-line mb-3" style={{ height: '10px' }}></div>
                    <div className="d-flex gap-2">
                      <div className="skeleton-line" style={{ width: '33%', height: '24px' }}></div>
                      <div className="skeleton-line" style={{ width: '33%', height: '24px' }}></div>
                      <div className="skeleton-line" style={{ width: '33%', height: '24px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : habitacionesFiltradas.length === 0 ? (
            /* Empty state */
            <div className="col-12">
              <div className="card border-0 shadow-sm bg-light">
                <div className="card-body py-5 text-center">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-4 mb-3">
                    <Search size={48} />
                  </div>
                  <h5 className="fw-bold text-muted mb-2">No se encontraron habitaciones</h5>
                  <p className="text-muted mb-0">
                    {searchTerm ? 'Intenta ajustar los filtros de búsqueda' : 'No hay habitaciones registradas en el sistema'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            habitacionesFiltradas.map(habitacion => {
            const data = getHabitacionData(habitacion);
            const colorEstado = data.estado === 'llena' ? 'danger' : data.estado === 'vacia' ? 'success' : 'warning';

            return (
              <div key={habitacion.id} className="col-12 col-md-6 col-xl-4">
                <Link to="/camas" className="text-decoration-none">
                  <div className={`room-card card border-0 shadow-lg h-100 overflow-hidden position-relative hover-lift`}
                       style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    {/* Colored Top Border */}
                    <div className={`bg-${colorEstado} position-absolute top-0 start-0 w-100`} style={{ height: '6px' }}></div>

                    <div className="card-body p-4 pt-5">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`bg-${colorEstado} bg-opacity-15 text-${colorEstado} rounded-3 p-3 shadow-sm`}
                               style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HouseDoor size={36} strokeWidth={2} />
                          </div>
                          <div>
                            <div className="text-muted small text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                              Habitación
                            </div>
                            <h2 className="fw-black mb-0 text-primary" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                              {habitacion.numero}
                            </h2>
                            {habitacion.piso && (
                              <small className="text-muted d-flex align-items-center gap-1 mt-1">
                                <Layers size={12} />
                                Piso {habitacion.piso}
                              </small>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`badge bg-${colorEstado} bg-opacity-15 text-${colorEstado} border border-${colorEstado} px-3 py-2`}>
                          {data.estado === 'llena' ? (
                            <>
                              <XCircleFill size={14} className="me-1" />
                              Completa
                            </>
                          ) : data.estado === 'vacia' ? (
                            <>
                              <CheckCircleFill size={14} className="me-1" />
                              Disponible
                            </>
                          ) : (
                            <>
                              <Diagram3 size={14} className="me-1" />
                              {data.porcentaje}%
                            </>
                          )}
                        </div>
                      </div>

                      {/* Capacity Info */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <Hospital size={18} className="text-muted" />
                            <span className="fw-bold">Capacidad: {habitacion.capacidad} camas</span>
                          </div>
                          <span className="badge bg-light text-dark">
                            {data.libres} libres
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress mb-2" style={{ height: '10px', borderRadius: '10px' }}>
                          <div
                            className="progress-bar bg-danger"
                            style={{ width: `${(data.ocupadas / habitacion.capacidad) * 100}%` }}
                          ></div>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${(data.libres / habitacion.capacidad) * 100}%` }}
                          ></div>
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: `${(data.mantenimiento / habitacion.capacidad) * 100}%` }}
                          ></div>
                        </div>

                        {/* Legend */}
                        <div className="d-flex gap-3 flex-wrap">
                          <small className="d-flex align-items-center gap-2">
                            <span className="rounded-circle bg-danger d-inline-block" style={{ width: '10px', height: '10px' }}></span>
                            <span className="text-muted">Ocupadas: <strong className="text-dark">{data.ocupadas}</strong></span>
                          </small>
                          <small className="d-flex align-items-center gap-2">
                            <span className="rounded-circle bg-success d-inline-block" style={{ width: '10px', height: '10px' }}></span>
                            <span className="text-muted">Libres: <strong className="text-dark">{data.libres}</strong></span>
                          </small>
                          {data.mantenimiento > 0 && (
                            <small className="d-flex align-items-center gap-2">
                              <span className="rounded-circle bg-warning d-inline-block" style={{ width: '10px', height: '10px' }}></span>
                              <span className="text-muted">Mant.: <strong className="text-dark">{data.mantenimiento}</strong></span>
                            </small>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                        <small className="text-muted">Ver detalles de camas</small>
                        <div className={`text-${colorEstado}`}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Background Decoration */}
                    <div className={`position-absolute bottom-0 end-0 text-${colorEstado} opacity-5`}
                         style={{ transform: 'translate(20%, 20%)' }}>
                      <HouseDoor size={120} strokeWidth={1} />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
          )}
        </div>
      ) : (
        /* Table View */
        <CrudView
          endpoint="/habitaciones"
          columns={columns}
          title=""
          canCreate={canManage}
          canEdit={canManage}
          canDelete={user?.role === "admin"}
          formFields={[
            { key: 'numero', colSize: 4 },
            { key: 'piso', colSize: 4 },
            { key: 'capacidad', colSize: 4 }
          ]}
          customFields={{
            numero: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <HouseDoor size={16} className="me-2" />
                  Número de Habitación
                </label>
                <input
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: 101, 102, 201"
                />
                <small className="text-muted d-block mt-1">
                  Identificación única de la habitación
                </small>
              </div>
            ),
            piso: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <Layers size={16} className="me-2" />
                  Piso
                </label>
                <input
                  type="number"
                  name={name}
                  value={value || "1"}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: 1, 2, 3"
                  min="1"
                  max="20"
                />
                <small className="text-muted d-block mt-1">
                  Nivel del edificio donde se ubica
                </small>
              </div>
            ),
            capacidad: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <Hospital size={16} className="me-2" />
                  Capacidad (camas)
                </label>
                <input
                  type="number"
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: 2, 4"
                  min="1"
                  max="10"
                />
                <small className="text-muted d-block mt-1">
                  Cantidad de camas que puede alojar
                </small>
              </div>
            ),
          }}
        />
      )}
    </div>
  );
}
