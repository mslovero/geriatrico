import React from 'react';
import CrudView from '../components/CrudView';

export default function HistorialMedico() {
    const columns = [
        { key: 'paciente_id', label: 'ID Paciente' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'observacion', label: 'Observación' },
        { key: 'medico_responsable', label: 'Médico Responsable' },
    ];

    return (
        <CrudView
            endpoint="/historial-medico"
            columns={columns}
            title="Historial Médico"
            customFields={{
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
