import React, { useState } from "react";
import CrudView from "../components/CrudView";
import PatientSelect from "../components/PatientSelect";
import { useAuth } from "../context/AuthContext";
import AdministrarMedicacionModal from "../components/AdministrarMedicacionModal";
import { Capsule } from "react-bootstrap-icons";
import { get } from "../api/api";

export default function Medicaciones() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  const handleAdministrar = (item) => {
    setSelectedMed(item);
    setShowAdminModal(true);
  };

  const [stockItems, setStockItems] = useState([]);
  const [modoManual, setModoManual] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);

  // Cargar stock items filtrados según paciente y origen de pago
  React.useEffect(() => {
    const fetchStock = async () => {
        if (!currentForm?.paciente_id || !currentForm?.origen_pago) {
          // Si no hay paciente u origen de pago, limpiar stock
          setStockItems([]);
          return;
        }

        // Si el origen es obra social, no necesitamos stock
        if (currentForm.origen_pago === 'obra_social') {
          setStockItems([]);
          return;
        }

        try {
            let url = "/stock-items?activo=1&tipo=medicamento";

            // Filtrar según origen de pago
            if (currentForm.origen_pago === 'geriatrico') {
              url += "&propiedad=geriatrico";
            } else if (currentForm.origen_pago === 'paciente') {
              url += `&propiedad=paciente&paciente_id=${currentForm.paciente_id}`;
            }

            const res = await get(url);
            const items = Array.isArray(res) ? res : res.data || [];
            setStockItems(items);
        } catch (error) {
            console.error("Error cargando stock:", error);
            setStockItems([]);
        }
    };
    fetchStock();
  }, [currentForm?.paciente_id, currentForm?.origen_pago]);

  const columns = [
    { key: "nombre", label: "Nombre Medicación" },
    { key: "dosis", label: "Dosis" },
    { key: "frecuencia", label: "Frecuencia" },
    { key: "tipo", label: "Tipo" },
    { key: "cantidad_mensual", label: "Cant. Mensual" },
    { 
        key: "origen_pago", 
        label: "Origen Pago",
        render: (value) => {
            const badges = {
                'obra_social': 'bg-primary',
                'geriatrico': 'bg-success',
                'paciente': 'bg-warning text-dark'
            };
            const labels = {
                'obra_social': 'Obra Social',
                'geriatrico': 'Geriátrico',
                'paciente': 'Paciente'
            };
            return <span className={`badge ${badges[value] || 'bg-secondary'}`}>
                {labels[value] || value}
            </span>;
        }
    },
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
    <>
      <CrudView
        endpoint="/medicamentos"
        columns={columns}
        title="Gestión de Medicamentos"
        canCreate={canManage}
        canEdit={canManage}
        canDelete={user?.role === "admin"}
      formFields={[
        { key: 'nombre', colSize: 12 },
        { key: 'paciente_id', colSize: 12 },
        { key: 'dosis', colSize: 6 },
        { key: 'frecuencia', colSize: 6 },
        { key: 'tipo', colSize: 6 },
        { key: 'origen_pago', colSize: 6 },
        { key: 'cantidad_mensual', colSize: 12 },
        { key: 'fecha_inicio', colSize: 6 },
        { key: 'fecha_fin', colSize: 6 },
        { key: 'observaciones', colSize: 12 }
      ]}
      customFields={{
        nombre: ({ name, value, onChange, className, setForm, form }) => {
          // Sincronizar form con currentForm para el filtrado de stock
          React.useEffect(() => {
            setCurrentForm(form);
          }, [form.paciente_id, form.origen_pago]);


          if (modoManual) {
            return (
              <div>
                <label className="form-label fw-bold">Nombre Medicamento *</label>
                <input
                  type="text"
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  placeholder="Ej: Ibuprofeno 600mg"
                  required
                />
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 mt-1 text-decoration-none"
                  onClick={() => {
                    setModoManual(false);
                    setForm((prev) => ({ ...prev, stock_item_id: null, nombre: "" }));
                  }}
                >
                  ← Volver a selección de stock
                </button>
              </div>
            );
          }

          return (
            <div>
              <label className="form-label fw-bold">Nombre Medicamento (Stock) *</label>
              <select
                name={name}
                value={form.stock_item_id || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedItem = stockItems.find((i) => i.id == selectedId);
                  if (selectedItem) {
                    setForm((prev) => ({
                      ...prev,
                      nombre: selectedItem.nombre,
                      stock_item_id: selectedItem.id,
                    }));
                  }
                }}
                className={className}
                disabled={!form.paciente_id || !form.origen_pago || form.origen_pago === 'obra_social'}
              >
                <option value="">
                  {!form.paciente_id
                    ? "Primero seleccione un paciente..."
                    : !form.origen_pago
                    ? "Primero seleccione origen de pago..."
                    : form.origen_pago === 'obra_social'
                    ? "Obra social no usa stock"
                    : stockItems.length === 0
                    ? "No hay stock disponible"
                    : "Seleccione del Stock..."}
                </option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} (Stock: {item.stock_actual} {item.unidad_medida})
                  </option>
                ))}
              </select>
              <div className="d-flex justify-content-between align-items-center mt-1">
                <small className="text-muted">
                  {form.stock_item_id
                    ? <><i className="bi bi-check-circle-fill text-success me-1"></i>Vinculado a stock</>
                    : form.origen_pago === 'geriatrico'
                    ? "Mostrando solo stock del geriátrico"
                    : form.origen_pago === 'paciente'
                    ? "Mostrando solo stock del paciente seleccionado"
                    : "Seleccione paciente y origen de pago"}
                </small>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  onClick={() => {
                    setModoManual(true);
                    setForm((prev) => ({ ...prev, stock_item_id: null, nombre: "" }));
                  }}
                >
                  ¿No está en la lista? Ingresar manual
                </button>
              </div>
            </div>
          );
        },
        paciente_id: (props) => (
          <div>
            <label className="form-label fw-bold">Paciente *</label>
            <PatientSelect {...props} />
          </div>
        ),
        dosis: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Dosis</label>
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              placeholder="Ej: 600mg, 5ml, 2 pastillas"
            />
          </div>
        ),
        frecuencia: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Frecuencia</label>
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              placeholder="Ej: c/8hs, c/12hs, 1 vez al día"
            />
          </div>
        ),
        tipo: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Tipo *</label>
            <select
              name={name}
              value={value || "diaria"}
              onChange={onChange}
              className={className}
              required
            >
              <option value="diaria">Diaria (Crónica)</option>
              <option value="sos">SOS (Dolor/Ocasional)</option>
            </select>
          </div>
        ),
        cantidad_mensual: ({ name, value, onChange, className, form }) => {
          const isDiaria = (form.tipo || "diaria") === "diaria";
          if (!isDiaria) return null;
          return (
            <div>
              <label className="form-label fw-bold">Cantidad Mensual Estimada</label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder="Ej: 30, 60, 90"
              />
              <small className="text-muted d-block mt-1">
                Cantidad aproximada de unidades que el paciente consume mensualmente
              </small>
            </div>
          );
        },
        origen_pago: ({ name, value, onChange, className, setForm }) => {
          React.useEffect(() => {
            if (!value) {
              setForm((prev) => ({ ...prev, [name]: "geriatrico" }));
            }
          }, []);

          return (
            <div>
              <label className="form-label fw-bold">Origen de Pago *</label>
              <select
                name={name}
                value={value || "geriatrico"}
                onChange={onChange}
                className={className}
                required
              >
                <option value="obra_social">Obra Social</option>
                <option value="geriatrico">Geriátrico</option>
                <option value="paciente">Paciente</option>
              </select>
              <small className="text-muted d-block mt-1">
                {value === 'geriatrico' && <><i className="bi bi-lightbulb me-1"></i>Descontará del stock del geriátrico</>}
                {value === 'paciente' && <><i className="bi bi-lightbulb me-1"></i>Descontará del stock personal del paciente</>}
                {value === 'obra_social' && <><i className="bi bi-lightbulb me-1"></i>Solo registro, no afecta stock</>}
              </small>
            </div>
          );
        },
        fecha_inicio: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Fecha Inicio</label>
            <input
              type="date"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
            />
            <small className="text-muted d-block mt-1">
              Fecha de inicio del tratamiento
            </small>
          </div>
        ),
        fecha_fin: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Fecha Fin (opcional)</label>
            <input
              type="date"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
            />
            <small className="text-muted d-block mt-1">
              Dejar vacío si el tratamiento es indefinido
            </small>
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
              placeholder="Notas adicionales..."
            />
          </div>
        ),
      }}
        customActions={(item) => (
          <button
            className="btn btn-sm btn-outline-success ms-1"
            onClick={() => handleAdministrar(item)}
            title="Administrar Medicación"
          >
            <Capsule />
          </button>
        )}
        headerActions={() => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-info text-white shadow-sm d-flex align-items-center gap-2"
              onClick={() => window.location.href = "/medicamentos/estado"}
            >
              <i className="bi bi-activity"></i>
              <span>Estado Stock</span>
            </button>
            <button
              className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
              onClick={() => window.location.href = "/medicamentos/carga"}
            >
              <i className="bi bi-stack"></i>
              <span>Carga Masiva</span>
            </button>
          </div>
        )}
      />

      <AdministrarMedicacionModal
        show={showAdminModal}
        onHide={() => setShowAdminModal(false)}
        medicacion={selectedMed}
        onSuccess={() => {
          // Opcional: recargar datos si fuera necesario
        }}
      />
    </>
  );
}
