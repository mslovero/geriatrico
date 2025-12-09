import React, { useState, useEffect } from "react";
import CrudView from "../components/CrudView";
import PatientSelect from "../components/PatientSelect";
import { useAuth } from "../context/AuthContext";
import { get } from "../api/api";

export default function AdministracionMedicamentos() {
  const { user } = useAuth();
  const canManage =
    user?.role === "admin" ||
    user?.role === "medico" ||
    user?.role === "enfermero";
  const canDelete = user?.role === "admin";

  const [medicaciones, setMedicaciones] = useState([]);
  const [filteredMedicaciones, setFilteredMedicaciones] = useState([]);
  const [enfermeros, setEnfermeros] = useState([]);

  // Cargar medicaciones y enfermeros al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMedicaciones, resEnfermeros, resMedicos] = await Promise.all([
          get("/medicamentos"),
          get("/users?role=enfermero"),
          get("/users?role=medico"),
        ]);

        setMedicaciones(
          Array.isArray(resMedicaciones)
            ? resMedicaciones
            : resMedicaciones.data || []
        );

        const listaPersonal = [
          ...(Array.isArray(resEnfermeros) ? resEnfermeros : []),
          ...(Array.isArray(resMedicos) ? resMedicos : []),
        ];
        setEnfermeros(listaPersonal);
      } catch (error) {
        console.error("Error cargando datos auxiliares:", error);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      key: "medicacion_id",
      label: "Medicación",
      render: (value, item) => {
        return item.medicacion
          ? `[${
              item.medicacion.tipo
                ? item.medicacion.tipo.toUpperCase()
                : "DIARIA"
            }] ${item.medicacion.nombre} (${item.medicacion.dosis})`
          : "ID: " + value;
      },
    },
    {
      key: "paciente_id",
      label: "Paciente",
      render: (value, item) => {
        return item.medicacion && item.medicacion.paciente
          ? `${item.medicacion.paciente.nombre} ${item.medicacion.paciente.apellido}`
          : item.paciente
          ? `${item.paciente.nombre} ${item.paciente.apellido}`
          : "-";
      },
    },
    {
      key: "fecha_hora",
      label: "Fecha y Hora",
      render: (value) => new Date(value).toLocaleString("es-AR"),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => {
        const colors = {
          administrado: "success",
          rechazado: "warning",
          suspendido: "secondary",
          error: "danger",
        };
        return (
          <span className={`badge bg-${colors[value] || "primary"}`}>
            {value.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "user_id",
      label: "Responsable",
      render: (value, item) => (item.user ? item.user.name : "Sistema"),
    },
  ];

  return (
    <CrudView
      endpoint="/registro-medicaciones"
      columns={columns}
      title="Administración de Medicamentos (MAR)"
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canDelete}
      formFields={[
        { key: 'paciente_id', colSize: 6 },
        { key: 'medicacion_id', colSize: 6 },
        { key: 'estado', colSize: 6 },
        { key: 'fecha_hora', colSize: 6 },
        { key: 'user_id', colSize: 12 },
        { key: 'observaciones', colSize: 12 }
      ]}
      customFields={{
        // 1. Seleccionar Paciente
        paciente_id: (props) => (
          <div>
            <label className="form-label fw-bold">Paciente *</label>
            <PatientSelect
              {...props}
              onChange={(e) => {
                props.onChange(e);
                // Filtrar medicaciones para este paciente
                const pid = parseInt(e.target.value);
                const meds = medicaciones.filter((m) => m.paciente_id === pid);
                setFilteredMedicaciones(meds);
              }}
              className={props.className}
            />
          </div>
        ),
        // 2. Seleccionar Medicación (filtrada)
        medicacion_id: ({ name, value, onChange, className, form }) => (
          <div>
            <label className="form-label fw-bold">Medicación *</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
              disabled={!form.paciente_id}
            >
              <option value="">
                {form.paciente_id
                  ? "Seleccionar medicación..."
                  : "Primero seleccione un paciente"}
              </option>
              {filteredMedicaciones.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.tipo ? m.tipo.toUpperCase() : "DIARIA"}] {m.nombre} -{" "}
                  {m.dosis} ({m.frecuencia})
                </option>
              ))}
            </select>
          </div>
        ),
        estado: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Estado de Administración *</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
            >
              <option value="">Seleccionar estado...</option>
              <option value="administrado">Administrado</option>
              <option value="rechazado">Rechazado (Paciente se negó)</option>
              <option value="suspendido">Suspendido (Orden médica)</option>
              <option value="error">Error / No disponible</option>
            </select>
          </div>
        ),
        fecha_hora: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Fecha y Hora *</label>
            <input
              type="datetime-local"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
            />
          </div>
        ),
        user_id: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Responsable (Opcional)</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
            >
              <option value="">Usuario actual (Automático)</option>
              {enfermeros.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <small className="text-muted d-block mt-1">
              Si se deja vacío, se asignará al usuario logueado.
            </small>
          </div>
        ),
        observaciones: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Observaciones (Opcional)</label>
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              rows="2"
              placeholder="Detalles adicionales sobre la administración..."
            />
          </div>
        ),
      }}
    />
  );
}
