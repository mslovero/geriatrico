import React, { useEffect, useState } from "react";
import { get, post, put, del } from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { PencilSquare, Trash3, PlusCircle } from "react-bootstrap-icons";

export default function CrudView({ endpoint, columns, title, customFields = {} }) {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const res = await get(endpoint);
    setData(res.data || res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await put(`${endpoint}/${editingId}`, form);
    else await post(endpoint, form);

    setForm({});
    setEditingId(null);
    loadData();
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      fecha_nacimiento: item.fecha_nacimiento
        ? item.fecha_nacimiento.split("T")[0]
        : "",
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      await del(`${endpoint}/${id}`);
      loadData();
    }
  };

  return (
    <div className="min-vh-100 py-5">
      <div className="container">
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-body">
            <h2 className="card-title text-center mb-4 fw-bold text-primary">
              {title}
            </h2>

            {/* 🧾 Formulario */}
            <form onSubmit={handleSubmit} className="row g-3">
              {columns.map((col) => {
                const customRenderer = customFields[col.key];
                const colSize = col.colSize || 4; // 👈 por defecto col-md-4

                // 🔸 Si el campo tiene un renderizado personalizado
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

                // 🔸 Si es fecha
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

                // 🔸 Campo genérico
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

              <div className="col-12 text-end mt-3">
                <button type="submit" className="btn btn-primary px-4">
                  <PlusCircle className="me-2" />
                  {editingId ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 📋 Tabla */}
        <div className="card shadow border-0">
          <div className="card-body">
            <table className="table table-hover align-middle">
              <thead
                className="table-primary text-center"
                style={{ backgroundColor: "#1976d2", color: "white" }}
              >
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.key.toLowerCase().includes("fecha")
                            ? new Date(item[col.key]).toLocaleDateString("es-AR")
                            : typeof item[col.key] === "object" && item[col.key] !== null
                              ? Object.entries(item[col.key])
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" | ")
                              : item[col.key]}
                        </td>
                      ))}
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-warning btn-sm d-flex align-items-center"
                          >
                            <PencilSquare className="me-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-danger btn-sm d-flex align-items-center"
                          >
                            <Trash3 className="me-1" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center">
                      No hay registros disponibles.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
