import React from "react";
import CrudView from "../components/CrudView";
import { useAuth } from "../context/AuthContext";

export default function Habitaciones() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "administrativo";

  const columns = [
    { key: "numero", label: "Número" },
    { key: "capacidad", label: "Capacidad" },
  ];

  return (
    <CrudView
      endpoint="/habitaciones"
      columns={columns}
      title="Gestión de Habitaciones"
      formFields={[
        { key: 'numero', colSize: 6 },
        { key: 'capacidad', colSize: 6 }
      ]}
      customFields={{
        numero: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Número *</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: 101" />
          </div>
        ),
        capacidad: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Capacidad *</label>
            <input type="number" name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: 2" />
          </div>
        ),
      }}
    />
  );
}
