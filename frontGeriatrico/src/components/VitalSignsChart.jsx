import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { get } from "../api/api";
import { Activity, ThermometerHalf, DropletFill } from "react-bootstrap-icons";

const VitalSignsChart = ({ pacienteId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState("temperatura");

  useEffect(() => {
    if (pacienteId) {
      fetchHistorial();
    }
  }, [pacienteId]);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const res = await get(`/signos-vitales/paciente/${pacienteId}?limit=30`);
      // Formatear fecha para el gráfico
      const formatted = (res.data || []).map((item) => ({
        ...item,
        fecha_corta: new Date(item.fecha).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }),
      }));
      setData(formatted);
    } catch (error) {
      console.error("Error loading vital signs history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!pacienteId) return null;

  const metrics = [
    { key: "temperatura", label: "Temperatura", color: "#ef4444", icon: <ThermometerHalf /> },
    { key: "saturacion_oxigeno", label: "Sat. Oxígeno", color: "#3b82f6", icon: <Activity /> },
    { key: "frecuencia_cardiaca", label: "Pulso", color: "#ec4899", icon: <Activity /> },
    { key: "glucosa", label: "Glucemia", color: "#f59e0b", icon: <DropletFill /> },
  ];

  const currentMetric = metrics.find(m => m.key === activeMetric);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h5 className="mb-0 fw-bold text-dark">
          <Activity className="me-2 text-primary" />
          Evolución de Salud
        </h5>
        <div className="d-flex overflow-auto pb-1 pb-md-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="btn-group btn-group-sm flex-nowrap">
            {metrics.map((m) => (
              <button
                key={m.key}
                className={`btn text-nowrap ${activeMetric === m.key ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveMetric(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="card-body px-4 pb-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : data.length > 0 ? (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="fecha_corta" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={activeMetric}
                  name={currentMetric.label}
                  stroke={currentMetric.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: currentMetric.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-5 text-muted fst-italic">
            No hay registros suficientes para mostrar una tendencia.
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalSignsChart;
