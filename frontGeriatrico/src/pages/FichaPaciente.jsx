import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get } from "../api/api";

export default function FichaPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const res = await get(`/pacientes/${id}`);
        setPaciente(res.data || res);
      } catch (error) {
        console.error("Error cargando paciente:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaciente();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!paciente)
    return (
      <div className="text-center mt-5 text-danger">Paciente no encontrado</div>
    );

  // Helper para fechas
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("es-AR") : "-";
  const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString("es-AR") : "-";

  // Obtener la dieta más reciente
  const dietaActual =
    paciente.dietas && paciente.dietas.length > 0
      ? paciente.dietas.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        )[0]
      : null;

  return (
    <div className="container my-4 ficha-medica">
      <div className="d-flex justify-content-between mb-4 no-print">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i> Volver
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i> Imprimir / Guardar PDF
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <div>
              <h1 className="h2 mb-0 fw-bold text-primary">
                {paciente.nombre} {paciente.apellido}
              </h1>
              <p className="text-muted mb-0">DNI: {paciente.dni}</p>
            </div>
            <div className="text-end">
              <h5 className="mb-0">Ficha Médica</h5>
              <small className="text-muted">
                Generado: {new Date().toLocaleDateString("es-AR")}
              </small>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <strong>Fecha de Nacimiento:</strong>
              <br />
              {formatDate(paciente.fecha_nacimiento)}
            </div>
            <div className="col-md-3">
              <strong>Habitación / Cama:</strong>
              <br />
              {paciente.habitacion?.numero || "-"} /{" "}
              {paciente.cama?.numero || "-"}
            </div>
            <div className="col-md-3">
              <strong>Médico de Cabecera:</strong>
              <br />
              {paciente.medico_cabecera || "-"}
            </div>
            <div className="col-md-3">
              <strong>Contacto Emergencia:</strong>
              <br />
              {paciente.contacto_emergencia?.nombre} (
              {paciente.contacto_emergencia?.telefono})
            </div>
          </div>
        </div>
      </div>

      {/* Dieta y Alergias */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-success text-white fw-bold">
          <i className="bi bi-egg-fried me-2"></i> Nutrición y Alergias
        </div>
        <div className="card-body">
          {dietaActual ? (
            <div className="row">
              <div className="col-md-4">
                <strong>Tipo de Dieta:</strong> {dietaActual.tipo}
              </div>
              <div className="col-md-4">
                <strong>Consistencia:</strong> {dietaActual.consistencia}
              </div>
              <div className="col-md-4">
                <strong>Alergias:</strong>
                {dietaActual.alergias ? (
                  <span className="text-danger fw-bold ms-1">
                    {dietaActual.alergias}
                  </span>
                ) : (
                  " Ninguna"
                )}
              </div>
              {dietaActual.observaciones && (
                <div className="col-12 mt-2">
                  <strong>Observaciones:</strong> {dietaActual.observaciones}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted mb-0">No hay dieta registrada.</p>
          )}
        </div>
      </div>

      {/* Medicación Actual */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-info text-white fw-bold">
          <i className="bi bi-capsule me-2"></i> Medicación Actual
        </div>
        <div className="card-body p-0">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Próxima Dosis</th>
              </tr>
            </thead>
            <tbody>
              {paciente.medicaciones && paciente.medicaciones.length > 0 ? (
                paciente.medicaciones.map((med) => (
                  <tr key={med.id}>
                    <td>{med.nombre}</td>
                    <td>{med.dosis}</td>
                    <td>{med.frecuencia}</td>
                    <td>{formatDateTime(med.proxima_dosis)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    Sin medicación activa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimos Signos Vitales (Top 5) */}
      <div className="card border-0 shadow-sm mb-4 break-inside-avoid">
        <div className="card-header bg-warning text-dark fw-bold">
          <i className="bi bi-heart-pulse me-2"></i> Últimos Signos Vitales
        </div>
        <div className="card-body p-0">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Presión</th>
                <th>Pulso</th>
                <th>Temp</th>
                <th>Sat O2</th>
              </tr>
            </thead>
            <tbody>
              {paciente.signos_vitales && paciente.signos_vitales.length > 0 ? (
                paciente.signos_vitales
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .slice(0, 5)
                  .map((sig) => (
                    <tr key={sig.id}>
                      <td>{formatDateTime(sig.fecha)}</td>
                      <td>{sig.presion_arterial || "-"}</td>
                      <td>{sig.frecuencia_cardiaca || "-"}</td>
                      <td>{sig.temperatura || "-"}</td>
                      <td>{sig.saturacion_oxigeno || "-"}%</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Sin registros recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incidencias Recientes */}
      {paciente.incidencias && paciente.incidencias.length > 0 && (
        <div className="card border-0 shadow-sm mb-4 break-inside-avoid">
          <div className="card-header bg-danger text-white fw-bold">
            <i className="bi bi-exclamation-triangle me-2"></i> Incidencias /
            Eventos
          </div>
          <div className="card-body">
            {paciente.incidencias
              .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
              .slice(0, 3)
              .map((inc) => (
                <div key={inc.id} className="mb-3 border-bottom pb-2">
                  <div className="d-flex justify-content-between">
                    <strong>
                      {inc.tipo} ({inc.severidad})
                    </strong>
                    <small>{formatDateTime(inc.fecha_hora)}</small>
                  </div>
                  <p className="mb-1">{inc.descripcion}</p>
                  {inc.acciones_tomadas && (
                    <small className="text-muted">
                      Acción: {inc.acciones_tomadas}
                    </small>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <style>
        {`
                    @media print {
                        .no-print { display: none !important; }
                        .card { border: 1px solid #ddd !important; box-shadow: none !important; margin-bottom: 20px !important; }
                        .card-header { background-color: #f8f9fa !important; color: black !important; border-bottom: 2px solid #000 !important; }
                        .badge { border: 1px solid #000; color: #000; }
                        body { background-color: white !important; }
                        .ficha-medica { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                        .break-inside-avoid { page-break-inside: avoid; }
                    }
                `}
      </style>
    </div>
  );
}
