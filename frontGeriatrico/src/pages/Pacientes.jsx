import React, { useEffect, useState } from "react";
import CrudView from "../components/CrudView";
import { useNavigate } from "react-router-dom";
import { get } from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  PersonFill,
  CardText,
  CalendarEvent,
  HouseDoor,
  Hospital,
  FileEarmarkMedical,
  TelephoneFill,
  Activity,
  PeopleFill,
  Grid3x3Gap,
  ListUl,
  Search,
  CheckCircleFill,
  XCircleFill,
  ClockHistory,
  Funnel,
  PersonBadge
} from "react-bootstrap-icons";

export default function Pacientes() {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [camas, setCamas] = useState([]);
  const [camasFiltradas, setCamasFiltradas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterHabitacion, setFilterHabitacion] = useState('todos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resHabitaciones, resCamas, resPacientes] = await Promise.all([
          get("/habitaciones"),
          get("/camas"),
          get("/pacientes")
        ]);
        setHabitaciones(resHabitaciones.data || resHabitaciones);
        setCamas(resCamas.data || resCamas);
        setPacientes(resPacientes.data || resPacientes);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onEditPaciente = (paciente) => {
    setPacienteEditando(paciente);
    if (paciente.habitacion_id && camas.length > 0) {
      const camasFiltradas = camas.filter(
        (cama) =>
          cama.habitacion_id === paciente.habitacion_id &&
          (cama.estado === "libre" || cama.id === paciente.cama_id)
      );
      setCamasFiltradas(camasFiltradas);
    }
  };

  // Estadísticas
  const stats = {
    total: pacientes.length,
    activos: pacientes.filter(p => p.estado === 'activo').length,
    temporales: pacientes.filter(p => p.estado === 'temporal').length,
    altas: pacientes.filter(p => p.estado === 'alta_medica').length,
    sinUbicar: pacientes.filter(p => !p.habitacion_id || !p.cama_id).length
  };

  // Filtrado de pacientes
  const pacientesFiltrados = pacientes.filter(paciente => {
    const matchSearch = searchTerm === '' ||
      paciente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.dni?.toString().includes(searchTerm);
    const matchEstado = filterEstado === 'todos' || paciente.estado === filterEstado;
    const matchHabitacion = filterHabitacion === 'todos' ||
      (paciente.habitacion_id && paciente.habitacion_id.toString() === filterHabitacion);
    return matchSearch && matchEstado && matchHabitacion;
  });

  const getEstadoStyle = (estado) => {
    switch(estado) {
      case 'activo':
        return {
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          color: '#198754',
          border: '1px solid #198754',
          icon: <Activity size={12} />
        };
      case 'temporal':
        return {
          backgroundColor: 'rgba(13, 202, 240, 0.1)',
          color: '#0dcaf0',
          border: '1px solid #0dcaf0',
          icon: <ClockHistory size={12} />
        };
      case 'alta_medica':
        return {
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          color: '#ffc107',
          border: '1px solid #ffc107',
          icon: <CheckCircleFill size={12} />
        };
      case 'fallecido':
        return {
          backgroundColor: 'rgba(33, 37, 41, 0.1)',
          color: '#212529',
          border: '1px solid #212529',
          icon: <XCircleFill size={12} />
        };
      case 'inactivo':
        return {
          backgroundColor: 'rgba(108, 117, 125, 0.1)',
          color: '#6c757d',
          border: '1px solid #6c757d',
          icon: <XCircleFill size={12} />
        };
      default:
        return {
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          color: '#0d6efd',
          border: '1px solid #0d6efd',
          icon: <Activity size={12} />
        };
    }
  };

  const getEstadoBadge = (estado) => {
    const style = getEstadoStyle(estado);
    return (
      <span className="badge px-3 py-2 d-inline-flex align-items-center gap-2" style={{ ...style, whiteSpace: 'nowrap' }}>
        {style.icon}
        <span className="text-capitalize fw-bold">{estado.replace('_', ' ')}</span>
      </span>
    );
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    return Math.floor((hoy - nacimiento) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const columns = [
    {
      key: "nombre",
      label: "Paciente",
      render: (value, item) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="avatar-premium bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
            style={{ width: '45px', height: '45px', fontSize: '16px' }}
          >
            {item.nombre[0]}{item.apellido[0]}
          </div>
          <div>
            <div className="fw-bold text-primary-color">{item.nombre} {item.apellido}</div>
            <small className="text-muted-color">
              <CardText size={12} className="me-1" />
              DNI: {item.dni}
            </small>
          </div>
        </div>
      )
    },
    {
      key: "fecha_nacimiento",
      label: "Edad / F. Nacimiento",
      render: (value) => {
        if (!value) return "-";
        const nacimiento = new Date(value);
        const edad = calcularEdad(value);
        return (
          <div>
            <div className="fw-bold text-primary-color">{edad} años</div>
            <small className="text-muted-color">
              <CalendarEvent size={12} className="me-1" />
              {nacimiento.toLocaleDateString("es-AR")}
            </small>
          </div>
        );
      }
    },
    {
      key: "habitacion_id",
      label: "Ubicación",
      render: (value, item) => {
        if (!item.habitacion && !item.cama) {
          return (
            <span className="badge px-3 py-2" style={{
              backgroundColor: 'rgba(108, 117, 125, 0.1)',
              color: '#6c757d',
              border: '1px solid #6c757d'
            }}>Sin asignar</span>
          );
        }
        return (
          <div>
            {item.habitacion && (
              <div className="d-flex align-items-center gap-2 mb-1">
                <HouseDoor size={14} className="text-primary" />
                <span className="fw-medium">Hab. {item.habitacion.numero}</span>
              </div>
            )}
            {item.cama && (
              <div className="d-flex align-items-center gap-2">
                <Hospital size={14} className="text-info" />
                <span className="small text-muted">Cama {item.cama.numero_cama}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <div className="d-flex align-items-center">
          {getEstadoBadge(value)}
        </div>
      )
    },
    {
      key: "medico_cabecera",
      label: "Médico",
      render: (value) => value ? (
        <div className="d-flex align-items-center gap-2">
          <FileEarmarkMedical size={14} className="text-success" />
          <span className="small">{value}</span>
        </div>
      ) : <span className="text-muted small">-</span>
    },
    {
      key: "contacto_emergencia",
      label: "Contacto Emergencia",
      colSize: 6,
      render: (value) => {
        if (!value || !value.nombre) return <span className="text-muted small">-</span>;
        return (
          <div>
            <div className="d-flex align-items-center gap-2">
              <PersonFill size={14} className="text-warning" />
              <span className="fw-medium small">{value.nombre}</span>
            </div>
            {value.telefono && (
              <div className="d-flex align-items-center gap-2 mt-1">
                <TelephoneFill size={12} className="text-muted" />
                <a href={`tel:${value.telefono}`} className="small text-decoration-none">
                  {value.telefono}
                </a>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: "patologias",
      label: "Patologías",
      colSize: 12,
      render: (value) => {
        if (!value) return <span className="text-muted small">Sin patologías registradas</span>;
        const preview = value.length > 80 ? value.substring(0, 80) + "..." : value;
        return (
          <div className="bg-light bg-opacity-50 p-2 rounded">
            <small className="text-secondary-color">{preview}</small>
          </div>
        );
      }
    },
  ];

  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "administrativo";

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 shadow-sm">
                <PeopleFill size={36} />
              </div>
              <div>
                <h1 className="fw-bold text-gradient mb-1">Gestión de Pacientes</h1>
                <p className="text-muted mb-0">Control integral de residentes</p>
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
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-primary rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-primary bg-opacity-15 rounded-circle p-3 position-relative">
                    <PeopleFill size={28} className="text-primary" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Total Pacientes</div>
                <div className="display-6 fw-black text-primary">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-success rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-success bg-opacity-15 rounded-circle p-3 position-relative">
                    <Activity size={28} className="text-success" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Activos</div>
                <div className="display-6 fw-black text-success">{stats.activos}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.1) 0%, rgba(13, 202, 240, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-info rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-info bg-opacity-15 rounded-circle p-3 position-relative">
                    <ClockHistory size={28} className="text-info" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Temporales</div>
                <div className="display-6 fw-black text-info">{stats.temporales}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-warning rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-warning bg-opacity-15 rounded-circle p-3 position-relative">
                    <CheckCircleFill size={28} className="text-warning" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Alta Médica</div>
                <div className="display-6 fw-black text-warning">{stats.altas}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm bg-gradient h-100 hover-lift" style={{
              background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="card-body p-3 p-md-4 text-center position-relative">
                <div className="position-relative d-inline-flex mb-3">
                  <div className="position-absolute w-100 h-100 bg-danger rounded-circle blur-effect" style={{ opacity: 0.2, filter: 'blur(8px)' }}></div>
                  <div className="bg-danger bg-opacity-15 rounded-circle p-3 position-relative">
                    <XCircleFill size={28} className="text-danger" />
                  </div>
                </div>
                <div className="fw-bold text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>Sin Ubicar</div>
                <div className="display-6 fw-black text-danger">{stats.sinUbicar}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                  <Search size={14} className="me-1" />
                  Buscar Paciente
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                  <Funnel size={14} className="me-1" />
                  Estado
                </label>
                <select
                  className="form-select form-select-lg"
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="temporal">Temporales</option>
                  <option value="alta_medica">Alta Médica</option>
                  <option value="fallecido">Fallecidos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                  <HouseDoor size={14} className="me-1" />
                  Habitación
                </label>
                <select
                  className="form-select form-select-lg"
                  value={filterHabitacion}
                  onChange={(e) => setFilterHabitacion(e.target.value)}
                >
                  <option value="todos">Todas las habitaciones</option>
                  {habitaciones.map(hab => (
                    <option key={hab.id} value={hab.id.toString()}>
                      Habitación {hab.numero}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <div className="badge bg-primary bg-opacity-10 text-primary px-4 py-3 w-100 text-center fs-6">
                  <PersonBadge size={18} className="me-2" />
                  {pacientesFiltrados.length} de {pacientes.length}
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
                      <div className="skeleton-box" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
                      <div className="flex-grow-1">
                        <div className="skeleton-line mb-2" style={{ width: '70%', height: '20px' }}></div>
                        <div className="skeleton-line" style={{ width: '50%', height: '16px' }}></div>
                      </div>
                    </div>
                    <div className="skeleton-line mb-2" style={{ height: '14px' }}></div>
                    <div className="skeleton-line mb-2" style={{ height: '14px' }}></div>
                    <div className="skeleton-line" style={{ width: '60%', height: '14px' }}></div>
                  </div>
                </div>
              </div>
            ))
          ) : pacientesFiltrados.length === 0 ? (
            /* Empty state */
            <div className="col-12">
              <div className="card border-0 shadow-sm bg-light">
                <div className="card-body py-5 text-center">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-4 mb-3">
                    <Search size={48} />
                  </div>
                  <h5 className="fw-bold text-muted mb-2">No se encontraron pacientes</h5>
                  <p className="text-muted mb-0">
                    {searchTerm || filterEstado !== 'todos' || filterHabitacion !== 'todos'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No hay pacientes registrados en el sistema'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            pacientesFiltrados.map(paciente => {
              const edad = calcularEdad(paciente.fecha_nacimiento);
              const estadoStyle = getEstadoStyle(paciente.estado);

              return (
                <div key={paciente.id} className="col-12 col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100 hover-lift" style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderTop: `4px solid ${estadoStyle.color}`
                  }}>
                    <div className="card-body p-4">
                      {/* Header con Avatar */}
                      <div className="d-flex align-items-start gap-3 mb-4">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                          style={{
                            width: '60px',
                            height: '60px',
                            fontSize: '20px',
                            backgroundColor: estadoStyle.backgroundColor,
                            color: estadoStyle.color,
                            border: estadoStyle.border
                          }}
                        >
                          {paciente.nombre[0]}{paciente.apellido[0]}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <h5 className="fw-bold mb-1 text-truncate">
                            {paciente.nombre} {paciente.apellido}
                          </h5>
                          <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                            <CardText size={12} />
                            <span>DNI: {paciente.dni}</span>
                          </div>
                          <div>
                            <span className="badge px-2 py-1 d-inline-flex align-items-center gap-1" style={{
                              ...estadoStyle,
                              fontSize: '0.75rem'
                            }}>
                              {estadoStyle.icon}
                              <span className="text-capitalize">{paciente.estado.replace('_', ' ')}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="row g-3 mb-3">
                        {/* Edad */}
                        {edad && (
                          <div className="col-6">
                            <div className="bg-light bg-opacity-50 rounded-3 p-3">
                              <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                <CalendarEvent size={14} />
                                <span className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Edad</span>
                              </div>
                              <div className="fw-bold text-dark">{edad} años</div>
                            </div>
                          </div>
                        )}

                        {/* Habitación */}
                        <div className="col-6">
                          <div className="bg-light bg-opacity-50 rounded-3 p-3">
                            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                              <HouseDoor size={14} />
                              <span className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Habitación</span>
                            </div>
                            <div className="fw-bold text-dark">
                              {paciente.habitacion ? `Hab. ${paciente.habitacion.numero}` : '-'}
                            </div>
                          </div>
                        </div>

                        {/* Cama */}
                        {paciente.cama && (
                          <div className="col-6">
                            <div className="bg-light bg-opacity-50 rounded-3 p-3">
                              <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                <Hospital size={14} />
                                <span className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Cama</span>
                              </div>
                              <div className="fw-bold text-dark">Cama {paciente.cama.numero_cama}</div>
                            </div>
                          </div>
                        )}

                        {/* Médico */}
                        {paciente.medico_cabecera && (
                          <div className="col-6">
                            <div className="bg-light bg-opacity-50 rounded-3 p-3">
                              <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                <FileEarmarkMedical size={14} />
                                <span className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Médico</span>
                              </div>
                              <div className="fw-bold text-dark text-truncate" title={paciente.medico_cabecera}>
                                {paciente.medico_cabecera}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contacto de Emergencia */}
                      {paciente.contacto_emergencia && paciente.contacto_emergencia.nombre && (
                        <div className="border-top pt-3 mb-3">
                          <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                            <TelephoneFill size={12} />
                            <span className="text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Contacto Emergencia</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <PersonFill size={14} className="text-warning" />
                            <span className="fw-medium small">{paciente.contacto_emergencia.nombre}</span>
                          </div>
                          {paciente.contacto_emergencia.telefono && (
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <TelephoneFill size={12} className="text-muted" />
                              <a href={`tel:${paciente.contacto_emergencia.telefono}`} className="small text-decoration-none">
                                {paciente.contacto_emergencia.telefono}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                          onClick={() => navigate(`/pacientes/${paciente.id}/ficha`)}
                        >
                          <FileEarmarkMedical size={16} />
                          <span>Ver Ficha</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <CrudView
          endpoint="/pacientes"
          columns={columns}
          title=""
          onEdit={onEditPaciente}
          canCreate={canManage}
          canEdit={canManage}
          canDelete={user?.role === "admin"}
          formFields={[
            { key: 'nombre', colSize: 6 },
            { key: 'apellido', colSize: 6 },
            { key: 'dni', colSize: 6 },
            { key: 'fecha_nacimiento', colSize: 6 },
            { key: 'habitacion_id', colSize: 6 },
            { key: 'cama_id', colSize: 6 },
            { key: 'estado', colSize: 6 },
            { key: 'medico_cabecera', colSize: 6 },
            { key: 'contacto_emergencia', colSize: 12 },
            { key: 'patologias', colSize: 12 }
          ]}
          customFields={{
            nombre: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <PersonFill size={16} className="me-2" />
                  Nombre
                </label>
                <input
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: Juan"
                />
              </div>
            ),
            apellido: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <PersonFill size={16} className="me-2" />
                  Apellido
                </label>
                <input
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: Pérez"
                />
              </div>
            ),
            dni: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <CardText size={16} className="me-2" />
                  DNI
                </label>
                <input
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: 12345678"
                  pattern="[0-9]{7,8}"
                  title="Ingrese un DNI válido (7-8 dígitos)"
                />
              </div>
            ),
            fecha_nacimiento: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <CalendarEvent size={16} className="me-2" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            ),
            medico_cabecera: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label">
                  <FileEarmarkMedical size={16} className="me-2" />
                  Médico de Cabecera
                </label>
                <input
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  placeholder="Ej: Dr. López"
                />
              </div>
            ),
            habitacion_id: ({
              name,
              value,
              onChange,
              className,
              form,
              setForm,
            }) => (
              <div>
                <label className="form-label required">
                  <HouseDoor size={16} className="me-2" />
                  Habitación
                </label>
                <select
                  name={name}
                  value={value || ""}
                  onChange={(e) => {
                    onChange(e);
                    const habitacionId = e.target.value;
                    if (habitacionId) {
                      const camasFiltradas = camas.filter(
                        (cama) =>
                          cama.habitacion_id === parseInt(habitacionId) &&
                          (cama.estado === "libre" ||
                            (form && cama.id === form.cama_id))
                      );
                      setCamasFiltradas(camasFiltradas);
                    } else {
                      setCamasFiltradas([]);
                    }
                    if (form && e.target.value !== value) {
                      setForm({
                        ...form,
                        habitacion_id: e.target.value,
                        cama_id: "",
                      });
                    }
                  }}
                  className={className}
                  required
                >
                  <option value="">Seleccionar habitación</option>
                  {habitaciones.map((habitacion) => (
                    <option key={habitacion.id} value={habitacion.id}>
                      Habitación {habitacion.numero} (Capacidad:{" "}
                      {habitacion.capacidad})
                    </option>
                  ))}
                </select>
              </div>
            ),
            cama_id: ({ name, value, onChange, className, form }) => (
              <div>
                <label className="form-label required">
                  <Hospital size={16} className="me-2" />
                  Cama
                </label>
                <select
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  disabled={!form || !form.habitacion_id}
                  required
                >
                  <option value="">
                    {form && form.habitacion_id
                      ? "Seleccionar cama"
                      : "Primero seleccione una habitación"}
                  </option>
                  {camasFiltradas.map((cama) => (
                    <option key={cama.id} value={cama.id}>
                      Cama {cama.numero_cama} ({cama.estado})
                    </option>
                  ))}
                </select>
              </div>
            ),
            estado: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <Activity size={16} className="me-2" />
                  Estado
                </label>
                <select
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  {["activo", "temporal", "alta_medica", "fallecido", "inactivo"].map(
                    (estado) => (
                      <option key={estado} value={estado}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                      </option>
                    )
                  )}
                </select>
              </div>
            ),
            contacto_emergencia: ({ form, setForm }) => {
              if (!form) return null;
              const contacto = form.contacto_emergencia || {};
              return (
                <div>
                  <label className="form-label">
                    <TelephoneFill size={16} className="me-2" />
                    Contacto de Emergencia
                  </label>
                  <div className="card border-0 bg-light p-4 shadow-sm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small text-uppercase fw-bold text-muted">
                          <PersonFill size={14} className="me-1" />
                          Nombre Contacto
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          className="form-control"
                          value={contacto.nombre || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contacto_emergencia: {
                                ...contacto,
                                nombre: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-uppercase fw-bold text-muted">
                          <TelephoneFill size={14} className="me-1" />
                          Teléfono Contacto
                        </label>
                        <input
                          type="text"
                          placeholder="Teléfono"
                          className="form-control"
                          value={contacto.telefono || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              contacto_emergencia: {
                                ...contacto,
                                telefono: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
            patologias: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label">
                  <FileEarmarkMedical size={16} className="me-2" />
                  Patologías
                </label>
                <textarea
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  placeholder="Ingrese las patologías del paciente..."
                  rows="3"
                />
                <small className="text-muted d-block mt-1">
                  Describa las condiciones médicas crónicas o relevantes del paciente
                </small>
              </div>
            ),
          }}
          customActions={(item) => (
            <button
              className="btn btn-sm btn-primary shadow-sm d-inline-flex align-items-center gap-2 hover-lift"
              onClick={() => navigate(`/pacientes/${item.id}/ficha`)}
              title="Ver Ficha Médica Completa"
            >
              <FileEarmarkMedical size={16} />
              <span className="d-none d-lg-inline">Ficha</span>
            </button>
          )}
        />
      )}
    </div>
  );
}
