import React from "react";
import CrudView from "../components/CrudView";
import { useAuth } from "../context/AuthContext";

export default function Proveedores() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "medico";

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "razon_social", label: "Razón Social" },
    { key: "cuit", label: "CUIT" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
    { key: "direccion", label: "Dirección" },
  ];

  return (
    <CrudView
      endpoint="/proveedores"
      columns={columns}
      title="Gestión de Proveedores"
      canCreate={canManage}
      canEdit={canManage}
      canDelete={user?.role === "admin"}
      formFields={[
        { key: 'nombre', colSize: 6 },
        { key: 'razon_social', colSize: 6 },
        { key: 'cuit', colSize: 6 },
        { key: 'telefono', colSize: 6 },
        { key: 'email', colSize: 12 },
        { key: 'direccion', colSize: 12 },
        { key: 'observaciones', colSize: 12 }
      ]}
      customFields={{
        nombre: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Nombre Fantasía *</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: Droguería del Sud" />
          </div>
        ),
        razon_social: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Razón Social</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} placeholder="Ej: Droguería del Sud S.A." />
          </div>
        ),
        cuit: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">CUIT</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} placeholder="Ej: 30-12345678-9" />
          </div>
        ),
        telefono: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Teléfono</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} placeholder="Ej: 011 4444-5555" />
          </div>
        ),
        email: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Email</label>
            <input type="email" name={name} value={value || ""} onChange={onChange} className={className} placeholder="contacto@proveedor.com" />
          </div>
        ),
        direccion: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Dirección</label>
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              rows="2"
              placeholder="Calle, Altura, Localidad..."
            />
          </div>
        ),
        observaciones: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Observaciones</label>
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              rows="2"
              placeholder="Notas internas..."
            />
          </div>
        ),
      }}
    />
  );
}
