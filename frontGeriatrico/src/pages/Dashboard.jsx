import React, { useEffect, useState } from 'react';
import { get } from '../api/api';
import { PeopleFill, Hospital, Capsule, FileMedical } from 'react-bootstrap-icons';

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

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <div className="col-md-3 mb-4">
            <div className="card shadow-sm border-0 h-100 fade-in" style={{ borderLeft: `5px solid ${color}` }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{title}</h6>
                            <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>{value}</h2>
                            {subtitle && <small className="text-muted">{subtitle}</small>}
                        </div>
                        <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" 
                             style={{ backgroundColor: `${color}20`, color: color, width: '60px', height: '60px' }}>
                            {icon}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="mb-5">
                <h1 className="display-5 fw-bold mb-2" style={{ color: '#2c5f7e' }}>Panel de Control</h1>
                <p className="text-muted">Resumen general del estado del geriátrico.</p>
            </div>

            <div className="row">
                <StatCard 
                    title="Pacientes Activos" 
                    value={stats.pacientes} 
                    icon={<PeopleFill size={24} />} 
                    color="#0d6efd" 
                />
                <StatCard 
                    title="Camas Disponibles" 
                    value={stats.camasLibres} 
                    icon={<Hospital size={24} />} 
                    color="#198754" 
                    subtitle={`${stats.camasOcupadas} ocupadas`}
                />
                <StatCard 
                    title="Medicaciones" 
                    value={stats.medicaciones} 
                    icon={<Capsule size={24} />} 
                    color="#dc3545" 
                />
                <StatCard 
                    title="Historiales" 
                    value={stats.historiales} 
                    icon={<FileMedical size={24} />} 
                    color="#ffc107" 
                />
            </div>

            <div className="row mt-4">
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Ocupación</h5>
                        </div>
                        <div className="card-body">
                            <div className="progress" style={{ height: '25px' }}>
                                <div 
                                    className="progress-bar bg-success" 
                                    role="progressbar" 
                                    style={{ width: `${(stats.camasLibres / (stats.camasLibres + stats.camasOcupadas || 1)) * 100}%` }}
                                >
                                    Libres ({stats.camasLibres})
                                </div>
                                <div 
                                    className="progress-bar bg-danger" 
                                    role="progressbar" 
                                    style={{ width: `${(stats.camasOcupadas / (stats.camasLibres + stats.camasOcupadas || 1)) * 100}%` }}
                                >
                                    Ocupadas ({stats.camasOcupadas})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
