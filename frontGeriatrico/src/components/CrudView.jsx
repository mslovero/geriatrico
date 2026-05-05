import { useEffect, useState } from "react";
import { get, post, put, del } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { PencilSquare, Trash3, PlusCircle, Search, ChevronLeft, ChevronRight, ChevronDoubleLeft, ChevronDoubleRight } from "react-bootstrap-icons";
import { showSuccess, showConfirm, handleApiError } from "../utils/alerts";
import SkeletonLoader from "./SkeletonLoader";

export default function CrudView({
  endpoint,
  columns,
  title,
  formFields,
  customFields = {},
  transformData,
  onEdit,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  customActions,
  headerActions,
}) {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const loadData = async (page = 1, signal = null) => {
    setLoading(true);
    try {
      const res = await get(`${endpoint}?page=${page}&per_page=${perPage}`, { signal });

      if (!res) return; // Si la petición fue cancelada

      // Manejar respuesta paginada de Laravel
      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
        setCurrentPage(res.current_page || 1);
        setTotalPages(res.last_page || 1);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        // Respuesta sin paginación (retrocompatibilidad)
        setData(res);
        setTotalPages(1);
        setTotal(res.length);
      } else {
        setData([]);
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error("Error loading data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(1, controller.signal);
    
    return () => controller.abort();
  }, [endpoint, perPage]);

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
              {(customFields && formFields ? formFields : columns).map((field) => {
                // Determinar la clave y la etiqueta
                const key = typeof field === 'string' ? field : field.key;
                const colDef = columns.find(c => c.key === key);
                const label = typeof field === 'object' && field.label ? field.label : (colDef ? colDef.label : key);
                
                // Si usamos formFields y es un string, asumimos colSize 12 o 6 según diseño, 
                // pero por compatibilidad intentamos buscarlo en columns o default a 12 si es custom
                const colSize = (typeof field === 'object' && field.colSize) ? field.colSize : (colDef ? colDef.colSize : 12);

                const customRenderer = customFields[key];

                if (customRenderer) {
                  return (
                    <div className={`col-md-${colSize}`} key={key}>
                      {/* El label se maneja dentro del customRenderer si se desea, o aquí genérico */}
                      {/* Para mantener consistencia con Lotes.jsx que tiene sus propios labels, 
                          podemos renderizar solo el componente si el renderer retorna todo el bloque */}
                      {customRenderer({
                        name: key,
                        value: form[key] || "",
                        onChange: handleChange,
                        form,
                        setForm,
                        className: "form-control",
                      })}
                    </div>
                  );
                }

                // Si no hay custom renderer, renderizado standard
                if (key.toLowerCase().includes("fecha")) {
                  const inputId = `field-${key}`;
                  return (
                    <div className={`col-md-${colSize}`} key={key}>
                      <label 
                        htmlFor={inputId}
                        className="form-label small text-uppercase fw-bold text-muted"
                      >
                        {label}
                      </label>
                      <input
                        id={inputId}
                        type="date"
                        name={key}
                        value={form[key] || ""}
                        onChange={handleChange}
                        className="form-control"
                        aria-label={label}
                      />
                    </div>
                  );
                }

                const inputId = `field-${key}`;
                return (
                  <div className={`col-md-${colSize}`} key={key}>
                    <label 
                      htmlFor={inputId}
                      className="form-label small text-uppercase fw-bold text-muted"
                    >
                      {label}
                    </label>
                    <input
                      id={inputId}
                      name={key}
                      value={form[key] || ""}
                      onChange={handleChange}
                      placeholder={`Ingrese ${label.toLowerCase()}`}
                      className="form-control"
                      aria-label={label}
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
               {headerActions && headerActions()}
           </div>
        </div>
        
        <div className="table-responsive d-none d-lg-block">
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
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {columns.map((col, j) => (
                        <td key={j} className="py-3 px-4">
                          <div className="skeleton-line" style={{ width: `${Math.random() * 40 + 60}%`, height: '16px' }}></div>
                        </td>
                      ))}
                      <td className="py-3 px-4">
                        <div className="d-flex gap-2 justify-content-end">
                          <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                          <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 border-bottom-0">
                        {col.render
                          ? col.render(item[col.key], item)
                          : col.key.toLowerCase().includes("fecha")
                          ? (item[col.key] ? (() => {
                              if (/^\d{4}-\d{2}-\d{2}$/.test(item[col.key])) {
                                  const [y, m, d] = item[col.key].split('-');
                                  return new Date(y, m - 1, d).toLocaleDateString("es-AR");
                              }
                              return new Date(item[col.key]).toLocaleDateString("es-AR");
                          })() : "-")
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

        {/* Vista Móvil (Cards) */}
        <div className="d-lg-none">
          {loading ? (
            <div className="p-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                    <div className="skeleton-line mb-2" style={{ width: '60%', height: '18px' }}></div>
                    <div className="skeleton-line mb-2" style={{ width: '80%', height: '14px' }}></div>
                    <div className="skeleton-line mb-3" style={{ width: '70%', height: '14px' }}></div>
                    <div className="d-flex gap-2 mt-3 pt-3 border-top">
                      <div className="skeleton-button" style={{ width: '80px', height: '36px' }}></div>
                      <div className="skeleton-button" style={{ width: '80px', height: '36px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="list-group list-group-flush">
              {filteredData.map((item) => (
                <div key={item.id} className="list-group-item p-4 border-bottom">
                  <div className="row g-3">
                    {columns.map((col) => (
                      <div key={col.key} className="col-12">
                        <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.65rem' }}>{col.label}</div>
                        <div className="fw-medium">
                          {col.render
                            ? col.render(item[col.key], item)
                            : col.key.toLowerCase().includes("fecha")
                            ? (item[col.key] ? new Date(item[col.key]).toLocaleDateString("es-AR") : "-")
                            : item[col.key]}
                        </div>
                      </div>
                    ))}
                    <div className="col-12 mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                        {customActions && customActions(item)}
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-primary btn-sm px-3 shadow-sm"
                          >
                            <PencilSquare size={16} className="me-1" /> Editar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-outline-danger btn-sm px-3"
                          >
                            <Trash3 size={16} className="me-1" /> Eliminar
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 opacity-50">
               <i className="bi bi-inbox fs-1 d-block mb-2"></i>
               <p>No hay registros</p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="card-footer bg-white border-0 py-4 px-4 border-top">
            <div className="row align-items-center g-3">
              {/* Información de registros */}
              <div className="col-12 col-md-4">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="text-muted small">Mostrando</span>
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-2 py-1">
                    {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, total)}
                  </span>
                  <span className="text-muted small">de</span>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary fw-bold px-2 py-1">{total}</span>
                  <span className="text-muted small">registros</span>
                </div>
              </div>

              {/* Selector de items por página */}
              <div className="col-12 col-md-4 text-center">
                <div className="d-inline-flex align-items-center gap-2">
                  <span className="text-muted small">Por página:</span>
                  <select
                    className="form-select form-select-sm shadow-sm"
                    style={{ width: 'auto' }}
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              {/* Navegación de páginas */}
              <div className="col-12 col-md-4">
                <nav aria-label="Paginación de registros">
                  <ul className="pagination pagination-sm mb-0 justify-content-md-end justify-content-center gap-1 flex-wrap">
                    {/* Primera página */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link border-0 shadow-sm px-2"
                        onClick={() => loadData(1)}
                        disabled={currentPage === 1}
                        title="Primera página"
                      >
                        <ChevronDoubleLeft size={14} />
                      </button>
                    </li>

                    {/* Página anterior */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link border-0 shadow-sm px-2"
                        onClick={() => loadData(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Página anterior"
                      >
                        <ChevronLeft size={14} />
                      </button>
                    </li>

                    {/* Páginas numéricas (mostrar máximo 5) */}
                    {(() => {
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                      if (endPage - startPage < maxVisible - 1) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      const pages = [];

                      if (startPage > 1) {
                        pages.push(
                          <li key="ellipsis-start" className="page-item disabled">
                            <span className="page-link border-0 bg-transparent">...</span>
                          </li>
                        );
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                            <button
                              className={`page-link border-0 shadow-sm ${currentPage === i ? 'bg-primary text-white' : 'bg-light text-primary'}`}
                              onClick={() => loadData(i)}
                            >
                              {i}
                            </button>
                          </li>
                        );
                      }

                      if (endPage < totalPages) {
                        pages.push(
                          <li key="ellipsis-end" className="page-item disabled">
                            <span className="page-link border-0 bg-transparent">...</span>
                          </li>
                        );
                      }

                      return pages;
                    })()}

                    {/* Página siguiente */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link border-0 shadow-sm px-2"
                        onClick={() => loadData(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Página siguiente"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </li>

                    {/* Última página */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link border-0 shadow-sm px-2"
                        onClick={() => loadData(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Última página"
                      >
                        <ChevronDoubleRight size={14} />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
