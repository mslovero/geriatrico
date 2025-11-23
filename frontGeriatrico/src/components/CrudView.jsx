import { useEffect, useState } from "react";
import { get, post, put, del } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { PencilSquare, Trash3, PlusCircle, Search } from "react-bootstrap-icons";
import { showSuccess, showConfirm, handleApiError } from "../utils/alerts";

export default function CrudView({
  endpoint,
  columns,
  title,
  customFields = {},
  transformData,
  onEdit,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  customActions,
}) {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await get(endpoint);
      const finalData = Array.isArray(res) ? res : res.data || [];
      setData(Array.isArray(finalData) ? finalData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [endpoint]);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setForm({ ...form, [e.target.name]: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = transformData ? transformData(form) : form;
      if (editingId) {
        await put(`${endpoint}/${editingId}`, payload);
        await showSuccess("Registro actualizado correctamente");
      } else {
        await post(endpoint, payload);
        await showSuccess("Registro creado correctamente");
      }

      setForm({});
      setEditingId(null);
      loadData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      fecha_nacimiento: item.fecha_nacimiento
        ? item.fecha_nacimiento.split("T")[0]
        : "",
    });
    setEditingId(item.id);

    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.",
      "¿Eliminar registro?"
    );

    if (result.isConfirmed) {
      try {
        await del(`${endpoint}/${id}`);
        await showSuccess("Registro eliminado correctamente");
        loadData();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
           <h1 className="fw-bold text-gradient mb-2">{title}</h1>
           <p className="text-muted mb-0">Gestión y administración de registros.</p>
        </div>
      </div>

      {(canCreate || (editingId && canEdit)) && (
        <div className="card border-0 shadow-lg mb-5 overflow-hidden">
          <div className="card-header bg-white border-0 py-3 px-4">
             <div className="d-flex align-items-center">
                <div className={`rounded-circle p-2 me-3 ${editingId ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'}`}>
                    {editingId ? <PencilSquare size={20} /> : <PlusCircle size={20} />}
                </div>
                <h5 className="mb-0 fw-bold">{editingId ? "Editar Registro" : "Nuevo Registro"}</h5>
             </div>
          </div>
          <div className="card-body p-4 bg-surface">
            <form onSubmit={handleSubmit} className="row g-4">
              {columns.map((col) => {
                const customRenderer = customFields[col.key];
                const colSize = col.colSize || 4;

                if (customRenderer) {
                  return (
                    <div className={`col-md-${colSize}`} key={col.key}>
                      <label className="form-label small text-uppercase fw-bold text-muted">
                        {col.label}
                      </label>
                      {customRenderer({
                        name: col.key,
                        value: form[col.key] || "",
                        onChange: handleChange,
                        form,
                        setForm,
                        className: "form-control",
                      })}
                    </div>
                  );
                }

                if (col.key.toLowerCase().includes("fecha")) {
                  return (
                    <div className={`col-md-${colSize}`} key={col.key}>
                      <label className="form-label small text-uppercase fw-bold text-muted">
                        {col.label}
                      </label>
                      <input
                        type="date"
                        name={col.key}
                        value={form[col.key] || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  );
                }

                return (
                  <div className={`col-md-${colSize}`} key={col.key}>
                    <label className="form-label small text-uppercase fw-bold text-muted">
                      {col.label}
                    </label>
                    <input
                      name={col.key}
                      value={form[col.key] || ""}
                      onChange={handleChange}
                      placeholder={`Ingrese ${col.label.toLowerCase()}`}
                      className="form-control"
                    />
                  </div>
                );
              })}

              <div className="col-12 text-end pt-3 border-top mt-4">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({});
                    }}
                    className="btn btn-light text-muted me-2"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn btn-primary px-4 shadow-sm">
                  {editingId ? "Actualizar Cambios" : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
           <h5 className="mb-0 fw-bold">Listado de Registros</h5>
           <div className="d-flex align-items-center gap-3">
               <div className="input-group input-group-sm" style={{maxWidth: '300px'}}>
                   <span className="input-group-text bg-light border-end-0"><Search className="text-muted"/></span>
                   <input 
                        type="text" 
                        className="form-control bg-light border-start-0" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                   />
               </div>
               <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                  {filteredData.length} Total
               </span>
           </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="text-uppercase text-muted small fw-bold border-0 py-3 px-4">{col.label}</th>
                ))}
                {(canEdit || canDelete || customActions) && (
                  <th className="text-end text-uppercase text-muted small fw-bold border-0 py-3 px-4">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 border-bottom-0">
                        {col.render
                          ? col.render(item[col.key], item)
                          : col.key.toLowerCase().includes("fecha")
                          ? new Date(item[col.key]).toLocaleDateString("es-AR")
                          : typeof item[col.key] === "object" && item[col.key] !== null
                          ? Object.entries(item[col.key])
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" | ")
                          : item[col.key]}
                      </td>
                    ))}
                    {(canEdit || canDelete || customActions) && (
                      <td className="text-end py-3 px-4 border-bottom-0">
                        <div className="d-flex justify-content-end gap-2">
                          {customActions && customActions(item)}
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="btn btn-light btn-sm text-primary shadow-sm"
                              title="Editar"
                            >
                              <PencilSquare size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="btn btn-light btn-sm text-danger shadow-sm"
                              title="Eliminar"
                            >
                              <Trash3 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center opacity-50">
                      <i className="bi bi-inbox fs-1 text-muted mb-2"></i>
                      <p className="text-muted mb-0">No se encontraron registros</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
