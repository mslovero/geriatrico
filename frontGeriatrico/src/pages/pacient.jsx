import { useEffect, useState } from "react";
import CrudView from "../components/CrudView";
import { get } from "../api/api";

export default function Pacient() {
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

  // Filtrar camas cuando se carga un paciente para editar
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
  ];

  return (
    <CrudView
      endpoint="/pacientes"
      columns={columns}
      title="Gestión de Pacientes"
      onEdit={onEditPaciente}
      customFields={{
        habitacion_id: ({ name, value, onChange, className, form, setForm }) => (
          <select
            name={name}
            value={value}
            onChange={(e) => {
              onChange(e);
              // Filtrar camas de la habitación seleccionada
              const habitacionId = e.target.value;
              if (habitacionId) {
                const camasFiltradas = camas.filter(
                  (cama) => cama.habitacion_id === parseInt(habitacionId) &&
                  (cama.estado === "libre" || cama.id === form.cama_id)
                );
                setCamasFiltradas(camasFiltradas);
              } else {
                setCamasFiltradas([]);
              }
              // Limpiar selección de cama solo si cambiamos a una habitación diferente
              if (e.target.value !== value) {
                setForm({ ...form, habitacion_id: e.target.value, cama_id: "" });
              }
            }}
            className={className}
          >
            <option value="">Seleccionar habitación</option>
            {habitaciones.map((habitacion) => (
              <option key={habitacion.id} value={habitacion.id}>
                Habitación {habitacion.numero} (Capacidad: {habitacion.capacidad})
              </option>
            ))}
          </select>
        ),
        cama_id: ({ name, value, onChange, className, form }) => (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={className}
            disabled={!form.habitacion_id}
          >
            <option value="">
              {form.habitacion_id
                ? "Seleccionar cama"
                : "Primero seleccione una habitación"}
            </option>
            {camasFiltradas.map((cama) => (
              <option key={cama.id} value={cama.id}>
                Cama {cama.numero_cama} ({cama.estado})
              </option>
            ))}
          </select>
        ),
        estado: ({ name, value, onChange, className }) => (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={className}
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
        ),
        contacto_emergencia: ({ form, setForm }) => (
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                placeholder="Nombre del contacto"
                className="form-control mb-2"
                value={form.contacto_emergencia?.nombre || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contacto_emergencia: {
                      ...form.contacto_emergencia,
                      nombre: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                placeholder="Teléfono del contacto"
                className="form-control"
                value={form.contacto_emergencia?.telefono || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contacto_emergencia: {
                      ...form.contacto_emergencia,
                      telefono: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        ),
      }}
    />
  );
}
