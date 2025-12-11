import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PatientSelect from "../components/PatientSelect";
import { post } from "../api/api";
import { showSuccess, showConfirm, handleApiError } from "../utils/alerts";
import { Trash3, PlusCircle, Save } from "react-bootstrap-icons";

export default function CargaMedicamentos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get("paciente_id");

  const [pacienteId, setPacienteId] = useState(initialPatientId || "");
  const [medicamentos, setMedicamentos] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    dosis: "",
    frecuencia: "",
    tipo: "diaria",
    cantidad_mensual: "",
    fecha_inicio: "",
    fecha_fin: "",
    observaciones: "",
    origen_pago: "geriatrico",
    stock_item_id: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Cargar stock items cuando cambia el origen de pago o paciente
  useEffect(() => {
    const fetchStockItems = async () => {
      if (!pacienteId) return;
      
      try {
        let url = "/stock-items?activo=1";
        
        // Filtrar según origen de pago
        if (form.origen_pago === "geriatrico") {
          url += "&propiedad=geriatrico";
        } else if (form.origen_pago === "paciente") {
          url += `&propiedad=paciente&paciente_id=${pacienteId}`;
        }
        
        if (form.origen_pago !== "obra_social") {
          const { get } = await import("../api/api");
          const res = await get(url);
          setStockItems(Array.isArray(res) ? res : res.data || []);
        } else {
          setStockItems([]);
        }
      } catch (error) {
        console.error("Error loading stock items:", error);
      }
    };

    fetchStockItems();
  }, [pacienteId, form.origen_pago]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.nombre) {
      alert("El nombre del medicamento es obligatorio");
      return;
    }
    setMedicamentos([...medicamentos, { ...form, id: Date.now() }]); // Temp ID
    setForm({
      nombre: "",
      dosis: "",
      frecuencia: "",
      tipo: "diaria",
      cantidad_mensual: "",
      fecha_inicio: "",
      fecha_fin: "",
      observaciones: "",
      origen_pago: form.origen_pago, // Mantener el origen de pago seleccionado
      stock_item_id: "",
    });
  };

  const handleRemove = (id) => {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  };

  const handleSaveAll = async () => {
    if (!pacienteId) {
      alert("Debe seleccionar un paciente");
      return;
    }
    if (medicamentos.length === 0) {
      alert("No hay medicamentos para guardar");
      return;
    }

    const result = await showConfirm(
      `¿Está seguro de guardar ${medicamentos.length} medicamentos para este paciente?`
    );

    if (result.isConfirmed) {
      try {
        await post("/medicamentos/batch", {
          paciente_id: pacienteId,
          medicamentos: medicamentos.map(({ id, ...rest }) => rest), // Remove temp ID
        });
        await showSuccess("Medicamentos guardados correctamente");
        navigate("/medicamentos");
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-gradient mb-2">Carga Masiva de Medicamentos</h1>
          <p className="text-muted mb-0">Agregue múltiples medicamentos a un paciente antes de guardar.</p>
        </div>
        <button className="btn btn-light text-primary" onClick={() => navigate(-1)}>
            Volver
        </button>
      </div>

      <div className="row g-4">
        {/* Formulario de Carga */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 px-4">
                <h5 className="mb-0 fw-bold text-primary">1. Datos del Medicamento</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label fw-bold">Paciente *</label>
                <PatientSelect
                  name="paciente_id"
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className="form-control"
                />
              </div>
              <hr className="my-4" />
              <form onSubmit={handleAdd}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nombre Medicamento *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: Ibuprofeno 600mg"
                    required
                  />
                </div>
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <label className="form-label fw-bold">Dosis</label>
                        <input
                            type="text"
                            name="dosis"
                            value={form.dosis}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Ej: 600mg"
                        />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-bold">Frecuencia</label>
                        <input
                            type="text"
                            name="frecuencia"
                            value={form.frecuencia}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Ej: c/8hs"
                        />
                    </div>
                </div>
                
                <div className="mb-3">
                    <label className="form-label fw-bold">Tipo</label>
                    <select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="diaria">Diaria (Crónica)</option>
                        <option value="sos">SOS (Dolor/Ocasional)</option>
                    </select>
                    <small className="text-muted d-block mt-1">
                        Diaria: medicación de uso continuo. SOS: medicación de uso ocasional según necesidad
                    </small>
                </div>

                {/* NUEVO: Selector de Origen de Pago */}
                <div className="mb-3">
                    <label className="form-label fw-bold">Origen de Pago *</label>
                    <select
                        name="origen_pago"
                        value={form.origen_pago}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="geriatrico">🟢 Geriátrico</option>
                        <option value="obra_social">🔵 Obra Social</option>
                        <option value="paciente">🟡 Paciente</option>
                    </select>
                    <small className="text-muted d-block mt-1">
                        {form.origen_pago === 'geriatrico' && '💡 Descontará del stock del geriátrico'}
                        {form.origen_pago === 'paciente' && '💡 Descontará del stock del paciente'}
                        {form.origen_pago === 'obra_social' && '💡 Solo registro, no afecta stock'}
                    </small>
                </div>

                {/* Selector de Stock Item (si aplica) */}
                {form.origen_pago !== 'obra_social' && stockItems.length > 0 && (
                    <div className="mb-3">
                        <label className="form-label fw-bold">Vincular con Stock</label>
                        <select
                            name="stock_item_id"
                            value={form.stock_item_id}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="">Sin vincular</option>
                            {stockItems.map((item) => {
                                const stockBajo = item.stock_actual <= item.stock_minimo;
                                return (
                                    <option key={item.id} value={item.id}>
                                        {item.nombre} - Stock: {item.stock_actual} {item.unidad_medida}
                                        {stockBajo ? ' ⚠️ STOCK BAJO' : ''}
                                    </option>
                                );
                            })}
                        </select>
                        {form.stock_item_id && (() => {
                            const selectedItem = stockItems.find(i => i.id == form.stock_item_id);
                            if (selectedItem && selectedItem.stock_actual <= selectedItem.stock_minimo) {
                                return (
                                    <div className="alert alert-warning mt-2 mb-0 small">
                                        <strong>⚠️ Stock Bajo:</strong> Este medicamento tiene stock por debajo del mínimo recomendado ({selectedItem.stock_minimo} {selectedItem.unidad_medida}). Considere realizar un pedido.
                                    </div>
                                );
                            }
                        })()}
                    </div>
                )}

                {form.tipo === 'diaria' && (

                    <div className="mb-3">
                        <label className="form-label fw-bold">Cantidad Mensual</label>
                        <input
                            type="number"
                            name="cantidad_mensual"
                            value={form.cantidad_mensual}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Ej: 30, 60, 90"
                        />
                        <small className="text-muted d-block mt-1">
                            Estimación de unidades consumidas por mes
                        </small>
                    </div>
                )}

                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <label className="form-label fw-bold">Fecha Inicio</label>
                        <input
                            type="date"
                            name="fecha_inicio"
                            value={form.fecha_inicio}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-6">
                        <label className="form-label fw-bold">Fecha Fin</label>
                        <input
                            type="date"
                            name="fecha_fin"
                            value={form.fecha_fin}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-outline-primary w-100">
                  <PlusCircle className="me-2" /> Agregar a la Lista
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lista de Medicamentos */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-primary">2. Lista a Guardar ({medicamentos.length})</h5>
                {medicamentos.length > 0 && (
                    <button onClick={handleSaveAll} className="btn btn-primary shadow-sm">
                        <Save className="me-2" /> Guardar Todo
                    </button>
                )}
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 border-0">Nombre</th>
                                <th className="border-0">Detalles</th>
                                <th className="border-0">Tipo</th>
                                <th className="border-0">Origen Pago</th>
                                <th className="border-0">Fechas</th>
                                <th className="text-end pe-4 border-0">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicamentos.length > 0 ? (
                                medicamentos.map((med) => (
                                    <tr key={med.id}>
                                        <td className="ps-4 fw-bold">{med.nombre}</td>
                                        <td>
                                            <div className="small text-muted">
                                                {med.dosis && <span>{med.dosis}</span>}
                                                {med.frecuencia && <span> - {med.frecuencia}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${med.tipo === 'sos' ? 'bg-warning text-dark' : 'bg-success'} bg-opacity-10 text-${med.tipo === 'sos' ? 'warning' : 'success'} border border-opacity-25`}>
                                                {med.tipo.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {med.origen_pago === 'geriatrico' && (
                                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                                    🟢 Geriátrico
                                                </span>
                                            )}
                                            {med.origen_pago === 'obra_social' && (
                                                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                                                    🔵 Obra Social
                                                </span>
                                            )}
                                            {med.origen_pago === 'paciente' && (
                                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                                                    🟡 Paciente
                                                </span>
                                            )}
                                        </td>
                                        <td className="small text-muted">
                                            {med.fecha_inicio || '-'} / {med.fecha_fin || '-'}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                onClick={() => handleRemove(med.id)}
                                                className="btn btn-sm btn-light text-danger"
                                            >
                                                <Trash3 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted fst-italic">
                                        Agregue medicamentos usando el formulario de la izquierda.
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
    </div>
  );
}
