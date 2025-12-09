import React, { useEffect, useState } from 'react';
import CrudView from '../components/CrudView';
import { get } from '../api/api';
import { useAuth } from '../context/AuthContext';

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

    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'administrativo';

    return (
        <CrudView
            endpoint="/camas"
            columns={columns}
            title="Gestión de Camas"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={user?.role === 'admin'}
      formFields={[
        { key: 'habitacion_id', colSize: 12 },
        { key: 'numero_cama', colSize: 6 },
        { key: 'estado', colSize: 6 }
      ]}
      customFields={{
        habitacion_id: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Habitación *</label>
            <select name={name} value={value || ""} onChange={onChange} className={className} required>
              <option value="">Seleccionar habitación</option>
              {habitaciones.map((habitacion) => (
                <option key={habitacion.id} value={habitacion.id}>
                  Habitación {habitacion.numero} (Capacidad: {habitacion.capacidad})
                </option>
              ))}
            </select>
          </div>
        ),
        numero_cama: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Número de Cama *</label>
            <input name={name} value={value || ""} onChange={onChange} className={className} required placeholder="Ej: A" />
          </div>
        ),
        estado: ({ name, value, onChange, className }) => (
          <div>
            <label className="form-label fw-bold">Estado *</label>
            <select name={name} value={value || ""} onChange={onChange} className={className} required>
              <option value="">Seleccionar estado</option>
              {['libre', 'ocupada', 'mantenimiento'].map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
          </div>
        ),
      }}
        />
    );
}
