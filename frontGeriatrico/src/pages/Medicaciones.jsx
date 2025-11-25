import React from "react";
import CrudView from "../components/CrudView";
import PatientSelect from "../components/PatientSelect";
import { useAuth } from "../context/AuthContext";

export default function Medicaciones() {
  const columns = [
    { key: "nombre", label: "Nombre Medicación" },
    { key: "dosis", label: "Dosis" },
    { key: "frecuencia", label: "Frecuencia" },
    { key: "tipo", label: "Tipo" },
    { key: "cantidad_mensual", label: "Cant. Mensual" },
    { 
        key: "fecha_inicio", 
        label: "Fecha Inicio",
        render: (value) => {
            if (!value) return "-";
            const [y, m, d] = value.split('-');
            return new Date(y, m - 1, d).toLocaleDateString("es-AR");
        }
    },
    { 
        key: "fecha_fin", 
        label: "Fecha Fin",
        render: (value) => {
            if (!value) return "-";
            const [y, m, d] = value.split('-');
            return new Date(y, m - 1, d).toLocaleDateString("es-AR");
        }
    },
    { key: "observaciones", label: "Observaciones" },
    {
      key: "paciente_id",
      label: "Paciente",
      render: (value, item) =>
        item.paciente
          ? `${item.paciente.nombre} ${item.paciente.apellido}`
          : "Sin asignar",
    },
  ];

  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "medico";

  return (
    <CrudView
      endpoint="/medicamentos"
      columns={columns}
      title="Gestión de Medicamentos"
      canCreate={canManage}
      canEdit={canManage}
      canDelete={user?.role === "admin"}
      customFields={{
        paciente_id: (props) => <PatientSelect {...props} />,
        tipo: ({ name, value, onChange, className }) => (
          <select
            name={name}
            value={value || "diaria"}
            onChange={onChange}
            className={className}
          >
            <option value="diaria">Diaria (Crónica)</option>
            <option value="sos">SOS (Dolor/Ocasional)</option>
          </select>
        ),
        cantidad_mensual: ({ name, value, onChange, className, form }) => {
          const isDiaria = (form.tipo || "diaria") === "diaria";
          if (!isDiaria) return null;
          return (
            <input
              type="number"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              placeholder="Ej: 30"
            />
          );
        },
        fecha_inicio: ({ name, value, onChange, className }) => (
            <input
                type="date"
                name={name}
                value={value || ''}
                onChange={onChange}
                className={className}
            />
        ),
        fecha_fin: ({ name, value, onChange, className }) => (
            <input
                type="date"
                name={name}
                value={value || ''}
                onChange={onChange}
                className={className}
            />
        ),
        observaciones: ({ name, value, onChange, className }) => (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            rows="2"
          />
        ),
      }}
    />
  );
}
