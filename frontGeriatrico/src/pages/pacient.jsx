import React, { useEffect, useState } from "react";
import CrudView from "../components/CrudView";
import { useNavigate } from "react-router-dom";
import { get } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Pacientes() {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [camas, setCamas] = useState([]);
  const [camasFiltradas, setCamasFiltradas] = useState([]);
  const [pacienteEditando, setPacienteEditando] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHabitaciones, resCamas] = await Promise.all([
          get("/habitaciones"),
          get("/camas"),
        ]);
        setHabitaciones(resHabitaciones.data || resHabitaciones);
        setCamas(resCamas.data || resCamas);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    fetchData();
  }, []);

  const onEditPaciente = (paciente) => {
    setPacienteEditando(paciente);
    if (paciente.habitacion_id && camas.length > 0) {
      const camasFiltradas = camas.filter(
        (cama) =>
          cama.habitacion_id === paciente.habitacion_id &&
          (cama.estado === "libre" || cama.id === paciente.cama_id)
      );
      setCamasFiltradas(camasFiltradas);
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "dni", label: "DNI" },
    { key: "fecha_nacimiento", label: "Fecha de nacimiento" },
    {
      key: "habitacion_id",
      label: "Habitación",
      render: (value, item) => {
        return item.habitacion
          ? `Habitación ${item.habitacion.numero}`
          : "Sin asignar";
      },
    },
    {
      key: "cama_id",
      label: "Cama",
      render: (value, item) => {
        return item.cama ? `Cama ${item.cama.numero_cama}` : "Sin asignar";
      },
    },
    { key: "estado", label: "Estado" },
    { key: "medico_cabecera", label: "Médico cabezera" },
    {
      key: "contacto_emergencia",
      label: "Contacto de emergencia",
      colSize: 6,
    },
    {
      key: "patologias",
      label: "Patologías",
      colSize: 12,
      render: (value) => (value ? (value.length > 50 ? value.substring(0, 50) + "..." : value) : "-"),
    },
  ];

  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "administrativo";

  return (
    <CrudView
      endpoint="/pacientes"
      columns={columns}
      title="Gestión de Pacientes"
      onEdit={onEditPaciente}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={user?.role === "admin"}
      formFields={[
        { key: 'nombre', colSize: 6 },
        { key: 'apellido', colSize: 6 },
        { key: 'dni', colSize: 6 },
        { key: 'fecha_nacimiento', colSize: 6 },
        { key: 'habitacion_id', colSize: 6 },
        { key: 'cama_id', colSize: 6 },
        { key: 'estado', colSize: 6 },
        { key: 'medico_cabecera', colSize: 6 },
        { key: 'contacto_emergencia', colSize: 12 },
        { key: 'patologias', colSize: 12 }
      ]}
      customFields={{
        nombre: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Nombre *</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: Juan" />
          </div>
        ),
        apellido: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Apellido *</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: Pérez" />
          </div>
        ),
        dni: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">DNI *</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: 12345678" />
          </div>
        ),
        fecha_nacimiento: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Fecha de Nacimiento *</label>
            <input type="date" name={name} value={value || ""} onChange={onChange} className={className} required />
          </div>
        ),
        medico_cabecera: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Médico de Cabecera</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} placeholder="Ej: Dr. López" />
          </div>
        ),
        habitacion_id: ({
          name,
          value,
          onChange,
          className,
          form,
          setForm,
        }) => (
          <div>
            <label className="form-label fw-bold">Habitación *</label>
            <select
              name={name}
              value={value || ""}
              onChange={(e) => {
                onChange(e);
                const habitacionId = e.target.value;
                if (habitacionId) {
                  const camasFiltradas = camas.filter(
                    (cama) =>
                      cama.habitacion_id === parseInt(habitacionId) &&
                      (cama.estado === "libre" ||
                        (form && cama.id === form.cama_id))
                  );
                  setCamasFiltradas(camasFiltradas);
                } else {
                  setCamasFiltradas([]);
                }
                if (form && e.target.value !== value) {
                  setForm({
                    ...form,
                    habitacion_id: e.target.value,
                    cama_id: "",
                  });
                }
              }}
              className={className}
              required
            >
              <option value="">Seleccionar habitación</option>
              {habitaciones.map((habitacion) => (
                <option key={habitacion.id} value={habitacion.id}>
                  Habitación {habitacion.numero} (Capacidad:{" "}
                  {habitacion.capacidad})
                </option>
              ))}
            </select>
          </div>
        ),
        cama_id: ({ name, value, onChange, className, form }) => (
          <div>
            <label className="form-label fw-bold">Cama *</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              disabled={!form || !form.habitacion_id}
              required
            >
              <option value="">
                {form && form.habitacion_id
                  ? "Seleccionar cama"
                  : "Primero seleccione una habitación"}
              </option>
              {camasFiltradas.map((cama) => (
                <option key={cama.id} value={cama.id}>
                  Cama {cama.numero_cama} ({cama.estado})
                </option>
              ))}
            </select>
          </div>
        ),
        estado: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Estado *</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
            >
              <option value="">Seleccionar estado</option>
              {["activo", "temporal", "alta_medica", "fallecido", "inactivo"].map(
                (estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>
        ),
        contacto_emergencia: ({ form, setForm }) => {
          if (!form) return null;
          const contacto = form.contacto_emergencia || {};
          return (
            <div>
              <label className="form-label fw-bold mb-2">Contacto de Emergencia</label>
              <div className="card bg-light border-0 p-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Nombre Contacto</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="form-control"
                      value={contacto.nombre || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contacto_emergencia: {
                            ...contacto,
                            nombre: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small">Teléfono Contacto</label>
                    <input
                      type="text"
                      placeholder="Teléfono"
                      className="form-control"
                      value={contacto.telefono || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contacto_emergencia: {
                            ...contacto,
                            telefono: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        },
        patologias: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Patologías</label>
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              placeholder="Ingrese las patologías del paciente..."
              rows="3"
            />
          </div>
        ),
      }}
      customActions={(item) => (
        <button
          className="btn btn-sm btn-info text-white me-1"
          onClick={() => navigate(`/pacientes/${item.id}/ficha`)}
          title="Ver Ficha Médica"
        >
          <i className="bi bi-file-earmark-medical-fill"></i>
        </button>
      )}
    />
  );
}
