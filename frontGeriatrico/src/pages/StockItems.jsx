import React, { useState, useEffect } from "react";
import CrudView from "../components/CrudView";
import PatientSelect from "../components/PatientSelect";
import { useAuth } from "../context/AuthContext";
import { get } from "../api/api";

export default function StockItems() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "medico";
  const [proveedores, setProveedores] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProv, resMed, resStock] = await Promise.all([
            get("/proveedores"),
            get("/medicamentos"),
            get("/stock-items")
        ]);
        
        setProveedores(Array.isArray(resProv) ? resProv : resProv.data || []);

        // Recopilar nombres únicos para sugerencias
        const nombresMedicamentos = (Array.isArray(resMed) ? resMed : resMed.data || []).map(m => m.nombre);
        const nombresStock = (Array.isArray(resStock) ? resStock : resStock.data || []).map(s => s.nombre);
        const unicos = [...new Set([...nombresMedicamentos, ...nombresStock])].sort();
        setSugerencias(unicos);

      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { key: "nombre", label: "Nombre" },
    {
      key: "tipo",
      label: "Tipo",
      render: (value) => (
        <span
          className={`badge ${
            value === "medicamento" ? "bg-primary" : "bg-info"
          }`}
        >
          {value === "medicamento" ? "Medicamento" : "Insumo"}
        </span>
      ),
    },
    { key: "unidad_medida", label: "Unidad Medida" },
    { key: "codigo", label: "Código" },
    {
      key: "propiedad",
      label: "Propietario",
      render: (value, item) => {
        if (value === "geriatrico") {
          return (
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
              <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i> Geriátrico
            </span>
          );
        }
        if (value === "paciente" && item.paciente_propietario) {
          return (
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
              <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i> {item.paciente_propietario.nombre} {item.paciente_propietario.apellido}
            </span>
          );
        }
        return "-";
      },
    },
    {
      key: "paciente_propietario_id",
      label: "Paciente Propietario",
      // Ocultamos en la tabla porque ya se muestra en la columna 'propiedad'
      render: () => null,
      // Pero esto asegura que CrudView genere el campo en el formulario
    },
    {
      key: "stock_actual",
      label: "Stock Actual",
      render: (value, item) => {
        const isBajo = value <= item.stock_minimo;
        
        // Calcular equivalencia si tiene conversión
        let equivalencia = null;
        if (item.unidad_presentacion && item.factor_conversion && item.factor_conversion > 1) {
          const presentacion = Math.floor(value / item.factor_conversion);
          const resto = value % item.factor_conversion;
          
          if (presentacion > 0 || resto > 0) {
            equivalencia = (
              <small className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                ≈ {presentacion > 0 && `${presentacion} ${item.unidad_presentacion}`}
                {presentacion > 0 && resto > 0 && ' + '}
                {resto > 0 && `${resto} ${item.unidad_medida}`}
              </small>
            );
          }
        }
        
        return (
          <div>
            <span className={`badge ${isBajo ? "bg-warning text-dark" : "bg-success"}`}>
              {value} {item.unidad_medida}
            </span>
            {equivalencia}
          </div>
        );
      },
    },
    { key: "stock_minimo", label: "Stock Mínimo" },
    {
      key: "precio_unitario",
      label: "Precio Unit.",
      render: (value) =>
        value ? `$${parseFloat(value).toFixed(2)}` : "-",
    },
    {
      key: "proveedor_id",
      label: "Proveedor",
      render: (value, item) => item.proveedor?.nombre || "-",
    },
  ];

  return (
    <CrudView
      endpoint="/stock-items"
      columns={columns}
      title="Gestión de Stock"
      canCreate={canManage}
      canEdit={canManage}
      canDelete={user?.role === "admin"}
      formFields={[
        { key: 'nombre', colSize: 8 },
        { key: 'tipo', colSize: 4 },
        { key: 'propiedad', colSize: 6 },
        { key: 'paciente_propietario_id', colSize: 6 },
        { key: 'unidad_medida', colSize: 6 },
        { key: 'unidad_presentacion', colSize: 6 },
        { key: 'factor_conversion', colSize: 6 },
        { key: 'descripcion_presentacion', colSize: 6 },
        { key: 'stock_actual', colSize: 4 },
        { key: 'fecha_vencimiento_inicial', colSize: 4 },
        { key: 'stock_minimo', colSize: 4 },
        { key: 'stock_maximo', colSize: 4 },
        { key: 'proveedor_id', colSize: 6 },
        { key: 'precio_unitario', colSize: 6 },
        { key: 'descripcion', colSize: 12 },
        { key: 'observaciones', colSize: 12 }
      ]}
      customFields={{
        nombre: ({ name, value, onChange, className }) => (
          <>
            <label className="form-label fw-bold">Nombre *</label>
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              list="nombres-sugeridos"
              placeholder="Ej: Ibuprofeno 600mg"
              required
            />
            <datalist id="nombres-sugeridos">
                {sugerencias.map((s, i) => (
                    <option key={i} value={s} />
                ))}
            </datalist>
          </>
        ),
        propiedad: ({ name, value, onChange, className, setForm }) => {
          React.useEffect(() => {
             if (!value) setForm(prev => ({ ...prev, [name]: "geriatrico" }));
          }, []);
          return (
          <div>
            <label className="form-label fw-bold">Propietario *</label>
            <select
              name={name}
              value={value || "geriatrico"}
              onChange={onChange}
              className={className}
              required
            >
              <option value="geriatrico">Geriátrico (Stock General)</option>
              <option value="paciente">Paciente (Stock Individual)</option>
            </select>
          </div>
          );
        },
        paciente_propietario_id: ({ name, value, onChange, className, form }) => {
          if (form.propiedad !== "paciente") return null;
          return (
            <div className="mt-2">
              <label className="form-label fw-bold">Seleccione Paciente Propietario *</label>
              <PatientSelect
                name={name}
                value={value}
                onChange={onChange}
                className={className}
                required={form.propiedad === "paciente"}
              />
            </div>
          );
        },
        tipo: ({ name, value, onChange, className, setForm }) => {
          React.useEffect(() => {
             if (!value) setForm(prev => ({ ...prev, [name]: "medicamento" }));
          }, []);
          return (
          <div>
            <label className="form-label fw-bold">Tipo de Item *</label>
            <select
              name={name}
              value={value || "medicamento"}
              onChange={onChange}
              className={className}
              required
            >
              <option value="medicamento">Medicamento</option>
              <option value="insumo">Insumo Médico</option>
            </select>
          </div>
          );
        },
        unidad_medida: ({ name, value, onChange, className, setForm }) => {
          React.useEffect(() => {
             if (!value) setForm(prev => ({ ...prev, [name]: "pastilla" }));
          }, []);
          return (
          <div>
            <label className="form-label fw-bold">Unidad de Medida (Base) *</label>
            <select
              name={name}
              value={value || "pastilla"}
              onChange={onChange}
              className={className}
              required
            >
              <optgroup label="Medicamentos">
                <option value="pastilla">Pastilla / Comprimido</option>
                <option value="capsula">Cápsula</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="gota">Gotas</option>
                <option value="unidad">Unidades (insulina, etc.)</option>
              </optgroup>
              <optgroup label="Insumos">
                <option value="ampolla">Ampolla</option>
                <option value="jeringa">Jeringa</option>
                <option value="unidad">Unidad</option>
                <option value="par">Par (guantes)</option>
              </optgroup>
            </select>
            <small className="text-muted d-block mt-1">Unidad mínima de administración</small>
          </div>
          );
        },
        unidad_presentacion: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Presentación de Compra (Opcional)</label>
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
            >
              <option value="">Sin presentación especial</option>
              <optgroup label="Presentaciones Comunes">
                <option value="blister">Blister</option>
                <option value="frasco">Frasco</option>
                <option value="caja">Caja</option>
                <option value="pen">Pen (insulina)</option>
                <option value="envase">Envase</option>
                <option value="paquete">Paquete</option>
                <option value="tubo">Tubo</option>
              </optgroup>
            </select>
            <small className="text-muted d-block mt-1">Seleccione si compra en blisters, cajas, etc.</small>
          </div>
        ),
        factor_conversion: ({ name, value, onChange, className, form }) => {
          if (!form.unidad_presentacion) return null;
          return (
            <div>
              <label className="form-label fw-bold">Factor de Conversión *</label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                step="1"
                min="2"
                placeholder={`Ej: 30`}
                required
              />
              <small className="text-muted d-block mt-1">
                1 {form.unidad_presentacion} = <strong>X</strong> {form.unidad_medida || 'unidades'}
              </small>
              {value && parseFloat(value) < 2 && (
                <small className="text-danger d-block mt-1">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>El factor debe ser mayor o igual a 2 (mínimo 2 unidades por presentación)
                </small>
              )}
            </div>
          );
        },
        descripcion_presentacion: ({ name, value, onChange, className, form }) => {
          if (!form.unidad_presentacion) return null;
          return (
            <div>
              <label className="form-label fw-bold">Descripción de Presentación</label>
              <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                placeholder={`Ej: Blister de 30 comprimidos`}
              />
            </div>
          );
        },
        proveedor_id: ({ name, value, onChange, className, form }) => {
          if (form.propiedad === "paciente") return null;
          return (
            <div>
              <label className="form-label fw-bold">Proveedor Habitual</label>
              <select
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        stock_actual: ({ name, value, onChange, className, form }) => {
          const isEditing = form.id; // Si tiene ID, está editando

          if (isEditing) {
            // En modo edición: mostrar solo lectura
            return (
              <div>
                <label className="form-label fw-bold">Stock Actual</label>
                <input
                  type="text"
                  value={`${value || 0} ${form.unidad_medida || 'unidades'}`}
                  className="form-control bg-light"
                  disabled
                  readOnly
                />
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-info-circle me-1"></i>El stock se calcula automáticamente sumando todos los lotes.
                  Use "Gestión de Lotes" para ingresar stock.
                </small>
              </div>
            );
          }

          // En modo creación: permitir stock inicial
          return (
            <div>
              <label className="form-label fw-bold">Stock Inicial</label>
              <input
                type="number"
                name={name}
                value={value || 0}
                onChange={onChange}
                className={className}
                min="0"
              />
              <small className="text-muted d-block mt-1">
                <i className="bi bi-lightbulb me-1"></i>Si ingresa stock inicial, se creará automáticamente un lote.
                Recomendado: dejar en 0 y crear lotes después.
              </small>
            </div>
          );
        },
        fecha_vencimiento_inicial: ({ name, value, onChange, className, form }) => {
          const isEditing = form.id;
          const hasStockInicial = !isEditing && parseFloat(form.stock_actual || 0) > 0;

          // Solo mostrar en creación y si hay stock inicial
          if (isEditing || !hasStockInicial) return null;

          return (
            <div>
              <label className="form-label fw-bold">Vencimiento del Lote Inicial</label>
              <input
                type="date"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                min={new Date().toISOString().split('T')[0]}
              />
              <small className="text-muted d-block mt-1">
                <i className="bi bi-calendar me-1"></i>Opcional. Si no ingresa, se asignará vencimiento en 2 años.
              </small>
            </div>
          );
        },
        stock_minimo: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Stock Mínimo (Alerta) *</label>
            <input
              type="number"
              name={name}
              value={value || 0}
              onChange={onChange}
              className={className}
              min="0"
              required
            />
          </div>
        ),
        stock_maximo: ({ name, value, onChange, className, form }) => {
          const stockMinimo = parseInt(form.stock_minimo) || 0;
          const stockMaximo = parseInt(value) || 0;
          const isInvalid = value && stockMaximo > 0 && stockMaximo < stockMinimo;

          return (
            <div>
              <label className="form-label fw-bold">Stock Máximo (Opcional)</label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={`${className} ${isInvalid ? 'is-invalid' : ''}`}
                min={stockMinimo}
              />
              {isInvalid && (
                <small className="text-danger d-block mt-1">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>El stock máximo debe ser mayor o igual al stock mínimo ({stockMinimo})
                </small>
              )}
            </div>
          );
        },
        precio_unitario: ({ name, value, onChange, className, form }) => {
          if (form.propiedad === "paciente") return null;
          return (
            <div>
              <label className="form-label fw-bold">Precio Unitario Referencia</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
          );
        },
        descripcion: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Descripción (Opcional)</label>
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              rows="2"
              placeholder="Detalles adicionales del medicamento..."
            />
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
              placeholder="Notas internas..."
            />
          </div>
        ),
      }}
    />
  );
}
