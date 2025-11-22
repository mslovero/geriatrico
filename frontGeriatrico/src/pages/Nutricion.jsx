import React from 'react';
import CrudView from '../components/CrudView';
import PatientSelect from '../components/PatientSelect';
import { useAuth } from '../context/AuthContext';

export default function Nutricion() {
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
        { key: 'tipo', label: 'Tipo de Dieta' },
        { key: 'consistencia', label: 'Consistencia' },
        { 
            key: 'alergias', 
            label: 'Alergias',
            render: (value) => value ? <span className="text-danger fw-bold">{value}</span> : <span className="text-muted">Ninguna</span>
        },
        { key: 'observaciones', label: 'Observaciones' },
    ];

    return (
        <CrudView
            endpoint="/dietas"
            columns={columns}
            title="Nutrición y Dietas"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={canDelete}
            customFields={{
                paciente_id: (props) => <PatientSelect {...props} />,
                tipo: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className} required>
                        <option value="">Seleccionar tipo...</option>
                        <option value="General">General / Basal</option>
                        <option value="Diabética">Diabética (Sin azúcar)</option>
                        <option value="Hiposódica">Hiposódica (Sin sal)</option>
                        <option value="Hipotósica">Hipotósica (Baja en grasas)</option>
                        <option value="Hipercalórica">Hipercalórica</option>
                        <option value="Astringente">Astringente</option>
                        <option value="Rica en Fibra">Rica en Fibra</option>
                    </select>
                ),
                consistencia: ({ name, value, onChange, className }) => (
                    <select name={name} value={value} onChange={onChange} className={className} required>
                        <option value="Sólida">Sólida (Normal)</option>
                        <option value="Blanda">Blanda / De fácil masticación</option>
                        <option value="Procesada">Procesada / Picada</option>
                        <option value="Papilla">Papilla / Puré</option>
                        <option value="Líquida">Líquida</option>
                    </select>
                ),
                alergias: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="2"
                        placeholder="Listar alergias alimentarias (IMPORTANTE)..."
                    />
                ),
                observaciones: ({ name, value, onChange, className }) => (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={className}
                        rows="3"
                        placeholder="Gustos, rechazos, preferencias..."
                    />
                ),
            }}
        />
    );
}
