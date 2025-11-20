import React, { useEffect, useState } from 'react';
import CrudView from '../components/CrudView';
import { get } from '../api/api';

export default function Camas() {
    const [habitaciones, setHabitaciones] = useState([]);

    useEffect(() => {
        const fetchHabitaciones = async () => {
            try {
                const res = await get('/habitaciones');
                setHabitaciones(res.data || res);
            } catch (error) {
                console.error('Error al cargar habitaciones:', error);
            }
        };
        fetchHabitaciones();
    }, []);

    const columns = [
        {
            key: 'habitacion_id',
            label: 'Habitación',
            render: (value, item) => {
                return item.habitacion
                    ? `Habitación ${item.habitacion.numero}`
                    : `ID: ${value}`;
            }
        },
        { key: 'numero_cama', label: 'Número de Cama' },
        { key: 'estado', label: 'Estado' },
    ];

    return (
        <CrudView
            endpoint="/camas"
            columns={columns}
            title="Gestión de Camas"
            customFields={{
                habitacion_id: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className} required>
                        <option value="">Seleccionar habitación</option>
                        {habitaciones.map((habitacion) => (
                            <option key={habitacion.id} value={habitacion.id}>
                                Habitación {habitacion.numero} (Capacidad: {habitacion.capacidad})
                            </option>
                        ))}
                    </select>
                ),
                estado: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className}>
                        <option value="">Seleccionar estado</option>
                        {['libre', 'ocupada', 'mantenimiento'].map((estado) => (
                            <option key={estado} value={estado}>
                                {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </option>
                        ))}
                    </select>
                ),
            }}
        />
    );
}
