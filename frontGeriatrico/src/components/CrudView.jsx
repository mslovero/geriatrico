import { useEffect, useState } from "react";
import { get, post, put, del } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { PencilSquare, Trash3, PlusCircle } from "react-bootstrap-icons";
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

  return (
    <div className="min-vh-100 py-5" style={{ background: "transparent" }}>
      <div className="container">
        <div className="mb-4 text-center">
          <h1
            className="display-5 fw-bold mb-2"
            style={{ color: "var(--primary-color)" }}
          >
            {title}
          </h1>
          <div
            style={{
              width: "100%",
              height: "4px",
              background:
                "linear-gradient(90deg, var(--primary-color), var(--secondary-color))",
              margin: "0 auto",
              borderRadius: "2px",
            }}
          ></div>
        </div>

        {(canCreate || (editingId && canEdit)) && (
          <div className="card shadow-lg border-0 mb-4 fade-in">
            <div className="card-body" style={{ padding: "2.5rem" }}>
              <div
                className="d-flex align-items-center mb-4 pb-3"
                style={{ borderBottom: "2px solid var(--gray-200)" }}
              >
                <i
                  className="bi bi-plus-circle-fill me-3"
                  style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}
                ></i>
                <h3
                  className="mb-0 fw-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {editingId ? "Editar Registro" : "Nuevo Registro"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="row g-3">
                {columns.map((col) => {
                  const customRenderer = customFields[col.key];
                  const colSize = col.colSize || 4;

                  if (customRenderer) {
                    return (
                      <div className={`col-md-${colSize}`} key={col.key}>
                        <label className="form-label fw-semibold">
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
                        <label className="form-label fw-semibold">
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
                      <label className="form-label fw-semibold">
                        {col.label}
                      </label>
                      <input
                        name={col.key}
                        value={form[col.key] || ""}
                        onChange={handleChange}
                        placeholder={col.label}
                        className="form-control"
                      />
                    </div>
                  );
                })}

                <div
                  className="col-12 text-end mt-4 pt-3"
                  style={{ borderTop: "1px solid var(--gray-200)" }}
                >
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm({});
                      }}
                      className="btn btn-secondary me-2 px-4"
                      style={{ backgroundColor: "var(--gray-500)" }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary px-5">
                    {editingId ? (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Actualizar
                      </>
                    ) : (
                      <>
                        <PlusCircle className="me-2" />
                        Crear
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-lg border-0 fade-in">
          <div className="card-body" style={{ padding: "2.5rem" }}>
            <div
              className="d-flex align-items-center mb-4 pb-3"
              style={{ borderBottom: "2px solid var(--gray-200)" }}
            >
              <i
                className="bi bi-table me-3"
                style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}
              ></i>
              <h3
                className="mb-0 fw-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Listado de Registros
              </h3>
              {!loading && (
                <span
                  className="ms-auto badge rounded-pill"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {data.length} {data.length === 1 ? "registro" : "registros"}
                </span>
              )}
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-primary text-center">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                    {(canEdit || canDelete || customActions) && (
                      <th style={{ width: "150px" }}>Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="text-center py-5"
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id}>
                        {columns.map((col) => (
                          <td key={col.key}>
                            {col.render
                              ? col.render(item[col.key], item)
                              : col.key.toLowerCase().includes("fecha")
                              ? new Date(item[col.key]).toLocaleDateString(
                                  "es-AR"
                                )
                              : typeof item[col.key] === "object" &&
                                item[col.key] !== null
                              ? Object.entries(item[col.key])
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(" | ")
                              : item[col.key]}
                          </td>
                        ))}
                        {(canEdit || canDelete || customActions) && (
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              {customActions && customActions(item)}
                              {canEdit && (
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="btn btn-warning btn-sm d-flex align-items-center"
                                  title="Editar"
                                >
                                  <PencilSquare size={16} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="btn btn-danger btn-sm d-flex align-items-center"
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
                      <td
                        colSpan={columns.length + 1}
                        className="text-center py-5"
                      >
                        <div
                          className="d-flex flex-column align-items-center"
                          style={{ opacity: 0.6 }}
                        >
                          <i
                            className="bi bi-inbox"
                            style={{
                              fontSize: "3rem",
                              color: "var(--gray-400)",
                            }}
                          ></i>
                          <p
                            className="mt-3 mb-0"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            No hay registros disponibles
                          </p>
                        </div>
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
  );
}
