import React from 'react';
import CrudView from '../components/CrudView';

export default function Habitaciones() {
    const columns = [
        { key: 'numero', label: 'Número de Habitación' },
        { key: 'capacidad', label: 'Capacidad' },
    ];

    return (
        <CrudView
            endpoint="/habitaciones"
            columns={columns}
            title="Gestión de Habitaciones"
        />
    );
}
