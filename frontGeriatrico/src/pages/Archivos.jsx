import React from 'react';
import CrudView from '../components/CrudView';
import PatientSelect from '../components/PatientSelect';
import { useAuth } from '../context/AuthContext';

import { STORAGE_URL } from '../api/api';

export default function Archivos() {
    const columns = [
        { 
            key: 'paciente_id', 
            label: 'Paciente',
            render: (value, item) => item.paciente ? `${item.paciente.nombre} ${item.paciente.apellido}` : 'General'
        },
        { key: 'tipo', label: 'Tipo de Archivo' },
        { 
            key: 'ruta_archivo', 
            label: 'Archivo',
            render: (value) => <a href={`${STORAGE_URL}/${value}`} target="_blank" rel="noopener noreferrer">Ver Archivo</a>
        },
    ];

    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'administrativo' || user?.role === 'medico';

    return (
        <CrudView
            endpoint="/archivos-adjuntos"
            columns={columns}
            title="Archivos Adjuntos"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={user?.role === 'admin'}
            transformData={(form) => {
                const formData = new FormData();
                Object.keys(form).forEach((key) => {
                    if (form[key] !== null && form[key] !== undefined) {
                        formData.append(key, form[key]);
                    }
                });
                return formData;
            }}
            customFields={{
                paciente_id: (props) => <PatientSelect {...props} required={false} />,
                archivo: ({ name, onChange, className }) => (
                    <input
                        type="file"
                        name={name}
                        onChange={onChange}
                        className={className}
                    />
                ),
            }}
        />
    );
}
