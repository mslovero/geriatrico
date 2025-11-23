import React, { useEffect, useState } from 'react';
import { get } from '../api/api';
import { PeopleFill, Hospital, Capsule, FileMedical, Activity, CalendarCheck } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState({
        pacientes: 0,
        camasLibres: 0,
        camasOcupadas: 0,
        medicaciones: 0,
        historiales: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pacientesRes, camasRes, medicacionesRes, historialesRes] = await Promise.all([
                    get('/pacientes'),
                    get('/camas'),
                    get('/medicaciones'),
                    get('/historiales-medicos')
                ]);

                const pacientes = Array.isArray(pacientesRes) ? pacientesRes : (pacientesRes.data || []);
                const camas = Array.isArray(camasRes) ? camasRes : (camasRes.data || []);
                const medicaciones = Array.isArray(medicacionesRes) ? medicacionesRes : (medicacionesRes.data || []);
                const historiales = Array.isArray(historialesRes) ? historialesRes : (historialesRes.data || []);

                const camasOcupadas = camas.filter(c => c.estado === 'ocupada').length;
                const camasLibres = camas.filter(c => c.estado === 'libre').length;

                setStats({
                    pacientes: pacientes.length,
                    camasLibres,
                    camasOcupadas,
                    medicaciones: medicaciones.length,
                    historiales: historiales.length
                });
            } catch (error) {
                console.error("Error loading dashboard data:", error);
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

    const StatCard = ({ title, value, icon, colorClass, subtitle, link }) => (
        <div className="col-md-6 col-lg-3 mb-4">
            <Link to={link} className="text-decoration-none">
                <div className="card h-100 border-0 shadow-sm hover-lift overflow-hidden position-relative">
                    <div className={`position-absolute top-0 end-0 p-3 opacity-10 text-${colorClass}`}>
                        {React.cloneElement(icon, { size: 80 })}
                    </div>
                    <div className="card-body position-relative z-10">
                        <div className={`d-inline-flex align-items-center justify-content-center p-3 rounded-3 bg-${colorClass} bg-opacity-10 text-${colorClass} mb-3`}>
                            {React.cloneElement(icon, { size: 24 })}
                        </div>
                        <h6 className="text-muted text-uppercase fw-bold small letter-spacing-1 mb-1">{title}</h6>
                        <h2 className="display-6 fw-bold text-dark mb-0">{value}</h2>
                        {subtitle && <div className="mt-2 small text-muted d-flex align-items-center gap-1">
                            <i className="bi bi-info-circle"></i> {subtitle}
                        </div>}
                    </div>
                    <div className={`card-footer bg-transparent border-0 pt-0 pb-3`}>
                        <span className={`badge bg-${colorClass} bg-opacity-10 text-${colorClass} rounded-pill px-3`}>
                            Ver detalles <i className="bi bi-arrow-right ms-1"></i>
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h1 className="fw-bold text-gradient mb-2">Panel de Control</h1>
                    <p className="text-muted mb-0">Bienvenido al sistema de gestión integral.</p>
                </div>
                <div className="d-none d-md-block">
                    <Link to="/pacientes" className="btn btn-primary shadow-sm">
                        <i className="bi bi-plus-lg me-2"></i> Nuevo Ingreso
                    </Link>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <StatCard 
                    title="Pacientes Activos" 
                    value={stats.pacientes} 
                    icon={<PeopleFill />} 
                    colorClass="primary" 
                    subtitle="Total registrados"
                    link="/pacientes"
                />
                <StatCard 
                    title="Camas Disponibles" 
                    value={stats.camasLibres} 
                    icon={<Hospital />} 
                    colorClass="success" 
                    subtitle={`${stats.camasOcupadas} ocupadas actualmente`}
                    link="/camas"
                />
                <StatCard 
                    title="Medicaciones" 
                    value={stats.medicaciones} 
                    icon={<Capsule />} 
                    colorClass="danger" 
                    subtitle="En inventario"
                    link="/medicaciones"
                />
                <StatCard 
                    title="Historiales" 
                    value={stats.historiales} 
                    icon={<FileMedical />} 
                    colorClass="warning" 
                    subtitle="Registros médicos"
                    link="/historial-medico"
                />
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Ocupación del Centro</h5>
                            <button className="btn btn-sm btn-light rounded-circle"><i className="bi bi-three-dots-vertical"></i></button>
                        </div>
                        <div className="card-body px-4">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="text-muted small fw-bold text-uppercase">Capacidad Total</span>
                                <span className="fw-bold">{stats.camasLibres + stats.camasOcupadas} Camas</span>
                            </div>
                            <div className="progress mb-4" style={{ height: '12px', borderRadius: '6px' }}>
                                <div 
                                    className="progress-bar bg-gradient-primary" 
                                    role="progressbar" 
                                    style={{ width: `${(stats.camasOcupadas / (stats.camasLibres + stats.camasOcupadas || 1)) * 100}%` }}
                                ></div>
                            </div>
                            
                            <div className="row text-center mt-4">
                                <div className="col-6 border-end">
                                    <h3 className="fw-bold text-success mb-0">{stats.camasLibres}</h3>
                                    <small className="text-muted text-uppercase">Libres</small>
                                </div>
                                <div className="col-6">
                                    <h3 className="fw-bold text-primary mb-0">{stats.camasOcupadas}</h3>
                                    <small className="text-muted text-uppercase">Ocupadas</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100 bg-gradient-primary text-white position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 p-3 opacity-25">
                            <CalendarCheck size={120} />
                        </div>
                        <div className="card-body position-relative z-10 d-flex flex-column justify-content-center p-4">
                            <h4 className="fw-bold mb-3">Agenda del Día</h4>
                            <p className="mb-4 opacity-75">Revise los turnos y actividades programadas para hoy.</p>
                            <Link to="/turnos" className="btn btn-light text-primary fw-bold border-0 shadow-sm w-100 py-3">
                                Ver Calendario <i className="bi bi-arrow-right ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
