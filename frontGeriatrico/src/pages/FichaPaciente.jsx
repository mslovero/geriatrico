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
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!paciente)
    return (
      <div className="text-center mt-5 text-danger fw-bold">Paciente no encontrado</div>
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
    <div className="container-fluid py-4 ficha-medica">
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <button className="btn btn-light text-primary shadow-sm" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i> Volver
        </button>
        <button className="btn btn-primary shadow-sm" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i> Imprimir Ficha
        </button>
      </div>

      <div className="card border-0 shadow-lg mb-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-bottom pb-4 mb-4">
            <div className="d-flex align-items-center mb-3 mb-md-0">
              <div className="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center me-4 shadow-md flex-shrink-0" style={{width: '80px', height: '80px'}}>
                 <span className="display-6 fw-bold">{paciente.nombre.charAt(0)}</span>
              </div>
              <div>
                <h1 className="h2 mb-1 fw-bold text-dark text-nowrap">
                    {paciente.nombre} {paciente.apellido}
                </h1>
                <div className="d-flex flex-wrap align-items-center gap-3 text-muted">
                    <span><i className="bi bi-person-vcard me-1"></i> DNI: {paciente.dni}</span>
                    <span><i className="bi bi-cake2 me-1"></i> {formatDate(paciente.fecha_nacimiento)}</span>
                </div>
              </div>
            </div>
            <div className="text-start text-md-end w-100 w-md-auto ps-5 ps-md-0 ms-4 ms-md-0">
              <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-2">
                 Ficha Médica Digital
              </div>
              <div className="small text-muted">
                Actualizado: {new Date().toLocaleDateString("es-AR")}
              </div>
            </div>
          </div>

          <div className="row g-3 justify-content-center">
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100 text-center">
                  <small className="text-uppercase text-muted fw-bold d-block mb-1">Ubicación</small>
                  <div className="fw-bold text-dark fs-5">
                      Habitación {paciente.habitacion?.numero || "-"} <br/>
                      <span className="text-muted fs-6">Cama {paciente.cama?.numero || paciente.cama_id || "-"}</span>
                  </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100 text-center">
                  <small className="text-uppercase text-muted fw-bold d-block mb-1">Médico Cabecera</small>
                  <div className="fw-bold text-dark">
                      {paciente.medico_cabecera || "-"}
                  </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100 text-center">
                  <small className="text-uppercase text-muted fw-bold d-block mb-1">Contacto Emergencia</small>
                  <div className="d-flex flex-column align-items-center gap-1">
                      <span className="fw-bold text-dark">{paciente.contacto_emergencia?.nombre || "-"}</span>
                      {paciente.contacto_emergencia?.telefono && (
                          <a href={`tel:${paciente.contacto_emergencia.telefono}`} className="btn btn-sm btn-outline-primary rounded-pill mt-1">
                              <i className="bi bi-telephone-fill me-1"></i> {paciente.contacto_emergencia.telefono}
                          </a>
                      )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
          {/* Dieta y Alergias */}
          <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-success bg-opacity-10 text-success p-2 me-2">
                          <i className="bi bi-egg-fried"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Nutrición y Alergias</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                  {dietaActual ? (
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Tipo de Dieta</span>
                        <span className="fw-bold">{dietaActual.tipo}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Consistencia</span>
                        <span className="fw-bold">{dietaActual.consistencia}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Alergias</span>
                        <span className={dietaActual.alergias ? "text-danger fw-bold" : "text-dark"}>
                            {dietaActual.alergias || "Ninguna"}
                        </span>
                      </div>
                      {dietaActual.observaciones && (
                        <div className="mt-2 bg-warning bg-opacity-10 p-3 rounded-3 text-warning-dark border border-warning border-opacity-25">
                          <strong><i className="bi bi-info-circle me-1"></i> Observaciones:</strong><br/>
                          {dietaActual.observaciones}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted mb-0 fst-italic">No hay dieta registrada.</p>
                  )}
                </div>
              </div>
          </div>

          {/* Medicación Actual */}
          <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-info bg-opacity-10 text-info p-2 me-2">
                          <i className="bi bi-capsule"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Medicación Actual</h5>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="ps-4 border-0">Medicamento</th>
                            <th className="border-0">Dosis</th>
                            <th className="border-0">Frecuencia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paciente.medicaciones && paciente.medicaciones.length > 0 ? (
                            paciente.medicaciones.map((med) => (
                              <tr key={med.id}>
                                <td className="ps-4 fw-bold text-primary">{med.nombre}</td>
                                <td>{med.dosis}</td>
                                <td>{med.frecuencia}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center text-muted py-4 fst-italic">
                                Sin medicación activa
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                  </div>
                </div>
              </div>
          </div>
      </div>

      <div className="row g-4 mt-1">
          {/* Últimos Signos Vitales */}
          <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100 break-inside-avoid">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-2 me-2">
                          <i className="bi bi-heart-pulse"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Últimos Signos Vitales</h5>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="ps-4 border-0">Fecha</th>
                            <th className="border-0">P/A</th>
                            <th className="border-0">Pulso</th>
                            <th className="border-0">Temp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paciente.signos_vitales && paciente.signos_vitales.length > 0 ? (
                            paciente.signos_vitales
                              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                              .slice(0, 5)
                              .map((sig) => (
                                <tr key={sig.id}>
                                  <td className="ps-4 text-muted small">{formatDateTime(sig.fecha)}</td>
                                  <td className="fw-bold">{sig.presion_arterial || "-"}</td>
                                  <td>{sig.frecuencia_cardiaca || "-"}</td>
                                  <td>{sig.temperatura || "-"}°C</td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center text-muted py-4 fst-italic">
                                Sin registros recientes
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                  </div>
                </div>
              </div>
          </div>

          {/* Incidencias Recientes */}
          <div className="col-md-6">
             <div className="card border-0 shadow-sm h-100 break-inside-avoid">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-warning bg-opacity-10 text-warning p-2 me-2">
                          <i className="bi bi-exclamation-triangle"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Incidencias Recientes</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                    {paciente.incidencias && paciente.incidencias.length > 0 ? (
                        paciente.incidencias
                          .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
                          .slice(0, 3)
                          .map((inc) => (
                            <div key={inc.id} className="mb-3 pb-3 border-bottom last-border-0">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill">
                                  {inc.tipo}
                                </span>
                                <small className="text-muted">{formatDateTime(inc.fecha_hora)}</small>
                              </div>
                              <p className="mb-1 text-dark small">{inc.descripcion}</p>
                              {inc.acciones_tomadas && (
                                <div className="mt-1 p-2 bg-light rounded small text-muted">
                                  <i className="bi bi-check2-circle me-1"></i> {inc.acciones_tomadas}
                                </div>
                              )}
                            </div>
                          ))
                    ) : (
                        <div className="text-center text-muted py-4 fst-italic">
                            No hay incidencias registradas
                        </div>
                    )}
                </div>
             </div>
          </div>
      </div>

      <div className="row g-4 mt-1">
          {/* Historial Médico */}
          <div className="col-12">
              <div className="card border-0 shadow-sm h-100 break-inside-avoid">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 me-2">
                          <i className="bi bi-file-medical"></i>
                      </div>
                      <h5 className="mb-0 fw-bold">Historial Médico Reciente</h5>
                  </div>
                </div>
                <div className="card-body p-4">
                    {paciente.historial_medico && paciente.historial_medico.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 border-0">Fecha</th>
                                        <th className="border-0">Observación</th>
                                        <th className="border-0">Médico Responsable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paciente.historial_medico
                                        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                        .slice(0, 5)
                                        .map((hist) => (
                                            <tr key={hist.id}>
                                                <td className="ps-4 text-muted small" style={{width: '150px'}}>{formatDate(hist.fecha)}</td>
                                                <td className="fw-bold text-dark">{hist.observacion}</td>
                                                <td className="text-muted small">{hist.medico_responsable || "-"}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-muted py-4 fst-italic">
                            No hay historial médico registrado
                        </div>
                    )}
                </div>
              </div>
          </div>
      </div>

      <style>
        {`
            .last-border-0:last-child { border-bottom: none !important; }
            @media print {
                .no-print { display: none !important; }
                .card { border: 1px solid #ddd !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid; }
                .card-header { background-color: #f8f9fa !important; color: black !important; border-bottom: 2px solid #000 !important; }
                .badge { border: 1px solid #000; color: #000; }
                body { background-color: white !important; -webkit-print-color-adjust: exact; }
                .ficha-medica { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                .bg-light { background-color: #f8f9fa !important; }
            }
        `}
      </style>
    </div>
  );
}
