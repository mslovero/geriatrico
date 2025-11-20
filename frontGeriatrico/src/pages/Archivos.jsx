import React from 'react';
import CrudView from '../components/CrudView';

export default function Archivos() {
    const columns = [
        { key: 'paciente_id', label: 'ID Paciente' },
        { key: 'historial_medico_id', label: 'ID Historial' },
        { key: 'tipo', label: 'Tipo de Archivo' },
        { key: 'archivo', label: 'Archivo' },
    ];

    return (
        <CrudView
            endpoint="/archivos-adjuntos"
            columns={columns}
            title="Gestión de Archivos"
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
