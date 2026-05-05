import React, { useEffect, useState } from "react";
import { get, post } from "../api/api";
import Swal from "sweetalert2";
import {
  PeopleFill,
  Hospital,
  Capsule,
  Bell,
  Activity,
  CalendarCheck,
  ExclamationTriangle,
  ArrowRight,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Dash,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import SkeletonLoader from "../components/SkeletonLoader";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await get("/dashboard-stats");
        setData(res);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-5 px-lg-5">
        {/* Header Skeleton */}
        <div className="mb-5 animate-pulse">
          <div
            className="skeleton-line mb-2"
            style={{ width: "200px", height: "32px" }}
          ></div>
          <div
            className="skeleton-line mb-3"
            style={{ width: "400px", height: "48px" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "500px", height: "20px" }}
          ></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="row g-4 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <div
                      className="skeleton-circle"
                      style={{ width: "50px", height: "50px" }}
                    ></div>
                    <div
                      className="skeleton-line"
                      style={{ width: "50px", height: "24px" }}
                    ></div>
                  </div>
                  <div
                    className="skeleton-line mb-2"
                    style={{ width: "60%", height: "14px" }}
                  ></div>
                  <div
                    className="skeleton-line mb-3"
                    style={{ width: "40%", height: "36px" }}
                  ></div>
                  <div
                    className="skeleton-line"
                    style={{ width: "80%", height: "12px" }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div
                  className="skeleton-line mb-4"
                  style={{ width: "300px", height: "24px" }}
                ></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="mb-3">
                    <div
                      className="skeleton-line mb-2"
                      style={{ width: "100%", height: "60px" }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div
                  className="skeleton-line mb-4"
                  style={{ width: "200px", height: "24px" }}
                ></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="mb-3">
                    <div
                      className="skeleton-line"
                      style={{ width: "100%", height: "50px" }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, turnos_proximos, alertas_salud_detalles, notificaciones } =
    data;

  const StatCard = ({
    title,
    value,
    icon,
    colorClass,
    subtitle,
    link,
    staggerClass,
    trend,
  }) => (
    <div className={`col-md-6 col-lg-3 animate-slide-up ${staggerClass}`}>
      <Link to={link} className="text-decoration-none stat-card-link">
        <div
          className={`stat-card-premium position-relative overflow-hidden border-0 rounded-4 shadow-lg h-100 bg-gradient-${colorClass}`}
          style={{
            background: `linear-gradient(135deg, var(--${colorClass}-50) 0%, var(--${colorClass}-100) 100%)`,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Gradient Overlay */}
          <div
            className="position-absolute w-100 h-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)",
              zIndex: 0,
            }}
          ></div>

          {/* Card Content */}
          <div
            className="card-body p-4 position-relative"
            style={{ zIndex: 1 }}
          >
            {/* Top Section: Icon & Badge */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              {/* Icon Container */}
              <div
                className={`stat-icon-container bg-${colorClass} shadow-sm`}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Icon glow effect */}
                <div
                  className={`position-absolute w-100 h-100 bg-${colorClass} rounded-3 opacity-50 blur-effect`}
                  style={{ filter: "blur(12px)" }}
                ></div>
                <div className="position-relative text-white">
                  {React.cloneElement(icon, { size: 32, strokeWidth: 1.5 })}
                </div>
              </div>

              {/* Badges Container */}
              <div className="d-flex flex-column align-items-end gap-2">
                {/* Live Badge */}
                <div
                  className={`badge-live bg-white shadow-sm px-3 py-2 rounded-pill d-flex align-items-center gap-2`}
                  style={{ fontSize: "0.7rem", fontWeight: "600" }}
                >
                  <span
                    className={`pulse-indicator bg-${colorClass}`}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  ></span>
                  <span className="text-muted">EN VIVO</span>
                </div>

                {/* Trend Badge */}
                {trend && (
                  <div
                    className={`trend-badge px-2 py-1 rounded d-flex align-items-center gap-1`}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor:
                        trend.direction === "up"
                          ? "rgba(16, 185, 129, 0.15)"
                          : trend.direction === "down"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(156, 163, 175, 0.15)",
                      color:
                        trend.direction === "up"
                          ? "#10b981"
                          : trend.direction === "down"
                            ? "#ef4444"
                            : "#9ca3af",
                    }}
                  >
                    {trend.direction === "up" ? (
                      <ArrowUp size={12} strokeWidth={3} />
                    ) : trend.direction === "down" ? (
                      <ArrowDown size={12} strokeWidth={3} />
                    ) : (
                      <Dash size={12} strokeWidth={3} />
                    )}
                    <span>{trend.value}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section: Title & Value */}
            <div className="mb-4">
              <div
                className="text-muted text-uppercase mb-2"
                style={{
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  opacity: 0.7,
                }}
              >
                {title}
              </div>
              <div
                className={`stat-value text-${colorClass} fw-black lh-1`}
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.5rem)",
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {value}
              </div>
            </div>

            {/* Bottom Section: Subtitle & Arrow */}
            {subtitle && (
              <div
                className="d-flex align-items-center justify-content-between pt-3"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div
                  className="text-muted small fw-medium"
                  style={{ fontSize: "0.8rem" }}
                >
                  {subtitle}
                </div>
                <div
                  className={`arrow-icon text-${colorClass}`}
                  style={{
                    transition: "transform 0.3s ease",
                    opacity: 0.6,
                  }}
                >
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </div>
            )}
          </div>

          {/* Background Decorative Icon */}
          <div
            className={`stat-bg-icon position-absolute text-${colorClass}`}
            style={{
              bottom: "-20px",
              right: "-20px",
              opacity: "0.08",
              transform: "rotate(-12deg)",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {React.cloneElement(icon, { size: 120, strokeWidth: 1 })}
          </div>

          {/* Shine Effect on Hover */}
          <div
            className="shine-effect position-absolute top-0 start-0 w-100 h-100"
            style={{
              background:
                "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
              backgroundSize: "200% 200%",
              backgroundPosition: "100% 100%",
              transition: "background-position 0.6s ease",
              pointerEvents: "none",
            }}
          ></div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="container-fluid py-5 px-lg-5">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4 animate-slide-up">
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-bold">
            <ShieldCheck className="me-2" /> Sistema de Gestión Institucional
          </span>
          <h1 className="display-4 fw-black text-primary-color mb-2">
            Panel <span className="text-gradient">Ejecutivo</span>
          </h1>
          <p className="text-secondary-color fs-5 mb-0">
            Bienvenido al centro de control. Supervisa el estado crítico en
            tiempo real.
          </p>
        </div>
        <div className="d-flex gap-3">
          <Link
            to="/pacientes"
            className="btn btn-primary shadow-premium px-4 py-3 hover-glow"
          >
            <PeopleFill className="fs-5" /> <span>Nuevo Ingreso</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        <StatCard
          title="Pacientes Activos"
          value={summary.pacientes}
          icon={<PeopleFill />}
          colorClass="primary"
          subtitle="Residentes registrados"
          link="/pacientes"
          staggerClass="stagger-1"
          trend={{ direction: "up", value: 2.5 }}
        />
        <StatCard
          title="Ocupación"
          value={`${summary.camas.porcentaje}%`}
          icon={<Hospital />}
          colorClass="success"
          subtitle={`${summary.camas.libres} camas disponibles`}
          link="/camas"
          staggerClass="stagger-2"
          trend={{
            direction: summary.camas.porcentaje > 80 ? "up" : "neutral",
            value: Math.abs(summary.camas.porcentaje - 75),
          }}
        />
        <StatCard
          title="Alertas Salud"
          value={summary.alertas_salud}
          icon={<Activity />}
          colorClass={summary.alertas_salud > 0 ? "danger" : "info"}
          subtitle="Registradas hoy"
          link="/signos-vitales"
          staggerClass="stagger-3"
          trend={
            summary.alertas_salud > 0
              ? { direction: "up", value: 15 }
              : { direction: "down", value: 100 }
          }
        />
        <StatCard
          title="Stock Bajo"
          value={summary.bajo_stock}
          icon={<Capsule />}
          colorClass={summary.bajo_stock > 0 ? "warning" : "success"}
          subtitle="Insumos críticos"
          link="/stock/items"
          staggerClass="stagger-4"
          trend={
            summary.bajo_stock > 0
              ? { direction: "down", value: 8 }
              : { direction: "neutral", value: 0 }
          }
        />
      </div>

      <div className="row g-4">
        {/* Left Column: Health Alerts & Notifications */}
        <div className="col-lg-8">
          {/* Critical Health Alerts */}
          <div className="card border-0 shadow-premium mb-5 animate-slide-up stagger-2 overflow-hidden">
            <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1 fw-bold text-danger d-flex align-items-center">
                  <div className="p-2 bg-danger bg-opacity-10 rounded-circle me-3">
                    <ExclamationTriangle size={20} />
                  </div>
                  Alertas Médicas Críticas
                </h4>
                <p className="text-muted small mb-0 ms-5 ps-2">
                  Monitoreo automático de signos vitales
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2">
                  Crítico
                </span>
              </div>
            </div>
            <div className="card-body p-0">
              {alertas_salud_detalles.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="table-responsive d-none d-md-block">
                    <table className="table table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th className="ps-4">Paciente / Ubicación</th>
                          <th>Métrica Alerta</th>
                          <th>Fecha y Hora</th>
                          <th className="text-end pe-4">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alertas_salud_detalles.map((alerta) => (
                          <tr key={alerta.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar-placeholder bg-primary bg-opacity-10 text-primary me-3 rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: "40px", height: "40px" }}
                                >
                                  {alerta.paciente.nombre[0]}
                                  {alerta.paciente.apellido[0]}
                                </div>
                                <div>
                                  <div className="fw-bold text-primary-color">
                                    {alerta.paciente.nombre}{" "}
                                    {alerta.paciente.apellido}
                                  </div>
                                  <small className="text-muted-color">
                                    Cama: {alerta.paciente.cama_id || "N/A"}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                {alerta.temperatura > 38 && (
                                  <span className="badge bg-danger rounded-pill px-3 py-2">
                                    <i className="bi bi-thermometer-high me-1"></i>{" "}
                                    Fiebre: {alerta.temperatura}°C
                                  </span>
                                )}
                                {alerta.saturacion_oxigeno < 94 && (
                                  <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                                    <i className="bi bi-wind me-1"></i> Sat O2:{" "}
                                    {alerta.saturacion_oxigeno}%
                                  </span>
                                )}
                                {alerta.glucosa > 180 && (
                                  <span className="badge bg-danger rounded-pill px-3 py-2">
                                    <i className="bi bi-droplet me-1"></i>{" "}
                                    Glucosa: {alerta.glucosa}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="text-secondary-color small fw-medium">
                                <i className="bi bi-clock me-2"></i>
                                {new Date(alerta.fecha).toLocaleString(
                                  "es-AR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                                hs
                              </div>
                            </td>
                            <td className="text-end pe-4">
                              <Link
                                to={`/pacientes/${alerta.paciente_id}`}
                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                              >
                                Ver Ficha
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="d-md-none">
                    <div className="list-group list-group-flush">
                      {alertas_salud_detalles.map((alerta) => (
                        <div
                          key={alerta.id}
                          className="list-group-item p-4 border-0 border-bottom"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="avatar-placeholder bg-primary bg-opacity-10 text-primary me-3 rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                style={{ width: "45px", height: "45px" }}
                              >
                                {alerta.paciente.nombre[0]}
                                {alerta.paciente.apellido[0]}
                              </div>
                              <div>
                                <div className="fw-bold fs-5 text-primary-color">
                                  {alerta.paciente.nombre}{" "}
                                  {alerta.paciente.apellido}
                                </div>
                                <div className="small text-muted-color">
                                  Cama: {alerta.paciente.cama_id || "N/A"}
                                </div>
                              </div>
                            </div>
                            <Link
                              to={`/pacientes/${alerta.paciente_id}`}
                              className="btn btn-sm btn-primary rounded-pill px-3"
                            >
                              Ficha
                            </Link>
                          </div>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {alerta.temperatura > 38 && (
                              <span className="badge bg-danger rounded-pill px-3 py-2">
                                Fiebre: {alerta.temperatura}°C
                              </span>
                            )}
                            {alerta.saturacion_oxigeno < 94 && (
                              <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                                Sat O2: {alerta.saturacion_oxigeno}%
                              </span>
                            )}
                            {alerta.glucosa > 180 && (
                              <span className="badge bg-danger rounded-pill px-3 py-2">
                                Glucosa: {alerta.glucosa}
                              </span>
                            )}
                          </div>
                          <div className="text-muted-color small d-flex align-items-center">
                            <Bell size={14} className="me-2 text-danger" />
                            {new Date(alerta.fecha).toLocaleString("es-AR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-5 bg-light bg-opacity-50">
                  <div className="p-4 bg-white d-inline-flex rounded-circle shadow-sm mb-3">
                    <ShieldCheck size={48} className="text-success" />
                  </div>
                  <h5 className="fw-bold text-primary-color">
                    Todo bajo control
                  </h5>
                  <p className="text-muted-color mb-0">
                    No se registran alertas críticas en las últimas 24 horas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Notifications */}
          <div className="card border-0 shadow-premium animate-slide-up stagger-3 overflow-hidden">
            <div className="card-header bg-white border-0 py-4 px-4">
              <h4 className="mb-0 fw-bold d-flex align-items-center text-primary-color">
                <div className="p-2 bg-primary bg-opacity-10 rounded-circle me-3">
                  <Bell size={20} />
                </div>
                Centro de Auditoría
              </h4>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {notificaciones.length > 0 ? (
                  notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      className="list-group-item border-0 px-4 py-4 border-bottom hover-bg-light transition-all"
                    >
                      <div className="d-flex w-100 justify-content-between align-items-start">
                        <div className="d-flex align-items-start gap-4">
                          <div
                            className={`p-3 rounded-xl bg-${notif.color || "primary"} bg-opacity-10 text-${notif.color || "primary"} shadow-sm`}
                          >
                            <Bell size={18} />
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold text-primary-color fs-6">
                              {notif.titulo}
                            </h6>
                            <p className="mb-0 text-secondary-color small lh-base">
                              {notif.mensaje}
                            </p>
                            <div className="mt-2 d-flex align-items-center gap-3">
                              <small className="text-muted-color d-flex align-items-center">
                                <i className="bi bi-calendar3 me-2"></i>
                                {new Date(
                                  notif.created_at,
                                ).toLocaleDateString()}
                              </small>
                              <span className="badge bg-light text-muted-color border rounded-pill px-2">
                                Sistema
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/notificaciones"
                          className="text-primary-color opacity-25 hover-opacity-100"
                        >
                          <ArrowRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted-color mb-0">
                      No hay notificaciones recientes.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer bg-white border-top border-themed p-4 text-center">
              <Link
                to="/notificaciones"
                className="text-decoration-none fw-bold text-primary-color premium-border pb-1"
              >
                Historial de Notificaciones Completas{" "}
                <ArrowRight className="ms-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Push Control & Agenda */}
        <div className="col-lg-4">
          {/* Push Notification Control */}
          {user?.role === "admin" && (
            <div className="card border-0 shadow-premium bg-gradient-premium mb-4 animate-slide-up stagger-2 overflow-hidden">
              <div className="card-body p-4 text-white position-relative">
                <div className="position-relative z-1">
                  <h5 className="fw-bold mb-2">Conectividad Push</h5>
                  <p className="small mb-4 opacity-75">
                    Sincroniza y verifica las alertas en dispositivos móviles
                    del personal médico.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await post("/push-test");
                        Swal.fire({
                          title: "Prueba Exitosa",
                          text: "Se ha enviado la señal a todos los nodos conectados.",
                          icon: "success",
                          background: "#fff",
                          confirmButtonColor: "var(--primary-600)",
                        });
                      } catch (error) {
                        Swal.fire(
                          "Error",
                          "No se pudo establecer conexión",
                          "error",
                        );
                      }
                    }}
                    className="btn btn-outline-light w-100 py-2"
                  >
                    <i className="bi bi-broadcast me-2"></i>
                    Sincronizar Dispositivos
                  </button>
                </div>
                {/* Decoration */}
                <ShieldCheck
                  size={120}
                  className="position-absolute end-0 bottom-0 text-white opacity-10"
                  style={{ transform: "translate(10%, 20%)" }}
                />
              </div>
            </div>
          )}

          {/* Medical Agenda */}
          <div className="card border-0 shadow-premium  animate-slide-up stagger-4 overflow-hidden">
            <div className="card-header bg-white border-0 py-4 px-4">
              <h4 className="mb-0 fw-bold d-flex align-items-center text-primary-color">
                <div className="p-2 bg-primary bg-opacity-10 rounded-circle me-3 text-primary">
                  <CalendarCheck size={20} />
                </div>
                Próximos Turnos
              </h4>
            </div>
            <div className="card-body p-0">
              {turnos_proximos.length > 0 ? (
                <div className="list-group list-group-flush">
                  {turnos_proximos.map((turno) => (
                    <div
                      key={turno.id}
                      className="list-group-item border-0 px-4 py-4 border-bottom hover-bg-light transition-all"
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="bg-primary bg-opacity-10 text-primary p-2 rounded-xl text-center shadow-sm"
                          style={{ minWidth: "65px" }}
                        >
                          <div className="fw-black fs-4 lh-1">
                            {new Date(turno.fecha_hora).getDate()}
                          </div>
                          <div
                            className="small text-uppercase fw-bold"
                            style={{ fontSize: "10px", letterSpacing: "1px" }}
                          >
                            {new Date(turno.fecha_hora).toLocaleString(
                              "es-AR",
                              { month: "short" },
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-primary-color fs-6">
                            {turno.paciente.nombre} {turno.paciente.apellido}
                          </h6>
                          <div className="d-flex align-items-center text-secondary-color small mb-2">
                            <span className="badge bg-light text-primary border rounded-pill px-2 py-1 me-2">
                              {turno.especialidad}
                            </span>
                            <span className="opacity-75">
                              {turno.profesional}
                            </span>
                          </div>
                          <div className="text-primary-color fw-bold small d-flex align-items-center">
                            <i className="bi bi-clock-fill me-2"></i>
                            {new Date(turno.fecha_hora).toLocaleTimeString(
                              "es-AR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                            hs
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 px-4 bg-light bg-opacity-50 h-100 d-flex flex-column justify-content-center">
                  <CalendarCheck
                    size={48}
                    className="text-muted-color mb-3 opacity-25 mx-auto"
                  />
                  <h6 className="fw-bold text-muted-color">Agenda Despejada</h6>
                  <p className="text-muted-color small mb-0">
                    No hay compromisos médicos programados para las próximas 48
                    horas.
                  </p>
                </div>
              )}
            </div>
            <div className="card-footer bg-white border-0 p-4 mt-auto">
              <Link
                to="/turnos"
                className="btn btn-outline-primary w-100 py-3 rounded-pill hover-glow"
              >
                Gestionar Agenda <ArrowRight className="ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
