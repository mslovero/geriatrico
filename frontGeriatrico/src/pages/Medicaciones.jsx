import React from 'react';
import CrudView from '../components/CrudView';
import PatientSelect from '../components/PatientSelect';
import { useAuth } from '../context/AuthContext';

export default function Medicaciones() {
    const columns = [
        { key: 'nombre', label: 'Nombre Medicación' },
        { key: 'dosis', label: 'Dosis' },
        { key: 'frecuencia', label: 'Frecuencia' },
        { key: 'observaciones', label: 'Observaciones' },
        { 
            key: 'paciente_id', 
            label: 'Paciente',
            render: (value, item) => item.paciente ? `${item.paciente.nombre} ${item.paciente.apellido}` : 'Sin asignar'
        },
    ];

    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'medico';

    return (
        <CrudView
            endpoint="/medicaciones"
            columns={columns}
            title="Gestión de Medicaciones"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={user?.role === 'admin'}
            customFields={{
                paciente_id: (props) => <PatientSelect {...props} />,
                observaciones: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="2"
                    />
                ),
            }}
        />
    );
}
