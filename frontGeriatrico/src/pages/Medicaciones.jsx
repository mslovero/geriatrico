import React from 'react';
import CrudView from '../components/CrudView';

export default function Medicaciones() {
    const columns = [
        { key: 'nombre', label: 'Nombre Medicación' },
        { key: 'paciente_id', label: 'ID Paciente' },
    ];

    return (
        <CrudView
            endpoint="/medicaciones"
            columns={columns}
            title="Gestión de Medicaciones"
        />
    );
}
