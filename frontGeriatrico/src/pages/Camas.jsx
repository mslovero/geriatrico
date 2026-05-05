import React, { useEffect, useState } from 'react';
import CrudView from '../components/CrudView';
import { get } from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  HouseDoor,
  Hospital,
  CheckCircleFill,
  XCircleFill,
  Tools,
  Grid3x3Gap,
  ListUl,
  Search,
  PersonFill
} from 'react-bootstrap-icons';

export default function Camas() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [camas, setCamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'table'
  const [filterEstado, setFilterEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

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

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'administrativo';

  // Estadísticas
  const stats = {
    total: camas.length,
    libres: camas.filter(c => c.estado === 'libre').length,
    ocupadas: camas.filter(c => c.estado === 'ocupada').length,
    mantenimiento: camas.filter(c => c.estado === 'mantenimiento').length,
    porcentajeOcupacion: camas.length > 0
      ? Math.round((camas.filter(c => c.estado === 'ocupada').length / camas.length) * 100)
      : 0
  };

  // Filtrado
  const camasFiltradas = camas.filter(cama => {
    const matchEstado = filterEstado === 'todos' || cama.estado === filterEstado;
    const matchSearch = searchTerm === '' ||
      cama.numero_cama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cama.habitacion?.numero?.toString().includes(searchTerm);
    return matchEstado && matchSearch;
  });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'libre': return 'success';
      case 'ocupada': return 'danger';
      case 'mantenimiento': return 'warning';
      default: return 'secondary';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'libre': return <CheckCircleFill size={20} />;
      case 'ocupada': return <XCircleFill size={20} />;
      case 'mantenimiento': return <Tools size={20} />;
      default: return null;
    }
  };

  const columns = [
    {
      key: 'habitacion_id',
      label: 'Habitación',
      render: (value, item) => {
        if (!item.habitacion) return `ID: ${value}`;
        return (
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 text-primary rounded-2 p-2">
              <HouseDoor size={18} />
            </div>
            <div>
              <div className="fw-bold">Habitación {item.habitacion.numero}</div>
              <small className="text-muted">Piso {item.habitacion.piso || '1'}</small>
            </div>
          </div>
        );
      }
    },
    {
      key: 'numero_cama',
      label: 'Número de Cama',
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <Hospital size={16} className="text-info" />
          <span className="fw-bold">Cama {value}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => {
        const getEstadoStyle = (estado) => {
          switch(estado) {
            case 'libre':
              return {
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                color: '#198754',
                border: '1px solid #198754'
              };
            case 'ocupada':
              return {
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                border: '1px solid #dc3545'
              };
            case 'mantenimiento':
              return {
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                color: '#ffc107',
                border: '1px solid #ffc107'
              };
            default:
              return {
                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                color: '#6c757d',
                border: '1px solid #6c757d'
              };
          }
        };

        const icon = getEstadoIcon(value);
        const style = getEstadoStyle(value);

        return (
          <div className="d-flex align-items-center">
            <span className="badge px-3 py-2 d-inline-flex align-items-center gap-2" style={{ ...style, whiteSpace: 'nowrap' }}>
              {icon}
              <span className="text-capitalize fw-bold">{value}</span>
            </span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                <Hospital size={32} />
              </div>
              <div>
                <h1 className="fw-bold text-gradient mb-1">Gestión de Camas</h1>
                <p className="text-muted mb-0">Control y administración de ocupación</p>
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
              Vista Gráfica
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
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm bg-primary bg-opacity-10 h-100">
              <div className="card-body p-3 p-md-4 text-center">
                <Hospital size={32} className="text-primary mb-2" />
                <div className="fw-bold text-muted small text-uppercase mb-1">Total Camas</div>
                <div className="display-6 fw-black text-primary">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm bg-success bg-opacity-10 h-100">
              <div className="card-body p-3 p-md-4 text-center">
                <CheckCircleFill size={32} className="text-success mb-2" />
                <div className="fw-bold text-muted small text-uppercase mb-1">Disponibles</div>
                <div className="display-6 fw-black text-success">{stats.libres}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm bg-danger bg-opacity-10 h-100">
              <div className="card-body p-3 p-md-4 text-center">
                <XCircleFill size={32} className="text-danger mb-2" />
                <div className="fw-bold text-muted small text-uppercase mb-1">Ocupadas</div>
                <div className="display-6 fw-black text-danger">{stats.ocupadas}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm bg-warning bg-opacity-10 h-100">
              <div className="card-body p-3 p-md-4 text-center">
                <Tools size={32} className="text-warning mb-2" />
                <div className="fw-bold text-muted small text-uppercase mb-1">Mantenimiento</div>
                <div className="display-6 fw-black text-warning">{stats.mantenimiento}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1">Ocupación General</h6>
                <small className="text-muted">Estado actual de todas las camas</small>
              </div>
              <div className="display-6 fw-black text-primary">{stats.porcentajeOcupacion}%</div>
            </div>
            <div className="progress" style={{ height: '12px' }}>
              <div
                className="progress-bar bg-danger"
                style={{ width: `${(stats.ocupadas / stats.total) * 100}%` }}
                title={`Ocupadas: ${stats.ocupadas}`}
              ></div>
              <div
                className="progress-bar bg-success"
                style={{ width: `${(stats.libres / stats.total) * 100}%` }}
                title={`Libres: ${stats.libres}`}
              ></div>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${(stats.mantenimiento / stats.total) * 100}%` }}
                title={`Mantenimiento: ${stats.mantenimiento}`}
              ></div>
            </div>
            <div className="d-flex gap-4 mt-3 flex-wrap">
              <small className="d-flex align-items-center gap-2">
                <span className="badge bg-danger" style={{ width: '12px', height: '12px' }}></span>
                Ocupadas ({stats.ocupadas})
              </small>
              <small className="d-flex align-items-center gap-2">
                <span className="badge bg-success" style={{ width: '12px', height: '12px' }}></span>
                Disponibles ({stats.libres})
              </small>
              <small className="d-flex align-items-center gap-2">
                <span className="badge bg-warning" style={{ width: '12px', height: '12px' }}></span>
                Mantenimiento ({stats.mantenimiento})
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                <Search size={14} className="me-1" />
                Buscar
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por habitación o número de cama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-uppercase fw-bold text-muted mb-2">
                Filtrar por Estado
              </label>
              <select
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="libre">Disponibles</option>
                <option value="ocupada">Ocupadas</option>
                <option value="mantenimiento">En Mantenimiento</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 w-100 text-center">
                Mostrando {camasFiltradas.length} de {camas.length} camas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="row g-4">
          {habitaciones.map(habitacion => {
            const camasHabitacion = camasFiltradas.filter(c => c.habitacion_id === habitacion.id);
            if (camasHabitacion.length === 0 && filterEstado !== 'todos') return null;

            return (
              <div key={habitacion.id} className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-3 px-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-2 p-2">
                        <HouseDoor size={24} />
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="mb-0 fw-bold">Habitación {habitacion.numero}</h5>
                        <small className="text-muted">
                          Capacidad: {habitacion.capacidad} camas |
                          Ocupadas: {camas.filter(c => c.habitacion_id === habitacion.id && c.estado === 'ocupada').length}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {camas
                        .filter(c => c.habitacion_id === habitacion.id)
                        .map(cama => {
                          const color = getEstadoColor(cama.estado);
                          const icon = getEstadoIcon(cama.estado);

                          return (
                            <div key={cama.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                              <div className={`bed-card card border-2 border-${color} h-100 cursor-pointer hover-lift`}
                                   style={{ transition: 'all 0.3s ease' }}>
                                <div className="card-body p-3 text-center">
                                  <div className={`bg-${color} bg-opacity-10 rounded-3 p-3 mb-2`}>
                                    <Hospital size={32} className={`text-${color}`} />
                                  </div>
                                  <div className="fw-bold mb-1">Cama {cama.numero_cama}</div>
                                  <div className={`d-flex align-items-center justify-content-center gap-1 small text-${color} fw-bold`}>
                                    {icon}
                                    <span className="text-capitalize">{cama.estado}</span>
                                  </div>
                                  {cama.paciente && (
                                    <div className="mt-2 pt-2 border-top">
                                      <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                                        <PersonFill size={12} />
                                        Ocupado
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <CrudView
          endpoint="/camas"
          columns={columns}
          title=""
          canCreate={canManage}
          canEdit={canManage}
          canDelete={user?.role === 'admin'}
          formFields={[
            { key: 'habitacion_id', colSize: 12 },
            { key: 'numero_cama', colSize: 6 },
            { key: 'estado', colSize: 6 }
          ]}
          customFields={{
            habitacion_id: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <HouseDoor size={16} className="me-2" />
                  Habitación
                </label>
                <select name={name} value={value || ""} onChange={onChange} className={className} required>
                  <option value="">Seleccionar habitación</option>
                  {habitaciones.map((habitacion) => (
                    <option key={habitacion.id} value={habitacion.id}>
                      Habitación {habitacion.numero} (Capacidad: {habitacion.capacidad})
                    </option>
                  ))}
                </select>
              </div>
            ),
            numero_cama: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <Hospital size={16} className="me-2" />
                  Número de Cama
                </label>
                <input
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  required
                  placeholder="Ej: A, B, 1, 2"
                />
              </div>
            ),
            estado: ({ name, value, onChange, className }) => (
              <div>
                <label className="form-label required">
                  <CheckCircleFill size={16} className="me-2" />
                  Estado
                </label>
                <select name={name} value={value || ""} onChange={onChange} className={className} required>
                  <option value="">Seleccionar estado</option>
                  {['libre', 'ocupada', 'mantenimiento'].map((estado) => (
                    <option key={estado} value={estado}>
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ),
          }}
        />
      )}
    </div>
  );
}
