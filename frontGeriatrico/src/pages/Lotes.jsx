import React, { useState, useEffect } from "react";
import CrudView from "../components/CrudView";
import { get } from "../api/api";

export default function Lotes() {
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const res = await get("/stock-items");
        const items = Array.isArray(res) ? res : res.data || [];
        setStockItems(items);
      } catch (error) {
        console.error("Error loading stock items:", error);
      }
    };
    fetchStockItems();
  }, []);

  const columns = [
    {
      key: "stock_item_id",
      label: "Medicamento",
      render: (value, item) => item.stock_item?.nombre || "-",
    },
    { key: "numero_lote", label: "Nº Lote" },
    {
      key: "cantidad_actual",
      label: "Stock",
      render: (value, item) => {
        const stockItem = item.stock_item;
        if (!stockItem) return `${value}`;
        
        // Mostrar con unidad
        let texto = `${value} ${stockItem.unidad_medida || ''}`;
        
        // Si tiene conversión, mostrar equivalencia
        if (stockItem.unidad_presentacion && stockItem.factor_conversion && stockItem.factor_conversion > 1) {
          const presentacion = Math.floor(value / stockItem.factor_conversion);
          const resto = value % stockItem.factor_conversion;
          
          if (presentacion > 0) {
            texto += ` (≈ ${presentacion} ${stockItem.unidad_presentacion}`;
            if (resto > 0) {
              texto += ` + ${resto} ${stockItem.unidad_medida}`;
            }
            texto += ')';
          }
        }
        
        return texto;
      },
    },
    {
      key: "fecha_vencimiento",
      label: "Vencimiento",
      render: (value) => {
        if (!value) return "-";
        const fecha = new Date(value);
        const diasRestantes = Math.ceil((fecha - new Date()) / (1000 * 60 * 60 * 24));
        const isProximo = diasRestantes <= 30 && diasRestantes >= 0;
        const isVencido = diasRestantes < 0;
        
        return (
          <span className={isVencido ? "text-danger fw-bold" : isProximo ? "text-warning fw-bold" : ""}>
            {fecha.toLocaleDateString("es-AR")}
            {isProximo && !isVencido && ` (${diasRestantes}d)`}
            {isVencido && " (VENCIDO)"}
          </span>
        );
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span
          className={`badge ${
            value === "activo"
              ? "bg-success"
              : value === "vencido"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {value === "activo" ? "Activo" : value === "vencido" ? "Vencido" : "Agotado"}
        </span>
      ),
    },
    {
      key: "precio_compra",
      label: "Precio Compra",
      render: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : "-"),
    },
  ];

  return (
    <CrudView
      endpoint="/lotes-stock"
      columns={columns}
      title="Gestión de Lotes de Stock"
      canCreate={true}
      canEdit={true}
      canDelete={false}
      formFields={[
        { key: 'stock_item_id', colSize: 12 },
        { key: 'numero_lote', colSize: 6 },
        { key: 'fecha_vencimiento', colSize: 6 },
        { key: 'tipo_cantidad', colSize: 12 },
        { key: 'cantidad_inicial', colSize: 6 },
        { key: 'precio_compra', colSize: 6 },
        { key: 'observaciones', colSize: 12 }
      ]}
      customFields={{
        stock_item_id: ({ name, value, onChange, className, form, setForm }) => {
          const selectedItem = stockItems.find(item => item.id == value);
          
          return (
            <div>
              <label className="form-label fw-bold">Medicamento / Insumo *</label>
              <select
                name={name}
                value={value || ""}
                onChange={(e) => {
                  onChange(e);
                  // Reset tipo_cantidad cuando cambia el medicamento
                  setForm(prev => ({ ...prev, tipo_cantidad: 'base' }));
                }}
                className={className}
                required
              >
                <option value="">Seleccione medicamento/insumo</option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
              
              {/* Mostrar info del item seleccionado */}
              {selectedItem && (
                <div className="alert alert-info mt-2 mb-0" style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                  <strong>📋 Unidad base:</strong> {selectedItem.unidad_medida}
                  {selectedItem.unidad_presentacion && selectedItem.factor_conversion && (
                    <>
                      <br/>
                      <strong>📦 Presentación:</strong> 1 {selectedItem.unidad_presentacion} = {selectedItem.factor_conversion} {selectedItem.unidad_medida}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        },
        numero_lote: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Número de Lote *</label>
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              placeholder="Ej: LOTE-2024-001"
              required
            />
            <small className="text-muted d-block mt-1">
              Identificador único del lote
            </small>
          </div>
        ),
        fecha_vencimiento: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Fecha de Vencimiento *</label>
            <input
              type="date"
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              required
            />
          </div>
        ),
        tipo_cantidad: ({ name, value, onChange, className, form }) => {
          const selectedItem = stockItems.find(item => item.id == form.stock_item_id);
          
          // Solo mostrar si el item tiene conversión
          if (!selectedItem || !selectedItem.unidad_presentacion || !selectedItem.factor_conversion || selectedItem.factor_conversion <= 1) {
            return null;
          }
          
          return (
            <div>
              <label className="form-label fw-bold">¿En qué unidad ingresa la cantidad?</label>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name={name}
                  id="tipo-base"
                  value="base"
                  checked={value === 'base' || !value}
                  onChange={onChange}
                />
                <label className="btn btn-outline-primary" htmlFor="tipo-base">
                  {selectedItem.unidad_medida}
                  <small className="d-block" style={{fontSize: '0.7rem'}}>Unidad base</small>
                </label>
                
                <input
                  type="radio"
                  className="btn-check"
                  name={name}
                  id="tipo-presentacion"
                  value="presentacion"
                  checked={value === 'presentacion'}
                  onChange={onChange}
                />
                <label className="btn btn-outline-primary" htmlFor="tipo-presentacion">
                  {selectedItem.unidad_presentacion}
                  <small className="d-block" style={{fontSize: '0.7rem'}}>Presentación</small>
                </label>
              </div>
            </div>
          );
        },
        cantidad_inicial: ({ name, value, onChange, className, form }) => {
          const selectedItem = stockItems.find(item => item.id == form.stock_item_id);
          const tipoCantidad = form.tipo_cantidad || 'base';
          
          if (!selectedItem) {
            return (
              <div>
                <label className="form-label fw-bold">Cantidad *</label>
                <input
                  type="number"
                  name={name}
                  value={value || ""}
                  onChange={onChange}
                  className={className}
                  step="0.01"
                  min="0.01"
                  placeholder="Cantidad"
                  required
                />
              </div>
            );
          }
          
          let unidad = selectedItem.unidad_medida || 'unidades';
          if (tipoCantidad === 'presentacion' && selectedItem.unidad_presentacion) {
            unidad = selectedItem.unidad_presentacion;
          }
          
          // Calcular equivalencia si está en presentación
          let equivalencia = null;
          if (tipoCantidad === 'presentacion' && selectedItem.factor_conversion && value) {
            const cantidadBase = value * selectedItem.factor_conversion;
            equivalencia = (
              <div className="alert alert-success mt-2 mb-0" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                ✓ Se almacenarán <strong>{cantidadBase} {selectedItem.unidad_medida}</strong>
              </div>
            );
          }
          
          return (
            <div>
              <label className="form-label fw-bold">
                Cantidad en {unidad} *
              </label>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={onChange}
                className={className}
                step="0.01"
                min="0.01"
                placeholder={`Cantidad en ${unidad}`}
                required
              />
              {equivalencia}
            </div>
          );
        },
        precio_compra: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Precio de Compra (opcional)</label>
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
            <small className="text-muted d-block mt-1">
              Precio unitario por unidad base
            </small>
          </div>
        ),
        observaciones: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Observaciones (opcional)</label>
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              className={className}
              rows="2"
              placeholder="Información adicional sobre el lote..."
            />
          </div>
        ),
        // Ocultar campos que se calculan automáticamente
        estado: () => null,
        cantidad_actual: () => null,
        fecha_ingreso: () => null,
      }}
    />
  );
}
