import React from "react";
import CrudView from "../components/CrudView";
import PatientSelect from "../components/PatientSelect";
import { useAuth } from "../context/AuthContext";
import { get } from "../api/api";

export default function SignosVitales() {
  const { user } = useAuth();
  const canManage =
    user?.role === "admin" ||
    user?.role === "medico" ||
    user?.role === "enfermero";
  const canDelete = user?.role === "admin";
  const [enfermeros, setEnfermeros] = React.useState([]);

  React.useEffect(() => {
    const fetchEnfermeros = async () => {
      try {
        const [resEnfermeros, resMedicos] = await Promise.all([
          get("/users?role=enfermero"),
          get("/users?role=medico"),
        ]);
        const lista = [
          ...(Array.isArray(resEnfermeros) ? resEnfermeros : []),
          ...(Array.isArray(resMedicos) ? resMedicos : []),
        ];
        setEnfermeros(lista);
      } catch (error) {
        console.error("Error cargando personal:", error);
      }
    };
    fetchEnfermeros();
  }, []);

  const columns = [
    {
      key: "paciente_id",
      label: "Paciente",
      render: (value, item) => {
        return item.paciente
          ? `${item.paciente.nombre} ${item.paciente.apellido}`
          : "ID: " + value;
      },
    },
    {
      key: "fecha",
      label: "Fecha y Hora",
      render: (value) => new Date(value).toLocaleString("es-AR"),
    },
    { key: "presion_arterial", label: "Presión (mmHg)" },
    { key: "temperatura", label: "Temp (°C)" },
    { key: "frecuencia_cardiaca", label: "Pulso (bpm)" },
    { key: "saturacion_oxigeno", label: "Sat O2 (%)" },
    { key: "glucosa", label: "Glucosa (mg/dL)" },
    { key: "registrado_por", label: "Registrado Por" },
  ];

  return (
    <CrudView
      endpoint="/signos-vitales"
      columns={columns}
      title="Signos Vitales"
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canDelete}
      customFields={{
        paciente_id: (props) => <PatientSelect {...props} />,
        registrado_por: ({ name, value, onChange, className }) => (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            required
          >
            <option value="">Seleccionar responsable...</option>
            {enfermeros.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        ),
        fecha: ({ name, value, onChange, className }) => (
          <input
            type="datetime-local"
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            required
          />
        ),
        observaciones: ({ name, value, onChange, className }) => (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            rows="3"
            placeholder="Observaciones adicionales..."
          />
        ),
        temperatura: ({ name, value, onChange, className }) => (
          <input
            type="number"
            step="0.1"
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            placeholder="36.5"
          />
        ),
        frecuencia_cardiaca: ({ name, value, onChange, className }) => (
          <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            placeholder="80"
          />
        ),
        saturacion_oxigeno: ({ name, value, onChange, className }) => (
          <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            placeholder="98"
          />
        ),
        glucosa: ({ name, value, onChange, className }) => (
          <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            placeholder="100"
          />
        ),
      }}
    />
  );
}
