import CrudView from "../components/CrudView";

export default function Pacient() {
  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "dni", label: "DNI" },
    { key: "fecha_nacimiento", label: "Fecha de nacimiento" },
    { key: "estado", label: "Estado" },
    { key: "medico_cabecera", label: "Médico cabezera" },
    { key: "contacto_emergencia", label: "Contacto de emergencia",  colSize: 6 },

  ];

  return (
    <CrudView
      endpoint="/pacientes"
      columns={columns}
      title="Gestión de Pacientes"
      customFields={{
        estado: ({ name, value, onChange, className }) => (
          <select name={name} value={value} onChange={onChange} className={className}>
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
