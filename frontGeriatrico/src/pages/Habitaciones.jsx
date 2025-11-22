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
      canCreate={canManage}
      canEdit={canManage}
      canDelete={user?.role === "admin"}
    />
  );
}
