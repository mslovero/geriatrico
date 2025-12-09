import React from "react";
import CrudView from "../components/CrudView";
import { useAuth } from "../context/AuthContext";

export default function Usuarios() {
  const { user } = useAuth();

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rol" },
    { key: "password", label: "Contraseña", render: () => "******" },
  ];

  if (user?.role !== "admin") {
    return (
      <div className="text-center mt-5 text-danger">
        Acceso denegado. Solo administradores.
      </div>
    );
  }

  return (
    <CrudView
      endpoint="/users"
      columns={columns}
      title="Gestión de Usuarios"
      canCreate={true}
      canEdit={true}
      canDelete={true}
      formFields={[
        { key: 'name', colSize: 6 },
        { key: 'email', colSize: 6 },
        { key: 'role', colSize: 6 },
        { key: 'password', colSize: 6 }
      ]}
      customFields={{
        name: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Nombre *</label>
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
              placeholder="Nombre completo"
            />
          </div>
        ),
        email: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Email *</label>
            <input
              type="email"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
              placeholder="usuario@ejemplo.com"
            />
          </div>
        ),
        role: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Rol *</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
            >
              <option value="">Seleccionar Rol</option>
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="enfermero">Enfermero</option>
              <option value="administrativo">Administrativo</option>
            </select>
          </div>
        ),
        password: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Contraseña</label>
            <input
              type="password"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              placeholder="Contraseña (min 8 caracteres)"
              autoComplete="new-password"
            />
            <small className="text-muted">Dejar en blanco para no cambiar</small>
          </div>
        ),
      }}
    />
  );
}
