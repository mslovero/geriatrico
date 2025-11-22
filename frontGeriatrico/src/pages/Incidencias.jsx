import React, { useState, useEffect } from 'react';
import CrudView from '../components/CrudView';
import PatientSelect from '../components/PatientSelect';
import { useAuth } from '../context/AuthContext';
import { get } from '../api/api';

export default function Incidencias() {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'medico' || user?.role === 'enfermero' || user?.role === 'administrativo';
    const canDelete = user?.role === 'admin';
    
    const [personal, setPersonal] = useState([]);

    useEffect(() => {
        const fetchPersonal = async () => {
            try {
                const [resEnfermeros, resMedicos, resAdmin] = await Promise.all([
                    get('/users?role=enfermero'),
                    get('/users?role=medico'),
                    get('/users?role=administrativo')
                ]);
                
                const lista = [
                    ...(Array.isArray(resEnfermeros) ? resEnfermeros : []),
                    ...(Array.isArray(resMedicos) ? resMedicos : []),
                    ...(Array.isArray(resAdmin) ? resAdmin : [])
                ];
                setPersonal(lista);
            } catch (error) {
                console.error("Error cargando personal:", error);
            }
        };
        fetchPersonal();
    }, []);

    const columns = [
        {
            key: 'paciente_id',
            label: 'Paciente',
            render: (value, item) => {
                return item.paciente
                    ? `${item.paciente.nombre} ${item.paciente.apellido}`
                    : 'ID: ' + value;
            }
        },
        { 
            key: 'fecha_hora', 
            label: 'Fecha y Hora',
            render: (value) => new Date(value).toLocaleString('es-AR')
        },
        { key: 'tipo', label: 'Tipo' },
        { 
            key: 'severidad', 
            label: 'Severidad',
            render: (value) => {
                const colors = {
                    leve: 'success',
                    moderada: 'warning',
                    grave: 'danger',
                    critica: 'dark'
                };
                return <span className={`badge bg-${colors[value] || 'primary'}`}>{value.toUpperCase()}</span>;
            }
        },
        { key: 'descripcion', label: 'Descripción' },
        { 
            key: 'user_id', 
            label: 'Reportado Por',
            render: (value, item) => item.user ? item.user.name : 'Sistema'
        },
    ];

    return (
        <CrudView
            endpoint="/incidencias"
            columns={columns}
            title="Reporte de Incidencias"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={canDelete}
            customFields={{
                paciente_id: (props) => <PatientSelect {...props} />,
                fecha_hora: ({ name, value, onChange, className }) => (
                    <input
                        type="datetime-local"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        required
                    />
                ),
                tipo: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className} required>
                        <option value="">Seleccionar tipo...</option>
                        <option value="Caída">Caída</option>
                        <option value="Agresión">Agresión (Física/Verbal)</option>
                        <option value="Médico">Emergencia Médica</option>
                        <option value="Conducta">Problema de Conducta</option>
                        <option value="Otro">Otro</option>
                    </select>
                ),
                severidad: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className} required>
                        <option value="">Seleccionar severidad...</option>
                        <option value="leve">Leve (Sin daños)</option>
                        <option value="moderada">Moderada (Requiere atención simple)</option>
                        <option value="grave">Grave (Requiere traslado/médico)</option>
                        <option value="critica">Crítica (Riesgo de vida)</option>
                    </select>
                ),
                descripcion: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="3"
                        placeholder="Describa detalladamente qué pasó..."
                        required
                    />
                ),
                acciones_tomadas: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="2"
                        placeholder="¿Qué se hizo al respecto? (Ej: Llamar a emergencias, curación, etc.)"
                    />
                ),
                user_id: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className}>
                        <option value="">Usuario actual (Automático)</option>
                        {personal.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                ),
            }}
        />
    );
}
