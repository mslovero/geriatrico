import React from 'react';
import CrudView from '../components/CrudView';
import PatientSelect from '../components/PatientSelect';
import { useAuth } from '../context/AuthContext';

export default function Turnos() {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'medico' || user?.role === 'enfermero' || user?.role === 'administrativo';
    const canDelete = user?.role === 'admin';

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
        { key: 'especialidad', label: 'Especialidad' },
        { key: 'profesional', label: 'Profesional' },
        { key: 'lugar', label: 'Lugar' },
        { 
            key: 'estado', 
            label: 'Estado',
            render: (value) => {
                const colors = {
                    pendiente: 'warning',
                    completado: 'success',
                    cancelado: 'secondary'
                };
                return <span className={`badge bg-${colors[value] || 'primary'}`}>{value.toUpperCase()}</span>;
            }
        },
    ];

    return (
        <CrudView
            endpoint="/turnos-medicos"
            columns={columns}
            title="Agenda y Turnos Médicos"
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
                especialidad: ({ name, value, onChange, className }) => (
                    <input
                        type="text"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        placeholder="Ej: Cardiólogo, Dentista..."
                        required
                    />
                ),
                profesional: ({ name, value, onChange, className }) => (
                    <input
                        type="text"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        placeholder="Nombre del médico..."
                        required
                    />
                ),
                lugar: ({ name, value, onChange, className }) => (
                    <input
                        type="text"
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        placeholder="Dirección o Consultorio..."
                    />
                ),
                estado: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className} required>
                        <option value="pendiente">Pendiente</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                ),
                observaciones: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="2"
                        placeholder="Notas adicionales..."
                    />
                ),
            }}
        />
    );
}
