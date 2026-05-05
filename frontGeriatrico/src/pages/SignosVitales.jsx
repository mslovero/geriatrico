import React, { useState, useEffect } from "react";
import CrudView from "../components/CrudView";
import PatientSelect from "../components/PatientSelect";
import VitalSignsChart from "../components/VitalSignsChart";
import { useAuth } from "../context/AuthContext";
import { get } from "../api/api";
import {
  GraphUp,
  Thermometer,
  HeartPulse,
  Activity,
  Droplet,
  Wind,
  PersonBadge
} from "react-bootstrap-icons";

export default function SignosVitales() {
  const { user } = useAuth();
  const [selectedPatientChart, setSelectedPatientChart] = useState("");
  const canManage =
    user?.role === "admin" ||
    user?.role === "medico" ||
    user?.role === "enfermero";
  const canDelete = user?.role === "admin";
  const [enfermeros, setEnfermeros] = useState([]);

  React.useEffect(() => {
    const fetchEnfermeros = async () => {
      try {
        const [resEnfermeros, resMedicos] = await Promise.all([
          get("/users?role=enfermero"),
          get("/users?role=medico"),
        ]);
        const lista = [
          ...(Array.isArray(resEnfermeros) ? resEnfermeros : []),
          ...(Array.isArray(resMedicos) ? resMedicos : []),
        ];
        setEnfermeros(lista);
      } catch (error) {
        console.error("Error cargando personal:", error);
      }
    };
    fetchEnfermeros();
  }, []);

  const getRangeColor = (valor, min, max) => {
    if (!valor || valor === '-' || valor === '') return 'secondary';
    const numValor = parseFloat(valor);
    if (numValor < min) return 'info';
    if (numValor > max) return 'danger';
    return 'success';
  };

  const getRangeIcon = (valor, min, max) => {
    const color = getRangeColor(valor, min, max);
    if (color === 'danger') return '⚠️';
    if (color === 'info') return '❄️';
    return '✓';
  };

  const columns = [
    {
      key: "paciente_id",
      label: "Paciente",
      render: (value, item) => {
        if (!item.paciente) return `ID: ${value}`;
        return (
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-premium bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
              {item.paciente.nombre[0]}{item.paciente.apellido[0]}
            </div>
            <span className="fw-medium">{item.paciente.nombre} {item.paciente.apellido}</span>
          </div>
        );
      },
    },
    {
      key: "fecha",
      label: "Fecha y Hora",
      render: (value) => {
        const fecha = new Date(value);
        return (
          <div>
            <div className="fw-bold text-primary-color">{fecha.toLocaleDateString("es-AR")}</div>
            <small className="text-muted-color">{fecha.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
        );
      }
    },
    {
      key: "presion_arterial",
      label: "Presión",
      render: (value) => {
        if (!value) return '-';
        // Asumimos formato "120/80"
        const [sistolica] = value.split('/').map(v => parseFloat(v));
        const color = getRangeColor(sistolica, 90, 140);
        const icon = getRangeIcon(sistolica, 90, 140);
        return (
          <div className="d-flex align-items-center gap-2">
            <Activity size={16} className={`text-${color}`} />
            <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color}`}>
              {icon} {value} mmHg
            </span>
          </div>
        );
      }
    },
    {
      key: "temperatura",
      label: "Temperatura",
      render: (value) => {
        if (!value) return '-';
        const color = getRangeColor(value, 36, 37.5);
        const icon = getRangeIcon(value, 36, 37.5);
        return (
          <div className="d-flex align-items-center gap-2">
            <Thermometer size={16} className={`text-${color}`} />
            <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color}`}>
              {icon} {value}°C
            </span>
          </div>
        );
      }
    },
    {
      key: "frecuencia_cardiaca",
      label: "Pulso",
      render: (value) => {
        if (!value) return '-';
        const color = getRangeColor(value, 60, 100);
        const icon = getRangeIcon(value, 60, 100);
        return (
          <div className="d-flex align-items-center gap-2">
            <HeartPulse size={16} className={`text-${color}`} />
            <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color}`}>
              {icon} {value} bpm
            </span>
          </div>
        );
      }
    },
    {
      key: "saturacion_oxigeno",
      label: "Sat O₂",
      render: (value) => {
        if (!value) return '-';
        const color = getRangeColor(value, 94, 100);
        const icon = getRangeIcon(value, 94, 100);
        return (
          <div className="d-flex align-items-center gap-2">
            <Wind size={16} className={`text-${color}`} />
            <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color}`}>
              {icon} {value}%
            </span>
          </div>
        );
      }
    },
    {
      key: "glucosa",
      label: "Glucosa",
      render: (value) => {
        if (!value) return '-';
        const color = getRangeColor(value, 70, 140);
        const icon = getRangeIcon(value, 70, 140);
        return (
          <div className="d-flex align-items-center gap-2">
            <Droplet size={16} className={`text-${color}`} />
            <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color}`}>
              {icon} {value} mg/dL
            </span>
          </div>
        );
      }
    },
    {
      key: "registrado_por",
      label: "Registrado Por",
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <PersonBadge size={14} className="text-info" />
          <small className="text-muted">{value}</small>
        </div>
      )
    },
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-6 mb-3 mb-md-0">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-2 fw-bold">
              <Activity size={14} className="me-2" />
              Monitoreo Continuo
            </span>
            <h1 className="fw-bold text-gradient mb-2">
              <Activity size={36} className="me-2" />
              Signos Vitales
            </h1>
            <p className="text-muted mb-0">
              Monitoreo y evolución de la salud de los pacientes en tiempo real
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm bg-gradient-primary text-white p-3">
            <label className="fw-bold mb-2 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
              <GraphUp size={16} className="me-2" />
              Analizar Tendencia del Paciente
            </label>
            <PatientSelect
              value={selectedPatientChart}
              onChange={(e) => setSelectedPatientChart(e.target.value)}
              className="form-select bg-white"
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      {selectedPatientChart && (
        <div className="mb-4 animate-slide-up">
          <VitalSignsChart pacienteId={selectedPatientChart} />
        </div>
      )}

      {/* Info Cards de Rangos Normales */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10 h-100">
            <div className="card-body p-3 text-center">
              <Activity size={24} className="text-success mb-2" />
              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Presión</div>
              <div className="fw-bold text-success">90-140 mmHg</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10 h-100">
            <div className="card-body p-3 text-center">
              <Thermometer size={24} className="text-success mb-2" />
              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Temp.</div>
              <div className="fw-bold text-success">36-37.5°C</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10 h-100">
            <div className="card-body p-3 text-center">
              <HeartPulse size={24} className="text-success mb-2" />
              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Pulso</div>
              <div className="fw-bold text-success">60-100 bpm</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10 h-100">
            <div className="card-body p-3 text-center">
              <Wind size={24} className="text-success mb-2" />
              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Sat O₂</div>
              <div className="fw-bold text-success">94-100%</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10 h-100">
            <div className="card-body p-3 text-center">
              <Droplet size={24} className="text-success mb-2" />
              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Glucosa</div>
              <div className="fw-bold text-success">70-140 mg/dL</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm bg-info bg-opacity-10 h-100">
            <div className="card-body p-3 text-center">
              <Activity size={24} className="text-info mb-2" />
              <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Leyenda</div>
              <div className="small">
                <span className="text-success">✓</span> Normal
                <span className="text-danger ms-1">⚠️</span> Alto
                <span className="text-info ms-1">❄️</span> Bajo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRUD Table */}
      <CrudView
        endpoint="/signos-vitales"
        columns={columns}
        title="Registro de Signos Vitales"
        canCreate={canManage}
        canEdit={canManage}
        canDelete={canDelete}
        formFields={[
          { key: 'paciente_id', colSize: 12 },
          { key: 'fecha', colSize: 6 },
          { key: 'registrado_por', colSize: 6 },
          { key: 'presion_arterial', colSize: 6 },
          { key: 'temperatura', colSize: 6 },
          { key: 'frecuencia_cardiaca', colSize: 6 },
          { key: 'saturacion_oxigeno', colSize: 6 },
          { key: 'glucosa', colSize: 6 },
          { key: 'observaciones', colSize: 12 }
        ]}
        customFields={{
          paciente_id: (props) => (
            <div>
              <label className="form-label required">
                <PersonBadge size={16} className="me-2" />
                Paciente
              </label>
              <PatientSelect {...props} />
            </div>
          ),
          fecha: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label required">
                <Activity size={16} className="me-2" />
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                name={name}
                value={value}
                onChange={onChange}
                className={className}
                required
                max={new Date().toISOString().slice(0, 16)}
              />
            </div>
          ),
          registrado_por: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label required">
                <PersonBadge size={16} className="me-2" />
                Registrado Por
              </label>
              <select
                name={name}
                value={value}
                onChange={onChange}
                className={className}
                required
              >
                <option value="">Seleccionar responsable...</option>
                {enfermeros.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          ),
          presion_arterial: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label">
                <Activity size={16} className="me-2" />
                Presión Arterial
              </label>
              <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder="Ej: 120/80"
                pattern="[0-9]{2,3}/[0-9]{2,3}"
                title="Formato: 120/80"
              />
              <small className="text-muted d-block mt-1">
                <span className="text-success fw-bold">Normal:</span> 90-140 / 60-90 mmHg
              </small>
            </div>
          ),
          temperatura: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label">
                <Thermometer size={16} className="me-2" />
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder="36.5"
                min="30"
                max="45"
              />
              <small className="text-muted d-block mt-1">
                <span className="text-success fw-bold">Normal:</span> 36-37.5°C |
                <span className="text-danger fw-bold ms-1">Fiebre:</span> &gt;38°C
              </small>
            </div>
          ),
          frecuencia_cardiaca: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label">
                <HeartPulse size={16} className="me-2" />
                Frecuencia Cardíaca (bpm)
              </label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder="80"
                min="30"
                max="200"
              />
              <small className="text-muted d-block mt-1">
                <span className="text-success fw-bold">Normal:</span> 60-100 bpm
              </small>
            </div>
          ),
          saturacion_oxigeno: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label">
                <Wind size={16} className="me-2" />
                Saturación de Oxígeno (%)
              </label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder="98"
                min="70"
                max="100"
              />
              <small className="text-muted d-block mt-1">
                <span className="text-success fw-bold">Normal:</span> 94-100% |
                <span className="text-danger fw-bold ms-1">Crítico:</span> &lt;90%
              </small>
            </div>
          ),
          glucosa: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label">
                <Droplet size={16} className="me-2" />
                Glucosa (mg/dL)
              </label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder="100"
                min="30"
                max="400"
              />
              <small className="text-muted d-block mt-1">
                <span className="text-success fw-bold">Normal:</span> 70-140 mg/dL |
                <span className="text-danger fw-bold ms-1">Hipoglucemia:</span> &lt;70
              </small>
            </div>
          ),
          observaciones: ({ name, value, onChange, className }) => (
            <div>
              <label className="form-label">
                <Activity size={16} className="me-2" />
                Observaciones
              </label>
              <textarea
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                rows="3"
                placeholder="Notas adicionales sobre el estado del paciente..."
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
