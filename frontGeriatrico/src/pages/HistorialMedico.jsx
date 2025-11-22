import React from 'react';
import CrudView from '../components/CrudView';
import PatientSelect from '../components/PatientSelect';
import { useAuth } from '../context/AuthContext';

export default function HistorialMedico() {
    const columns = [
        { 
            key: 'paciente_id', 
            label: 'Paciente',
            render: (value, item) => item.paciente ? `${item.paciente.nombre} ${item.paciente.apellido}` : 'Sin asignar'
        },
        { key: 'fecha', label: 'Fecha' },
        { key: 'observacion', label: 'Observación' },
        { key: 'medico_responsable', label: 'Médico Responsable' },
    ];

    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'medico' || user?.role === 'enfermero';
    const canDelete = user?.role === 'admin';

    return (
        <CrudView
            endpoint="/historiales-medicos"
            columns={columns}
            title="Historial Médico"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={canDelete}
            customFields={{
                paciente_id: (props) => <PatientSelect {...props} />,
                observacion: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="3"
                    />
                ),
            }}
        />
    );
}
