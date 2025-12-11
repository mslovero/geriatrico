import React, { useState, useEffect } from "react";
import { get } from "../api/api";
import { Link } from "react-router-dom";
import {
  BoxSeam,
  ExclamationTriangle,
  CalendarX,
  Plus,
} from "react-bootstrap-icons";
import EmptyState from "../components/EmptyState";

export default function StockDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    bajoStock: 0,
    proximosVencer: 0,
    valorTotal: 0,
  });
  const [itemsBajoStock, setItemsBajoStock] = useState([]);
  const [itemsProximosVencer, setItemsProximosVencer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, bajoStockRes, vencerRes] = await Promise.all([
          get("/stock-items"),
          get("/stock-items-bajo-stock"),
          get("/stock-items-proximos-vencer"),
        ]);

        const stock = Array.isArray(stockRes) ? stockRes : stockRes.data || [];
        const bajo = Array.isArray(bajoStockRes)
          ? bajoStockRes
          : bajoStockRes.data || [];
        const vencer = Array.isArray(vencerRes)
          ? vencerRes
          : vencerRes.data || [];

        const valorTotal = stock.reduce(
          (sum, item) => sum + (item.precio_unitario || 0) * item.stock_actual,
          0
        );

        setStats({
          totalItems: stock.length,
          bajoStock: bajo.length,
          proximosVencer: vencer.length,
          valorTotal,
        });

        setItemsBajoStock(bajo);
        setItemsProximosVencer(vencer);
      } catch (error) {
        console.error("Error loading stock data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, colorClass, link }) => (
    <div className="col-md-6 col-lg-3 mb-4">
      <Link to={link} className="text-decoration-none">
        <div className="card h-100 border-0 shadow-sm hover-lift">
          <div className="card-body">
            <div
              className={`d-inline-flex align-items-center justify-content-center p-3 rounded-3 bg-${colorClass} bg-opacity-10 text-${colorClass} mb-3`}
            >
              {React.cloneElement(icon, { size: 24 })}
            </div>
            <h6 className="text-muted text-uppercase fw-bold small mb-1">
              {title}
            </h6>
            <h2 className="display-6 fw-bold text-dark mb-0">{value}</h2>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="fw-bold text-gradient mb-2">
            Gestión de Stock
          </h1>
          <p className="text-muted mb-0">
            Control de medicamentos e insumos médicos
          </p>
        </div>
        <div className="d-none d-md-flex gap-2">
          <Link to="/stock/lotes" className="btn btn-outline-secondary shadow-sm">
            <i className="bi bi-box-seam me-1"></i> Gestionar Lotes
          </Link>
          <Link to="/stock/reportes" className="btn btn-outline-primary shadow-sm">
            <i className="bi bi-graph-up me-1"></i> Ver Reportes
          </Link>
          <Link to="/stock/items" className="btn btn-primary shadow-sm">
            <Plus size={20} className="me-2" />
            Gestionar Stock
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={<BoxSeam />}
          colorClass="primary"
          link="/stock/items"
        />
        <StatCard
          title="Bajo Stock"
          value={stats.bajoStock}
          icon={<ExclamationTriangle />}
          colorClass="warning"
          link="/stock/items"
        />
        <StatCard
          title="Próximos a Vencer"
          value={stats.proximosVencer}
          icon={<CalendarX />}
          colorClass="danger"
          link="/stock/items"
        />
        <StatCard
          title="Valor Total"
          value={`$${stats.valorTotal.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`}
          icon={<BoxSeam />}
          colorClass="success"
          link="/stock/items"
        />
      </div>

      <div className="row g-4">
        {/* Items bajo stock */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 px-4">
              <h5 className="mb-0 fw-bold text-warning">
                <ExclamationTriangle className="me-2" />
                Alertas de Stock Bajo
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 border-0">Item</th>
                      <th className="border-0">Stock Actual</th>
                      <th className="border-0">Stock Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsBajoStock.length > 0 ? (
                      itemsBajoStock.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="fw-bold">{item.nombre}</div>
                            <small className="text-muted">{item.tipo}</small>
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark">
                              {item.stock_actual}
                            </span>
                          </td>
                          <td>{item.stock_minimo}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="border-0 p-0">
                          <EmptyState
                            type="success"
                            title="Todo en orden"
                            message="No hay medicamentos con stock por debajo del mínimo. Excelente gestión!"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Lotes próximos a vencer */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 px-4">
              <h5 className="mb-0 fw-bold text-danger">
                <CalendarX className="me-2" />
                Lotes Próximos a Vencer
              </h5>
              <small className="text-muted">Próximos 30 días</small>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 border-0">Item</th>
                      <th className="border-0">Lote</th>
                      <th className="border-0">Stock</th>
                      <th className="border-0">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsProximosVencer.length > 0 ? (
                      itemsProximosVencer.flatMap((item) =>
                        (item.lotes || []).slice(0, 2).map((lote) => {
                          const fecha = new Date(lote.fecha_vencimiento);
                          const diasRestantes = Math.ceil((fecha - new Date()) / (1000 * 60 * 60 * 24));
                          const isVencido = diasRestantes < 0;
                          const isCritico = diasRestantes <= 7 && diasRestantes >= 0;

                          return (
                            <tr key={`${item.id}-${lote.id}`}>
                              <td className="ps-4">
                                <div className="fw-bold">{item.nombre}</div>
                                <small className="text-muted">{item.tipo}</small>
                              </td>
                              <td>
                                <small className="font-monospace">{lote.numero_lote}</small>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {lote.cantidad_actual} {item.unidad_medida}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${isVencido ? 'bg-dark' : isCritico ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                  {fecha.toLocaleDateString("es-AR")}
                                  {!isVencido && ` (${diasRestantes}d)`}
                                  {isVencido && <><i className="bi bi-exclamation-triangle-fill ms-1"></i> VENCIDO</>}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ).slice(0, 5)
                    ) : (
                      <tr>
                        <td colSpan="4" className="border-0 p-0">
                          <EmptyState
                            type="success"
                            title="Sin vencimientos próximos"
                            message="Todos los lotes tienen fechas de vencimiento lejanas. Control óptimo del inventario."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {itemsProximosVencer.flatMap(item => item.lotes || []).length > 5 && (
                <div className="card-footer bg-light border-0 text-center py-2">
                  <Link to="/stock/lotes" className="text-decoration-none small fw-bold">
                    Ver todos los lotes próximos a vencer →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
