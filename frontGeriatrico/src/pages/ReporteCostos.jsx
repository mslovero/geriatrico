import React, { useState, useEffect } from "react";
import { get } from "../api/api";
import PatientSelect from "../components/PatientSelect";
import { 
  CashStack, 
  FileEarmarkBarGraph, 
  PieChart, 
  CalendarRange,
  Download
} from "react-bootstrap-icons";

export default function ReporteCostos() {
  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [reportePaciente, setReportePaciente] = useState(null);
  const [topMedicamentos, setTopMedicamentos] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar resumen general al montar
  useEffect(() => {
    fetchResumenGeneral();
  }, []);

  const fetchResumenGeneral = async () => {
    try {
      setLoading(true);
      const res = await get("/reportes/resumen-general");
      setResumenGeneral(res);
    } catch (error) {
      console.error("Error loading resumen general:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportePaciente = async () => {
    if (!selectedPaciente) return;
    
    try {
      setLoading(true);
      let url = `/reportes/consumo-paciente/${selectedPaciente}`;
      if (fechaDesde) url += `?fecha_desde=${fechaDesde}`;
      if (fechaHasta) url += `${fechaDesde ? '&' : '?'}fecha_hasta=${fechaHasta}`;
      
      const res = await get(url);
      setReportePaciente(res);
    } catch (error) {
      console.error("Error loading reporte paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopMedicamentos = async () => {
    try {
      setLoading(true);
      let url = "/reportes/top-medicamentos?limite=10";
      if (fechaDesde) url += `&fecha_desde=${fechaDesde}`;
      if (fechaHasta) url += `&fecha_hasta=${fechaHasta}`;
      
      const res = await get(url);
      setTopMedicamentos(res.top_medicamentos || []);
    } catch (error) {
      console.error("Error loading top medicamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPaciente) {
      fetchReportePaciente();
    }
  }, [selectedPaciente, fechaDesde, fechaHasta]);

  useEffect(() => {
    fetchTopMedicamentos();
  }, [fechaDesde, fechaHasta]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient mb-2">💰 Reportes de Costos</h1>
          <p className="text-muted mb-0">
            Análisis detallado de costos de medicamentos e insumos
          </p>
        </div>
      </div>

      {/* Filtros de Fecha */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">
                <CalendarRange className="me-2" />
                Fecha Desde
              </label>
              <input
                type="date"
                className="form-control"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">
                <CalendarRange className="me-2" />
                Fecha Hasta
              </label>
              <input
                type="date"
                className="form-control"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">
                Filtrar por Paciente
              </label>
              <PatientSelect
                value={selectedPaciente}
                onChange={(e) => setSelectedPaciente(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFechaDesde("");
                  setFechaHasta("");
                  setSelectedPaciente("");
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      {resumenGeneral && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-shape bg-success bg-opacity-10 text-success rounded-3 p-3 me-3">
                    <CashStack size={24} />
                  </div>
                  <div>
                    <p className="text-muted small mb-0">Stock Geriátrico</p>
                    <h3 className="mb-0 fw-bold">
                      ${parseFloat(resumenGeneral.stock_geriatrico.valor_total || 0).toFixed(2)}
                    </h3>
                  </div>
                </div>
                <div className="d-flex justify-content-between text-sm">
                  <span className="text-muted">Items:</span>
                  <span className="fw-bold">{resumenGeneral.stock_geriatrico.total_items}</span>
                </div>
                <div className="d-flex justify-content-between text-sm">
                  <span className="text-muted">Bajo Stock:</span>
                  <span className="text-warning fw-bold">{resumenGeneral.stock_geriatrico.bajo_stock}</span>
                </div>
                <div className="d-flex justify-content-between text-sm">
                  <span className="text-muted">Próx. Vencer:</span>
                  <span className="text-danger fw-bold">{resumenGeneral.stock_geriatrico.proximos_vencer}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-shape bg-warning bg-opacity-10 text-warning rounded-3 p-3 me-3">
                    <PieChart size={24} />
                  </div>
                  <div>
                    <p className="text-muted small mb-0">Stock Pacientes</p>
                    <h3 className="mb-0 fw-bold">
                      ${parseFloat(resumenGeneral.stock_pacientes.valor_total || 0).toFixed(2)}
                    </h3>
                  </div>
                </div>
                <div className="d-flex justify-content-between text-sm">
                  <span className="text-muted">Items:</span>
                  <span className="fw-bold">{resumenGeneral.stock_pacientes.total_items}</span>
                </div>
                <div className="d-flex justify-content-between text-sm">
                  <span className="text-muted">Pacientes:</span>
                  <span className="fw-bold">{resumenGeneral.stock_pacientes.pacientes_con_stock}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-shape bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3">
                    <FileEarmarkBarGraph size={24} />
                  </div>
                  <div>
                    <p className="text-muted small mb-0">Costos Mes Actual</p>
                    <h3 className="mb-0 fw-bold">
                      ${parseFloat(resumenGeneral.costos_mes_actual || 0).toFixed(2)}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-muted">
                  {resumenGeneral.periodo_actual?.desde} a {resumenGeneral.periodo_actual?.hasta}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Medicamentos */}
      {topMedicamentos.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-0 py-3 px-4">
            <h5 className="mb-0 fw-bold text-primary">
              🏆 Top 10 Medicamentos Más Consumidos
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 border-0">#</th>
                    <th className="border-0">Medicamento</th>
                    <th className="border-0">Tipo</th>
                    <th className="border-0 text-end">Cantidad</th>
                    <th className="border-0 text-end">Veces Usado</th>
                    <th className="border-0 text-end pe-4">Costo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topMedicamentos.map((med, idx) => (
                    <tr key={med.stock_item_id}>
                      <td className="ps-4 fw-bold text-primary">{idx + 1}</td>
                      <td className="fw-bold">{med.nombre}</td>
                      <td>
                        <span className={`badge ${
                          med.tipo === 'medicamento' 
                            ? 'bg-primary' 
                            : 'bg-info'
                        } bg-opacity-10 border`}>
                          {med.tipo}
                        </span>
                      </td>
                      <td className="text-end">
                        {med.cantidad_total} {med.unidad_medida}
                      </td>
                      <td className="text-end">
                        <span className="badge bg-secondary">{med.veces_usado}</span>
                      </td>
                      <td className="text-end pe-4 fw-bold text-success">
                        ${parseFloat(med.costo_total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reporte por Paciente */}
      {reportePaciente && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold text-primary">
                Consumo de {reportePaciente.paciente.nombre}
              </h5>
              <small className="text-muted">
                Período: {reportePaciente.periodo.desde} a {reportePaciente.periodo.hasta}
              </small>
            </div>
            <div className="text-end">
              <h4 className="mb-0 text-success fw-bold">
                ${parseFloat(reportePaciente.total_costo || 0).toFixed(2)}
              </h4>
              <small className="text-muted">{reportePaciente.total_movimientos} movimientos</small>
            </div>
          </div>
          <div className="card-body p-0">
            {reportePaciente.por_item.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 border-0">Medicamento</th>
                      <th className="border-0 text-end">Cantidad</th>
                      <th className="border-0 text-end pe-4">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportePaciente.por_item.map((item) => (
                      <tr key={item.stock_item_id}>
                        <td className="ps-4 fw-bold">{item.nombre}</td>
                        <td className="text-end">
                          {item.cantidad_total} {item.unidad_medida}
                        </td>
                        <td className="text-end pe-4 text-success fw-bold">
                          ${parseFloat(item.costo_total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-muted fst-italic">
                No hay consumos registrados en este período.
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
