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
      customFields={{
        role: ({ name, value, onChange, className }) => (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={className}
          >
            <option value="">Seleccionar Rol</option>
            <option value="admin">Administrador</option>
            <option value="medico">Médico</option>
            <option value="enfermero">Enfermero</option>
            <option value="administrativo">Administrativo</option>
          </select>
        ),
        password: ({ name, value, onChange, className }) => (
          <input
            type="password"
            name={name}
            value={value || ""}
            onChange={onChange}
            className={className}
            placeholder="Contraseña (min 8 caracteres)"
          />
        ),
      }}
    />
  );
}
